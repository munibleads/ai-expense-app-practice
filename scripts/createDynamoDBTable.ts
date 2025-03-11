import { DynamoDBClient, CreateTableCommand, ScalarAttributeType, KeyType } from "@aws-sdk/client-dynamodb";

async function createReceiptsTable() {
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

  try {
    const data = await client.send(new CreateTableCommand(params));
    console.log("Table Created", data);
    return data;
  } catch (err) {
    console.error("Error", err);
    throw err;
  }
}

// Run the function if this script is run directly
if (require.main === module) {
  createReceiptsTable()
    .then(() => console.log('Table creation completed'))
    .catch((err) => {
      console.error('Failed to create table:', err);
      process.exit(1);
    });
} 