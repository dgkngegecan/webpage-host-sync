'use server'

import prisma from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { r2, R2_BUCKET_NAME, R2_PUBLIC_URL } from "@/lib/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { generateStorageKey } from "@/lib/storage-utils";

export async function getFilaments() {
    return await prisma.filament.findMany({
        orderBy: { type: 'asc' }
    });
}

export async function createFilament(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const type = formData.get("type") as string;
    const color = formData.get("color") as string;
    const brand = formData.get("brand") as string;
    const stock = parseInt(formData.get("stock") as string);
    const pricePerGram = parseFloat(formData.get("pricePerGram") as string);
    const density = formData.get("density") ? parseFloat(formData.get("density") as string) : null;
    const tempNozzle = formData.get("tempNozzle") as string;
    const tempBed = formData.get("tempBed") as string;
    const additives = formData.get("additives") as string;
    const imageFile = formData.get("image") as File;

    let imageUrl = undefined;

    if (imageFile && imageFile.size > 0) {
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        const key = generateStorageKey('filaments', imageFile.name);

        await r2.send(new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: imageFile.type,
        }));

        imageUrl = `${R2_PUBLIC_URL}/${key}`;
    }

    const filament = await prisma.filament.create({
        data: {
            type,
            color,
            brand,
            stock,
            pricePerGram,
            density,
            tempNozzle,
            tempBed,
            additives,
            imageUrl,
        }
    });

    revalidatePath("/admin/inventory");
    revalidatePath("/about");
    // revalidateTag('filaments');
    return filament;
}

export async function updateFilament(id: string, formData: FormData) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const type = formData.get("type") as string;
    const color = formData.get("color") as string;
    const brand = formData.get("brand") as string;
    const stock = parseInt(formData.get("stock") as string);
    const pricePerGram = parseFloat(formData.get("pricePerGram") as string);
    const density = formData.get("density") ? parseFloat(formData.get("density") as string) : null;
    const tempNozzle = formData.get("tempNozzle") as string;
    const tempBed = formData.get("tempBed") as string;
    const additives = formData.get("additives") as string;
    const imageFile = formData.get("image") as File;

    let imageUrl = undefined;

    if (imageFile && imageFile.size > 0) {
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        const key = generateStorageKey('filaments', imageFile.name);

        await r2.send(new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: imageFile.type,
        }));

        imageUrl = `${R2_PUBLIC_URL}/${key}`;
    }

    const filament = await prisma.filament.update({
        where: { id },
        data: {
            type,
            color,
            brand,
            stock,
            pricePerGram,
            density,
            tempNozzle,
            tempBed,
            additives,
            ...(imageUrl && { imageUrl }),
        }
    });

    revalidatePath("/admin/inventory");
    revalidatePath("/about");
    // revalidateTag('filaments');
    return filament;
}

export async function updateFilamentStock(id: string, stock: number) {
    const filament = await prisma.filament.update({
        where: { id },
        data: { stock }
    });
    revalidatePath('/admin/inventory');
    // revalidateTag('filaments');
    return filament;
}

export async function deleteFilament(id: string) {
    await prisma.filament.delete({ where: { id } });
    revalidatePath('/quote');
    revalidatePath('/admin/inventory');
    // revalidateTag('filaments');
}
