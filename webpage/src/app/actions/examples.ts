'use server'

import prisma from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { r2, R2_BUCKET_NAME, R2_PUBLIC_URL } from "@/lib/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateStorageKey } from "@/lib/storage-utils";

export async function getExamples() {
    return await prisma.examplePrint.findMany({
        orderBy: { createdAt: 'desc' }
    });
}

export async function createExample(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const material = formData.get("material") as string;
    const printerInfo = formData.get("printerInfo") as string;
    const layerHeight = formData.get("layerHeight") as string;
    const imageFile = formData.get("image") as File;

    let imageUrl = undefined;

    if (imageFile && imageFile.size > 0) {
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        const key = generateStorageKey('examples', imageFile.name);

        await r2.send(new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: imageFile.type,
        }));

        imageUrl = `${R2_PUBLIC_URL}/${key}`;
    }

    const example = await prisma.examplePrint.create({
        data: {
            title,
            description,
            category,
            material,
            printerInfo,
            layerHeight,
            imageUrl
        }
    });

    revalidatePath('/');
    revalidatePath('/prints');
    revalidatePath('/admin/examples');
    // revalidateTag('examples');
    return example;
}

export async function updateExample(id: string, formData: FormData) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const material = formData.get("material") as string;
    const printerInfo = formData.get("printerInfo") as string;
    const layerHeight = formData.get("layerHeight") as string;
    const imageFile = formData.get("image") as File;

    let imageUrl = undefined;

    if (imageFile && imageFile.size > 0) {
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        const key = generateStorageKey('examples', imageFile.name);

        await r2.send(new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: imageFile.type,
        }));

        imageUrl = `${R2_PUBLIC_URL}/${key}`;
    }

    const example = await prisma.examplePrint.update({
        where: { id },
        data: {
            title,
            description,
            category,
            material,
            printerInfo,
            layerHeight,
            ...(imageUrl && { imageUrl }),
        }
    });

    revalidatePath('/');
    revalidatePath('/prints');
    revalidatePath('/admin/examples');
    // revalidateTag('examples');
    return example;
}

export async function deleteExample(id: string) {
    await prisma.examplePrint.delete({ where: { id } });
    revalidatePath('/');
    revalidatePath('/prints');
    revalidatePath('/admin/examples');
    // revalidateTag('examples');
}
