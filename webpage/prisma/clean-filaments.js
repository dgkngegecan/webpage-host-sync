const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🧹 Cleaning up filaments...');

    // Delete all filaments
    const result = await prisma.filament.deleteMany({});

    console.log(`✅ Deleted ${result.count} filaments.`);
    console.log('You can now add real filaments with valid images via the Admin Panel.');
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
