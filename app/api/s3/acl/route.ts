import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutPublicAccessBlockCommand } from '@aws-sdk/client-s3';

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

    // Create command to allow public access
    const command = new PutPublicAccessBlockCommand({
      Bucket: bucketName,
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: false,
        IgnorePublicAcls: false,
        BlockPublicPolicy: false,
        RestrictPublicBuckets: false
      }
    });

    // Apply public access configuration
    await s3Client.send(command);

    return NextResponse.json({
      success: true,
      message: 'S3 bucket public access configuration updated successfully'
    });
  } catch (error: any) {
    console.error('Error configuring S3 bucket public access:', error);
    return NextResponse.json(
      { error: `Failed to configure S3 bucket public access: ${error.message}` },
      { status: 500 }
    );
  }
} 