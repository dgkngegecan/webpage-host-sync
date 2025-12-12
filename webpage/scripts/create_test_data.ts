import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    // 1. Create Test User
    const password = await hash('password123', 12);
    const user = await prisma.user.upsert({
        where: { email: 'testuser@example.com' },
        update: {},
        create: {
            email: 'testuser@example.com',
            name: 'Test User',
            password,
            role: 'USER'
        }
    });

    console.log('Test user created:', user.email);

    // 2. Create Print Request
    const request = await prisma.printRequest.create({
        data: {
            userId: user.id,
            serviceType: 'FDM Baskı',
            description: 'Test Cube 10mm',
            fileUrl: 'https://pub-82367699765d447e9202f54223253701.r2.dev/test_cube.stl', // Dummy URL
            material: 'PLA - Beyaz',
            color: 'Beyaz',
            status: 'PENDING',
            estimatedPrice: 50.0,
            finalPrice: 50.0
        }
    });

    console.log('Test request created:', request.id);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
