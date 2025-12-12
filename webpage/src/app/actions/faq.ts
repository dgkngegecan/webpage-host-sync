'use server'

import prisma from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";

export async function getFAQs() {
    return await prisma.fAQ.findMany({
        orderBy: { order: 'asc' }
    });
}

export async function createFAQ(data: { question: string; answer: string; order?: number }) {
    const faq = await prisma.fAQ.create({
        data
    });
    revalidatePath('/about');
    revalidatePath('/admin/faq');
    // revalidateTag('faqs');
    return faq;
}

export async function deleteFAQ(id: string) {
    await prisma.fAQ.delete({ where: { id } });
    revalidatePath('/about');
    revalidatePath('/admin/faq');
    // revalidateTag('faqs');
}

export async function updateFAQ(id: string, data: { question: string; answer: string; order?: number }) {
    const faq = await prisma.fAQ.update({
        where: { id },
        data
    });
    revalidatePath('/about');
    revalidatePath('/admin/faq');
    // revalidateTag('faqs');
    return faq;
}
