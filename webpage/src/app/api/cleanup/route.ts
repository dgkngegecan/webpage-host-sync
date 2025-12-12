import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { revalidateTag } from 'next/cache';

export async function GET() {
    try {
        const totalExamples = await prisma.examplePrint.count();
        const sampleExamples = await prisma.examplePrint.findMany({
            take: 5,
            select: { id: true, imageUrl: true }
        });

        const deletedExamples = await prisma.examplePrint.deleteMany({
            where: {
                OR: [
                    { imageUrl: { contains: 'drive.google.com' } },
                    { imageUrl: { contains: 'photos.fife.usercontent.google.com' } },
                    { imageUrl: { contains: 'googleusercontent.com' } },
                    { imageUrl: { contains: 'wikimedia.org' } }
                ]
            }
        });

        return NextResponse.json({
            success: true,
            debug: {
                totalExamples,
                sampleExamples
            },
            deleted: {
                examples: deletedExamples.count,
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
