'use server';

import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2, R2_BUCKET_NAME } from "@/lib/r2";

export async function getDownloadUrl(fileUrl: string) {
    if (!fileUrl) return null;

    try {
        // Attempt to extract key from URL
        // This assumes the URL structure matches the one generated in upload.ts
        // If it's a full URL, we use the pathname
        let key = fileUrl;

        if (fileUrl.startsWith('http')) {
            const url = new URL(fileUrl);
            key = url.pathname.substring(1); // Remove leading slash
            // Decode URI component in case of special characters
            key = decodeURIComponent(key);
        }

        const command = new GetObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: key,
            ResponseContentDisposition: 'attachment',
        });

        const signedUrl = await getSignedUrl(r2, command, { expiresIn: 3600 });
        return signedUrl;
    } catch (error) {
        console.error('Error generating download URL:', error);
        return null; // Fallback to original URL or handle error
    }
}
