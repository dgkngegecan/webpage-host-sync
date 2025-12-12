const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const password = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@gegebaski.com' },
        update: {},
        create: {
            email: 'admin@gegebaski.com',
            name: 'Admin User',
            password: password,
            role: 'ADMIN',
        },
    });

    const user = await prisma.user.upsert({
        where: { email: 'user@gegebaski.com' },
        update: {},
        create: {
            email: 'user@gegebaski.com',
            name: 'Test User',
            password: userPassword,
            role: 'USER',
        },
    });

    console.log({ admin, user });

    // Seed Filaments
    const filaments = [
        { type: 'PLA', color: 'Siyah', brand: 'Esun', stock: 2000, pricePerGram: 1.5, density: 1.24, imageUrl: '/images/filaments/black-pla.jpg' },
        { type: 'PLA', color: 'Beyaz', brand: 'Esun', stock: 1500, pricePerGram: 1.5, density: 1.24, imageUrl: '/images/filaments/white-pla.jpg' },
        { type: 'PETG', color: 'Gri', brand: 'Porima', stock: 1000, pricePerGram: 1.8, density: 1.27, imageUrl: '/images/filaments/grey-petg.jpg' },
        { type: 'ABS', color: 'Siyah', brand: 'Esun', stock: 1000, pricePerGram: 2.0, density: 1.04, imageUrl: '/images/filaments/black-abs.jpg' },
        { type: 'ASA', color: 'Beyaz', brand: 'Porima', stock: 800, pricePerGram: 2.2, density: 1.07, imageUrl: '/images/filaments/white-asa.jpg' },
        { type: 'TPU', color: 'Mavi', brand: 'SainSmart', stock: 500, pricePerGram: 2.5, density: 1.21, imageUrl: '/images/filaments/blue-tpu.jpg' },
        { type: 'PA-CF', color: 'Siyah', brand: 'Esun', stock: 400, pricePerGram: 4.0, density: 1.00, imageUrl: '/images/filaments/black-pacf.jpg' },
    ];

    // Clear existing filaments to avoid duplicates or outdated data
    await prisma.filament.deleteMany({});

    for (const f of filaments) {
        await prisma.filament.create({ data: f });
    }

    // Seed Printers
    const printers = [
        { name: 'Bambu Lab X1C', model: 'X1 Carbon', status: 'ONLINE', description: 'Yüksek hızlı FDM yazıcı', imageUrl: '/images/printers/x1c.jpg' },
        { name: 'Prusa MK4', model: 'MK4', status: 'PRINTING', description: 'Güvenilir iş atı', imageUrl: '/images/printers/mk4.jpg' },
        { name: 'Elegoo Saturn 3', model: 'Saturn 3 Ultra', status: 'OFFLINE', description: '12K Reçine Yazıcı', imageUrl: '/images/printers/saturn3.jpg' },
    ];

    for (const p of printers) {
        await prisma.printer.create({ data: p });
    }

    // Seed Requests
    await prisma.printRequest.create({
        data: {
            userId: user.id,
            serviceType: 'FDM',
            description: 'Bir adet kulaklık standı, siyah PLA ile.',
            material: 'PLA - Siyah',
            status: 'PENDING',
            fileUrl: 'https://example.com/headphone-stand.stl'
        }
    });

    await prisma.printRequest.create({
        data: {
            userId: user.id,
            serviceType: 'SLA',
            description: 'Dungeons & Dragons figürü, detaylı.',
            material: 'Reçine - Gri',
            status: 'PRINTING',
            fileUrl: 'https://example.com/dnd-figure.stl',
            estimatedPrice: 450.0
        }
    });

    await prisma.printRequest.create({
        data: {
            userId: user.id,
            serviceType: 'FDM',
            description: 'Dişli çark prototipi.',
            material: 'PETG - Gri',
            status: 'DELIVERED',
            fileUrl: 'https://example.com/gear.stl',
            finalPrice: 120.0,
            trackingCode: 'TR123456789',
            trackingUrl: 'https://kargo.com/track/TR123456789',
            rating: 5,
            feedback: 'Harika baskı kalitesi, teşekkürler!'
        }
    });

    console.log('Seed data created successfully');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
