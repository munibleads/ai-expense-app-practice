import { NextResponse } from 'next/server';

export async function GET() {
  // Log all environment variables for debugging
  console.log('Raw environment variables:', {
    AWS_BEDROCK_REGION: process.env.NEXT_PUBLIC_AWS_BEDROCK_REGION,
    AWS_BEDROCK_ACCESS_KEY_ID: process.env.NEXT_PUBLIC_AWS_BEDROCK_ACCESS_KEY_ID,
    AWS_BEDROCK_MODEL_ID: process.env.NEXT_PUBLIC_AWS_BEDROCK_MODEL_ID,
    // Don't log the full secret key
    HAS_BEDROCK_SECRET: !!process.env.NEXT_PUBLIC_AWS_BEDROCK_SECRET_ACCESS_KEY
  });

  const envVars = {
    // Bedrock
    bedrockRegion: process.env.NEXT_PUBLIC_AWS_BEDROCK_REGION,
    bedrockAccessKeyId: process.env.NEXT_PUBLIC_AWS_BEDROCK_ACCESS_KEY_ID?.substring(0, 5) + '...',
    bedrockSecretKey: process.env.NEXT_PUBLIC_AWS_BEDROCK_SECRET_ACCESS_KEY ? 'Present' : 'Missing',
    bedrockModelId: process.env.NEXT_PUBLIC_AWS_BEDROCK_MODEL_ID,
    
    // S3
    s3Region: process.env.NEXT_PUBLIC_AWS_REGION,
    s3AccessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID?.substring(0, 5) + '...',
    s3SecretKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY ? 'Present' : 'Missing',
    s3BucketName: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
    
    // Textract
    textractApiVersion: process.env.AWS_TEXTRACT_API_VERSION,
  };

  console.log('Environment Variables Check:', envVars);

  const requiredKeys = ['NEXT_PUBLIC_SOME_KEY', 'ANOTHER_SECRET']; 
  const missingKeys = requiredKeys.filter((key) => !process.env[key]);

  if (missingKeys.length > 0) {
    return NextResponse.json(
      { message: 'Some environment variables are missing', missingKeys },
      { status: 400 }
    );
  }

  return NextResponse.json({ 
    message: 'Environment variables status',
    envVars,
    debug: {
      nodeEnv: process.env.NODE_ENV,
      hasBedrockConfig: !!(process.env.NEXT_PUBLIC_AWS_BEDROCK_REGION && 
                          process.env.NEXT_PUBLIC_AWS_BEDROCK_ACCESS_KEY_ID && 
                          process.env.NEXT_PUBLIC_AWS_BEDROCK_SECRET_ACCESS_KEY && 
                          process.env.NEXT_PUBLIC_AWS_BEDROCK_MODEL_ID),
      hasS3Config: !!(process.env.NEXT_PUBLIC_AWS_REGION && 
                     process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID && 
                     process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY && 
                     process.env.NEXT_PUBLIC_S3_BUCKET_NAME)
    }
  });
} 