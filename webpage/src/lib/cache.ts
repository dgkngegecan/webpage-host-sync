import { unstable_cache } from 'next/cache';
import prisma from './prisma';

export const getCachedPrinters = unstable_cache(
    async () => {
        return await prisma.printer.findMany({
            orderBy: { name: 'asc' }
        });
    },
    ['printers-public'],
    { revalidate: 3600, tags: ['printers'] }
);

export const getCachedExamples = unstable_cache(
    async () => {
        return await prisma.examplePrint.findMany({
            orderBy: { createdAt: 'desc' }
        });
    },
    ['examples-public'],
    { revalidate: 3600, tags: ['examples'] }
);

export const getCachedFAQs = unstable_cache(
    async () => {
        return await prisma.fAQ.findMany({
            orderBy: { order: 'asc' }
        });
    },
    ['faqs-public'],
    { revalidate: 3600, tags: ['faqs'] }
);

export const getCachedFilaments = unstable_cache(
    async () => {
        return await prisma.filament.findMany({
            where: { stock: { gt: 0 } },
            orderBy: { type: 'asc' }
        });
    },
    ['filaments-public'],
    { revalidate: 3600, tags: ['filaments'] }
);
