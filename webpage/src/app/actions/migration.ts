'use server'

import prisma from "@/lib/prisma";
import { r2, R2_BUCKET_NAME, R2_PUBLIC_URL } from "@/lib/r2";
import { CopyObjectCommand, DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateStorageKey } from "@/lib/storage-utils";
import { revalidatePath } from "next/cache";

export async function migrateAllFiles() {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    let stats = {
        total: 0,
        migrated: 0,
        skipped: 0,
        errors: 0,
        details: [] as string[]
    };

    try {
        // 1. Migrate PrintRequests (Quotes)
        const requests = await prisma.printRequest.findMany({
            where: { fileUrl: { not: null } }
        });

        for (const req of requests) {
            if (!req.fileUrl) continue;
            stats.total++;
            const result = await migrateFile(req.fileUrl, 'quotes', req.createdAt);
            if (result.success && result.newUrl) {
                await prisma.printRequest.update({
                    where: { id: req.id },
                    data: { fileUrl: result.newUrl }
                });
                stats.migrated++;
            } else if (result.skipped) {
                stats.skipped++;
            } else {
                stats.errors++;
                stats.details.push(`Request ${req.id}: ${result.error}`);
            }
        }

        // 2. Migrate Printers
        const printers = await prisma.printer.findMany({
            where: { imageUrl: { not: null } }
        });

        for (const printer of printers) {
            if (!printer.imageUrl) continue;
            stats.total++;
            const result = await migrateFile(printer.imageUrl, 'printers', printer.createdAt);
            if (result.success && result.newUrl) {
                await prisma.printer.update({
                    where: { id: printer.id },
                    data: { imageUrl: result.newUrl }
                });
                stats.migrated++;
            } else if (result.skipped) {
                stats.skipped++;
            } else {
                stats.errors++;
                stats.details.push(`Printer ${printer.id}: ${result.error}`);
            }
        }

        // 3. Migrate Filaments
        const filaments = await prisma.filament.findMany({
            where: { imageUrl: { not: null } }
        });

        for (const filament of filaments) {
            if (!filament.imageUrl) continue;
            stats.total++;
            const result = await migrateFile(filament.imageUrl, 'filaments', filament.createdAt);
            if (result.success && result.newUrl) {
                await prisma.filament.update({
                    where: { id: filament.id },
                    data: { imageUrl: result.newUrl }
                });
                stats.migrated++;
            } else if (result.skipped) {
                stats.skipped++;
            } else {
                stats.errors++;
                stats.details.push(`Filament ${filament.id}: ${result.error}`);
            }
        }

        // 4. Migrate Example Prints
        const examples = await prisma.examplePrint.findMany({
            where: { imageUrl: { not: null } }
        });

        for (const example of examples) {
            if (!example.imageUrl) continue;
            stats.total++;
            const result = await migrateFile(example.imageUrl, 'examples', example.createdAt);
            if (result.success && result.newUrl) {
                await prisma.examplePrint.update({
                    where: { id: example.id },
                    data: { imageUrl: result.newUrl }
                });
                stats.migrated++;
            } else if (result.skipped) {
                stats.skipped++;
            } else {
                stats.errors++;
                stats.details.push(`Example ${example.id}: ${result.error}`);
            }
        }

        revalidatePath('/admin/storage');
        return { success: true, stats };

    } catch (error) {
        console.error("Migration fatal error:", error);
        return { success: false, error: "Migration failed", stats };
    }
}

async function migrateFile(currentUrl: string, folder: string, date: Date) {
    try {
        // Extract key from URL
        // URL format: https://.../key
        // or just key if relative (though usually absolute)
        let key = currentUrl;
        if (currentUrl.startsWith('http')) {
            const urlObj = new URL(currentUrl);
            key = urlObj.pathname.substring(1); // Remove leading /
        }

        // Check if already migrated (contains year/month pattern)
        // Regex: folder/YYYY/MM/
        const migratedRegex = new RegExp(`^${folder}/\\d{4}/\\d{2}/`);
        if (migratedRegex.test(key)) {
            return { success: false, skipped: true };
        }

        // Check if file exists in R2
        try {
            await r2.send(new HeadObjectCommand({
                Bucket: R2_BUCKET_NAME,
                Key: key
            }));
        } catch (e) {
            return { success: false, error: "File not found in R2" };
        }

        // Generate new key
        // Try to extract original filename from old key
        // Old keys: folder/timestamp-filename or just folder/filename
        const parts = key.split('/');
        const oldFilename = parts[parts.length - 1];

        // Remove timestamp if present (digits-name)
        let originalName = oldFilename;
        if (/^\d+-/.test(oldFilename)) {
            originalName = oldFilename.replace(/^\d+-/, '');
        }

        const newKey = generateStorageKey(folder, originalName, date);

        // Copy Object
        await r2.send(new CopyObjectCommand({
            Bucket: R2_BUCKET_NAME,
            CopySource: `${R2_BUCKET_NAME}/${key}`,
            Key: newKey
        }));

        // Delete Old Object
        await r2.send(new DeleteObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: key
        }));

        const newUrl = `${R2_PUBLIC_URL}/${newKey}`;
        return { success: true, newUrl };

    } catch (error) {
        console.error(`Error migrating ${currentUrl}:`, error);
        return { success: false, error: "Copy/Delete failed" };
    }
}
