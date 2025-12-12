'use server';

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getPricingConfig() {
    const configs = await prisma.pricingConfig.findMany();
    const configMap: Record<string, number> = {};

    configs.forEach(c => {
        configMap[c.key] = c.value;
    });

    // Defaults if not set
    if (configMap['baseFee'] === undefined) configMap['baseFee'] = 75;
    if (configMap['markup'] === undefined) configMap['markup'] = 3.0;

    return configMap;
}

export async function updatePricingConfig(key: string, value: number) {
    await prisma.pricingConfig.upsert({
        where: { key },
        update: { value },
        create: { key, value }
    });
    revalidatePath('/admin/pricing');
    revalidatePath('/quote/instant');
}

export async function updateFilamentPrice(id: string, pricePerGram: number, density: number) {
    await prisma.filament.update({
        where: { id },
        data: { pricePerGram, density }
    });
    revalidatePath('/admin/pricing');
    revalidatePath('/quote/instant');
}

export async function getFilaments() {
    return await prisma.filament.findMany({
        orderBy: { type: 'asc' }
    });
}
