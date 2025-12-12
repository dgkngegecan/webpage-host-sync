import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2, R2_BUCKET_NAME } from "@/lib/r2";
import fs from 'fs';
import path from 'path';

export async function backupDatabase() {
    try {
        const dbPath = path.join(process.cwd(), 'prisma/dev.db');

        if (!fs.existsSync(dbPath)) {
            throw new Error('Database file not found');
        }

        const fileBuffer = fs.readFileSync(dbPath);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupKey = `backups/dev-${timestamp}.db`;

        const command = new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: backupKey,
            Body: fileBuffer,
            ContentType: 'application/x-sqlite3'
        });

        await r2.send(command);

        return { success: true, key: backupKey };
    } catch (error) {
        console.error('Backup failed:', error);
        return { success: false, error: error };
    }
}
