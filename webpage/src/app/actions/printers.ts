'use server'

import prisma from "@/lib/prisma";
import { PrinterStatus } from "@/types/enums";
import { revalidatePath, revalidateTag } from "next/cache";
import { r2, R2_BUCKET_NAME, R2_PUBLIC_URL } from "@/lib/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateStorageKey } from "@/lib/storage-utils";

export async function getPrinters() {
    return await prisma.printer.findMany({
        orderBy: { createdAt: 'desc' }
    });
}

export async function createPrinter(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const name = formData.get("name") as string;
    const model = formData.get("model") as string;
    const description = formData.get("description") as string;
    const buildVolume = formData.get("buildVolume") as string;
    const layerHeight = formData.get("layerHeight") as string;
    const materials = formData.get("materials") as string;
    const features = formData.get("features") as string;
    const imageFile = formData.get("image") as File;

    let imageUrl = undefined;

    if (imageFile && imageFile.size > 0) {
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        const key = generateStorageKey('printers', imageFile.name);

        await r2.send(new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: imageFile.type,
        }));

        imageUrl = `${R2_PUBLIC_URL}/${key}`;
    }

    const printer = await prisma.printer.create({
        data: {
            name,
            model,
            description,
            buildVolume,
            layerHeight,
            materials,
            features,
            status: 'ONLINE',
            imageUrl
        }
    });

    revalidatePath('/');
    revalidatePath('/admin/printers');
    revalidatePath('/admin/inventory');
    // revalidateTag('printers');
    return printer;
}

export async function updatePrinter(id: string, formData: FormData) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const name = formData.get("name") as string;
    const model = formData.get("model") as string;
    const description = formData.get("description") as string;
    const buildVolume = formData.get("buildVolume") as string;
    const layerHeight = formData.get("layerHeight") as string;
    const materials = formData.get("materials") as string;
    const features = formData.get("features") as string;
    const imageFile = formData.get("image") as File;

    let imageUrl = undefined;

    if (imageFile && imageFile.size > 0) {
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        const key = generateStorageKey('printers', imageFile.name);

        await r2.send(new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: imageFile.type,
        }));

        imageUrl = `${R2_PUBLIC_URL}/${key}`;
    }

    const printer = await prisma.printer.update({
        where: { id },
        data: {
            name,
            model,
            description,
            buildVolume,
            layerHeight,
            materials,
            features,
            ...(imageUrl && { imageUrl }),
        }
    });

    revalidatePath('/');
    revalidatePath('/admin/printers');
    revalidatePath('/admin/inventory');
    // revalidateTag('printers');
    return printer;
}

export async function updatePrinterStatus(id: string, status: PrinterStatus) {
    const printer = await prisma.printer.update({
        where: { id },
        data: { status }
    });
    revalidatePath('/');
    revalidatePath('/admin/printers');
    // revalidateTag('printers');
    return printer;
}

export async function deletePrinter(id: string) {
    await prisma.printer.delete({ where: { id } });
    revalidatePath('/');
    revalidatePath('/admin/printers');
    revalidatePath('/admin/inventory');
    // revalidateTag('printers');
}
