import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutBucketCorsCommand } from '@aws-sdk/client-s3';

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

    // Create CORS configuration
    const corsConfig = {
      CORSRules: [
        {
          AllowedHeaders: ['*'],
          AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
          AllowedOrigins: ['*'], // In production, you should specify your domain
          ExposeHeaders: ['ETag'],
          MaxAgeSeconds: 3600,
        },
      ],
    };

    // Create PutBucketCors command
    const command = new PutBucketCorsCommand({
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
      CORSConfiguration: corsConfig,
    });

    // Apply CORS configuration
    await s3Client.send(command);

    return NextResponse.json({
      success: true,
      message: 'S3 bucket CORS configuration updated successfully'
    });
  } catch (error: any) {
    console.error('Error configuring S3 bucket CORS:', error);
    return NextResponse.json(
      { error: `Failed to configure S3 bucket CORS: ${error.message}` },
      { status: 500 }
    );
  }
} 