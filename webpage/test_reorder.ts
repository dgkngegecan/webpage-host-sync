import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testReorderLogic() {
    try {
        // 1. Find a completed order
        const originalRequest = await prisma.printRequest.findFirst({
            where: {
                status: { in: ['DELIVERED', 'SHIPPED'] }
            }
        });

        if (!originalRequest) {
            console.log("No completed orders found to test reorder.");
            return;
        }

        console.log(`Testing reorder for Request ID: ${originalRequest.id}`);

        // 2. Simulate Reorder Logic
        const newRequest = await prisma.printRequest.create({
            data: {
                userId: originalRequest.userId,
                serviceType: originalRequest.serviceType,
                description: originalRequest.description,
                fileUrl: originalRequest.fileUrl, // Optimization: Reusing the same file URL
                material: originalRequest.material,
                color: originalRequest.color,
                status: 'PENDING',
                estimatedPrice: originalRequest.estimatedPrice,
            }
        });

        console.log(`Successfully created new reorder Request ID: ${newRequest.id}`);
        console.log(`Original File URL: ${originalRequest.fileUrl}`);
        console.log(`New Request File URL: ${newRequest.fileUrl}`);

        if (originalRequest.fileUrl === newRequest.fileUrl) {
            console.log("PASS: File URL preserved.");
        } else {
            console.error("FAIL: File URL mismatch.");
        }

    } catch (error) {
        console.error("Reorder test failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

testReorderLogic();
