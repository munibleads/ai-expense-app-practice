import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutBucketPolicyCommand } from '@aws-sdk/client-s3';

export async function POST(request: NextRequest) {
  try {
    // Initialize S3 client
    const s3Client = new S3Client({
      region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || '',
      },
    });

    const bucketName = process.env.NEXT_PUBLIC_S3_BUCKET_NAME;
    if (!bucketName) {
      throw new Error('S3 bucket name is not configured');
    }

    // Create a simple bucket policy that allows public read access
    const bucketPolicy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'PublicReadGetObject',
          Effect: 'Allow',
          Principal: '*',
          Action: 's3:GetObject',
          Resource: `arn:aws:s3:::${bucketName}/*`
        }
      ]
    };

    // Create PutBucketPolicy command
    const command = new PutBucketPolicyCommand({
      Bucket: bucketName,
      Policy: JSON.stringify(bucketPolicy)
    });

    // Apply bucket policy
    await s3Client.send(command);

    return NextResponse.json({
      success: true,
      message: 'S3 bucket policy updated successfully'
    });
  } catch (error: any) {
    console.error('Error configuring S3 bucket policy:', error);
    return NextResponse.json(
      { error: `Failed to configure S3 bucket policy: ${error.message}` },
      { status: 500 }
    );
  }
} 