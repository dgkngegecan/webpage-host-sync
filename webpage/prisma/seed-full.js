const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Helper to get random item from array
const random = (arr) => arr[Math.floor(Math.random() * arr.length)];
// Helper for random int
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
// Helper for random float
const randomFloat = (min, max) => parseFloat((Math.random() * (max - min) + min).toFixed(2));

async function main() {
    console.log('🌱 Starting full database seed...');

    // 1. Clean Database
    await prisma.printRequest.deleteMany();
    await prisma.address.deleteMany();
    await prisma.filament.deleteMany();
    await prisma.printer.deleteMany();
    await prisma.user.deleteMany();

    console.log('🧹 Database cleaned.');

    // 2. Create Admin & Users
    const password = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);

    const admin = await prisma.user.create({
        data: {
            email: 'admin@gegebaski.com',
            name: 'Admin User',
            password: password,
            role: 'ADMIN',
            companyName: 'GegeBaskı Teknoloji',
        }
    });

    const users = [];
    const userNames = [
        'Ahmet Yılmaz', 'Ayşe Demir', 'Mehmet Kaya', 'Fatma Çelik', 'Mustafa Öztürk',
        'Zeynep Arslan', 'Emre Aydın', 'Selin Yıldız', 'Burak Yılmaz', 'Elif Kara',
        'Caner Erkin', 'Gamze Bulut', 'Volkan Demirel', 'Hande Ercel', 'Kerem Bursin'
    ];

    for (const name of userNames) {
        const email = name.toLowerCase().replace(' ', '.') + '@example.com';
        const user = await prisma.user.create({
            data: {
                email,
                name,
                password: userPassword,
                role: 'USER',
                phone: '05' + randomInt(30, 55) + randomInt(1000000, 9999999),
                companyName: Math.random() > 0.7 ? name + ' Ltd. Şti.' : null,
            }
        });
        users.push(user);
        
        // Create Address for user
        await prisma.address.create({
            data: {
                userId: user.id,
                title: 'Ev Adresi',
                type: 'SHIPPING',
                city: random(['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya']),
                district: random(['Merkez', 'Kadıköy', 'Çankaya', 'Nilüfer', 'Muratpaşa']),
                addressDetail: 'Örnek Mahallesi, Test Sokak No:' + randomInt(1, 100),
            }
        });
    }

    console.log(`👥 Created ${users.length + 1} users.`);

    // 3. Create Filaments (Rich Inventory)
    const brands = ['Esun', 'Porima', 'Bambu Lab', 'Prusament', 'Sunlu'];
    const materials = [
        { type: 'PLA', density: 1.24, price: 1.5 },
        { type: 'PLA+', density: 1.25, price: 1.8 },
        { type: 'PETG', density: 1.27, price: 1.8 },
        { type: 'ABS', density: 1.04, price: 2.0 },
        { type: 'ASA', density: 1.07, price: 2.2 },
        { type: 'TPU', density: 1.21, price: 2.5 },
        { type: 'PA-CF', density: 1.00, price: 4.5 },
    ];
    const colors = [
        'Siyah', 'Beyaz', 'Gri', 'Kırmızı', 'Mavi', 'Turuncu', 'Sarı', 'Yeşil', 
        'Mor', 'Altın', 'Gümüş', 'Şeffaf', 'Galaxy Black'
    ];

    const filaments = [];
    for (let i = 0; i < 40; i++) {
        const mat = random(materials);
        const color = random(colors);
        const brand = random(brands);
        
        const filament = await prisma.filament.create({
            data: {
                type: mat.type,
                color: color,
                brand: brand,
                stock: randomInt(0, 5000), // 0 to 5kg
                pricePerGram: mat.price,
                density: mat.density,
                imageUrl: `/images/filaments/${color.toLowerCase()}-${mat.type.toLowerCase()}.jpg` // Placeholder
            }
        });
        filaments.push(filament);
    }
    console.log(`🧵 Created ${filaments.length} filament types.`);

    // 4. Create Printers
    const printerModels = [
        { name: 'Bambu Lab X1C-1', model: 'X1 Carbon', status: 'PRINTING' },
        { name: 'Bambu Lab X1C-2', model: 'X1 Carbon', status: 'IDLE' },
        { name: 'Bambu Lab P1P', model: 'P1P', status: 'MAINTENANCE' },
        { name: 'Prusa MK4-1', model: 'MK4', status: 'PRINTING' },
        { name: 'Prusa MK4-2', model: 'MK4', status: 'IDLE' },
        { name: 'Voron 2.4', model: 'Voron 2.4 350mm', status: 'OFFLINE' },
        { name: 'Elegoo Saturn 3', model: 'Saturn 3 Ultra', status: 'IDLE' },
    ];

    for (const p of printerModels) {
        await prisma.printer.create({ data: p });
    }
    console.log(`🖨️ Created ${printerModels.length} printers.`);

    // 5. Create Print Requests (History)
    const statuses = ['PENDING', 'APPROVED', 'PRINTING', 'PACKAGING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    const serviceTypes = ['FDM', 'FDM', 'FDM', 'SLA', 'Design']; // Weighted towards FDM

    for (let i = 0; i < 100; i++) {
        const user = random(users);
        const status = random(statuses);
        const service = random(serviceTypes);
        const filament = random(filaments);
        
        // Date logic: Spread over last 3 months
        const date = new Date();
        date.setDate(date.getDate() - randomInt(0, 90));

        let requestData = {
            userId: user.id,
            serviceType: service,
            description: `Sipariş #${randomInt(1000, 9999)} - ${service} Baskı`,
            fileUrl: 'https://example.com/model.stl',
            material: `${filament.type} - ${filament.color}`,
            color: filament.color,
            status: status,
            createdAt: date,
            updatedAt: date,
        };

        // Add pricing and details based on status
        if (status !== 'PENDING' && status !== 'CANCELLED') {
            const weight = randomFloat(50, 500);
            const price = weight * filament.pricePerGram * 2.5; // Markup
            
            requestData.estimatedPrice = price;
            requestData.finalPrice = price;
            requestData.usedFilament = weight;
            
            if (Math.random() > 0.8) {
                requestData.discountApplied = 10; // 10% discount sometimes
                requestData.finalPrice = price * 0.9;
            }
        }

        if (['SHIPPED', 'DELIVERED'].includes(status)) {
            requestData.trackingCode = 'TR' + randomInt(100000000, 999999999);
            requestData.trackingUrl = 'https://kargotakip.com/' + requestData.trackingCode;
        }

        if (status === 'DELIVERED' && Math.random() > 0.6) {
            requestData.rating = randomInt(3, 5);
            requestData.feedback = random([
                'Harika baskı, teşekkürler!',
                'Çok hızlı kargo.',
                'Yüzey kalitesi beklediğimden iyi.',
                'Biraz pürüzlü ama iş görür.',
                'Mükemmel paketleme.'
            ]);
        }

        await prisma.printRequest.create({ data: requestData });
    }

    console.log(`📦 Created 100 print requests.`);
    console.log('✅ Seed completed successfully!');
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
