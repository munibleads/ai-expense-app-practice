import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient, CreateTableCommand, ScalarAttributeType, KeyType } from "@aws-sdk/client-dynamodb";

export async function POST(request: NextRequest) {
  try {
    const client = new DynamoDBClient({
      region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || '',
      },
    });

    const params = {
      TableName: 'Receipts',
      KeySchema: [
        { AttributeName: 'id', KeyType: KeyType.HASH }  // Partition key
      ],
      AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: ScalarAttributeType.S }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    };

    const data = await client.send(new CreateTableCommand(params));
    console.log("Table Created", data);
    
    return NextResponse.json({
      message: 'DynamoDB table created successfully',
      data
    });
  } catch (error: any) {
    console.error('Error creating DynamoDB table:', error);
    
    // If the table already exists, return a success response
    if (error.name === 'ResourceInUseException') {
      return NextResponse.json({
        message: 'DynamoDB table already exists',
        error: error.message
      });
    }
    
    return NextResponse.json(
      { error: `Failed to create DynamoDB table: ${error.message}` },
      { status: 500 }
    );
  }
} 