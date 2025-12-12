const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const printers = await prisma.printer.findMany();
    console.log('Printers:', JSON.stringify(printers, null, 2));

    const images = await prisma.storedImage.findMany({
        select: { id: true, mimeType: true, data: false } // Don't log huge buffers
    });
    console.log('StoredImages:', JSON.stringify(images, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
