import { NextResponse } from 'next/server';
import { r2, R2_BUCKET_NAME, R2_PUBLIC_URL } from '@/lib/r2';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

export async function GET() {
    const testKey = `test-connection-${Date.now()}.txt`;
    const testContent = 'Hello from Next.js R2 Verification!';

    try {
        // 1. Upload
        console.log('Attempting upload...');
        await r2.send(new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: testKey,
            Body: testContent,
            ContentType: 'text/plain',
        }));
        console.log('Upload successful');

        const publicUrl = `${R2_PUBLIC_URL}/${testKey}`;

        // 2. Delete (Cleanup)
        console.log('Attempting delete...');
        await r2.send(new DeleteObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: testKey,
        }));
        console.log('Delete successful');

        return NextResponse.json({
            success: true,
            message: 'R2 connection verified successfully',
            details: {
                bucket: R2_BUCKET_NAME,
                testKey: testKey,
                publicUrl: publicUrl,
                upload: 'OK',
                delete: 'OK'
            }
        });

    } catch (error) {
        console.error('R2 Test Error:', error);
        return NextResponse.json({
            success: false,
            error: String(error),
            env: {
                hasBucket: !!R2_BUCKET_NAME,
                hasUrl: !!R2_PUBLIC_URL
            }
        }, { status: 500 });
    }
}
