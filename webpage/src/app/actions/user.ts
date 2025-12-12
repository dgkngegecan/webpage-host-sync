'use server'

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateUserProfile(data: {
    name?: string;
    phone?: string;
    tckn?: string;
    companyName?: string;
    taxOffice?: string;
    taxNumber?: string;
    defaultMaterial?: string;
    defaultQuality?: string;
}) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new Error("Unauthorized");

    await prisma.user.update({
        where: { email: session.user.email },
        data: {
            ...data
        }
    });

    revalidatePath('/dashboard');
}

export async function addAddress(data: {
    title: string;
    type: string;
    city: string;
    district: string;
    addressDetail: string;
    zipCode?: string;
}) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new Error("Oturum açmanız gerekiyor.");

    if (!session.user.id) {
        console.error("User ID missing in session:", session.user);
        throw new Error("Kullanıcı kimliği eksik. Lütfen çıkış yapıp tekrar giriş yapın.");
    }

    try {
        await prisma.address.create({
            data: {
                userId: session.user.id,
                ...data
            }
        });
        revalidatePath('/dashboard');
    } catch (error) {
        console.error("Address creation failed:", error);
        throw new Error("Adres kaydedilemedi: " + (error as Error).message);
    }
}

export async function deleteAddress(id: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new Error("Unauthorized");

    // Verify ownership
    const address = await prisma.address.findUnique({ where: { id } });
    if (address?.userId !== session.user.id) throw new Error("Unauthorized");

    await prisma.address.delete({ where: { id } });
    revalidatePath('/dashboard');
}

export async function updateConsents(data: {
    termsAccepted?: boolean;
    kvkkAccepted?: boolean;
    marketingAccepted?: boolean;
}) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new Error("Unauthorized");

    const now = new Date();
    const updateData: any = {};

    if (data.termsAccepted) updateData.termsAccepted = now;
    if (data.kvkkAccepted) updateData.kvkkAccepted = now;
    if (data.marketingAccepted) updateData.marketingAccepted = now;

    await prisma.user.update({
        where: { email: session.user.email },
        data: updateData
    });

    revalidatePath('/dashboard');
}
