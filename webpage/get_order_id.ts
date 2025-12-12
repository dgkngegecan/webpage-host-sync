import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const order = await prisma.printRequest.findFirst({
            where: {
                status: {
                    in: ['APPROVED', 'PRINTING', 'SHIPPED', 'DELIVERED']
                }
            },
            select: { id: true }
        });
        console.log("ORDER_ID:", order?.id);
    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
