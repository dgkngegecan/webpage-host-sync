'use server'

import { r2, R2_BUCKET_NAME } from "@/lib/r2";
import { ListObjectsV2Command, DeleteObjectCommand, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export interface StorageFile {
    key: string;
    size: number;
    lastModified: Date;
}

export async function listFiles(prefix: string = ''): Promise<{ files: StorageFile[], folders: string[] }> {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    try {
        const command = new ListObjectsV2Command({
            Bucket: R2_BUCKET_NAME,
            Prefix: prefix,
            Delimiter: '/'
        });

        const response = await r2.send(command);

        const files = (response.Contents || []).map(item => ({
            key: item.Key || '',
            size: item.Size || 0,
            lastModified: item.LastModified || new Date()
        })).sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());

        const folders = (response.CommonPrefixes || []).map(p => p.Prefix || '').filter(Boolean);

        return { files, folders };

    } catch (error) {
        console.error("Error listing files:", error);
        return { files: [], folders: [] };
    }
}

export async function deleteFile(key: string) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    try {
        await r2.send(new DeleteObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: key
        }));
        revalidatePath('/admin/storage');
        return { success: true };
    } catch (error) {
        console.error("Error deleting file:", error);
        return { success: false, error: "Failed to delete file" };
    }
}

export async function bulkDeleteOldFiles(days: number) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    try {
        // For bulk delete, we need to list ALL files recursively (no delimiter)
        // We'll create a helper or just run a separate command here
        const command = new ListObjectsV2Command({
            Bucket: R2_BUCKET_NAME,
            // No delimiter to get all files
        });

        const response = await r2.send(command);
        const allFiles = response.Contents || [];

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        const filesToDelete = allFiles.filter(f => f.LastModified && f.LastModified < cutoffDate);

        if (filesToDelete.length === 0) {
            return { success: true, count: 0 };
        }

        let deletedCount = 0;
        const batchSize = 1000;

        for (let i = 0; i < filesToDelete.length; i += batchSize) {
            const batch = filesToDelete.slice(i, i + batchSize);

            await r2.send(new DeleteObjectsCommand({
                Bucket: R2_BUCKET_NAME,
                Delete: {
                    Objects: batch.map(f => ({ Key: f.Key }))
                }
            }));
            deletedCount += batch.length;
        }

        revalidatePath('/admin/storage');
        return { success: true, count: deletedCount };

    } catch (error) {
        console.error("Error bulk deleting files:", error);
        return { success: false, error: "Failed to bulk delete files" };
    }
}
