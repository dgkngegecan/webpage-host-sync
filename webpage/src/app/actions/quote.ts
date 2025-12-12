'use server'

import prisma from "@/lib/prisma";
import { r2, R2_BUCKET_NAME, R2_PUBLIC_URL } from "@/lib/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { generateStorageKey } from "@/lib/storage-utils";

export async function submitQuote(formData: FormData) {
    try {
        const session = await getServerSession(authOptions);

        const file = formData.get("file") as File;
        const filamentId = formData.get("filamentId") as string;
        const priceLow = parseFloat(formData.get("priceLow") as string);
        const priceHigh = parseFloat(formData.get("priceHigh") as string);
        const volume = parseFloat(formData.get("volume") as string);
        const weight = parseFloat(formData.get("weight") as string);
        const contactInfo = formData.get("contactInfo") as string;

        if (!file || !filamentId) {
            throw new Error("Missing required fields");
        }

        // Upload file to R2
        const buffer = Buffer.from(await file.arrayBuffer());
        const key = generateStorageKey('quotes', file.name);

        await r2.send(new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: file.type,
        }));

        const fileUrl = `${R2_PUBLIC_URL}/${key}`;

        // Get filament details for description
        const filament = await prisma.filament.findUnique({
            where: { id: filamentId }
        });

        const description = `
            Instant Quote Request
            Contact: ${contactInfo}
            Material: ${filament?.type} - ${filament?.color}
            Volume: ${volume.toFixed(2)} cm3
            Weight: ${weight.toFixed(2)} g
            Estimated Price Range: ${priceLow} - ${priceHigh} TL
        `.trim();

        // Create PrintRequest
        const printRequest = await prisma.printRequest.create({
            data: {
                userId: session?.user?.id, // Link if logged in
                serviceType: "Instant Quote (FDM)",
                description: description,
                fileUrl: fileUrl,
                material: filament?.type,
                color: filament?.color,
                estimatedPrice: priceHigh, // Store the upper bound as the conservative estimate
                status: "PENDING",
                adminNote: `Range: ${priceLow} - ${priceHigh} TL. Contact: ${contactInfo}`
            }
        });

        revalidatePath('/admin/requests');
        return { success: true, id: printRequest.id };

    } catch (error) {
        console.error("Error submitting quote:", error);
        return { success: false, error: "Failed to submit quote" };
    }
}
