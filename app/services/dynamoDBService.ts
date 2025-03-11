import { DynamoDBClient, PutItemCommand, GetItemCommand, DeleteItemCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { SavedReceipt } from './receiptService';
import { ConfigService } from './configService';

export class DynamoDBService {
  private client: DynamoDBClient;
  private readonly tableName = 'Receipts';
  private configService: ConfigService;

  constructor() {
    this.configService = ConfigService.getInstance();
    const config = this.configService.getApiConfig();

    this.client = new DynamoDBClient({
      region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || '',
      },
    });
  }

  async saveReceipt(id: string, receipt: SavedReceipt): Promise<SavedReceipt> {
    try {
      const params = {
        TableName: this.tableName,
        Item: marshall(receipt),
      };

      await this.client.send(new PutItemCommand(params));
      return receipt;
    } catch (error) {
      console.error('Error saving receipt to DynamoDB:', error);
      throw new Error('Failed to save receipt to database');
    }
  }

  async getReceipt(id: string): Promise<SavedReceipt | null> {
    try {
      const params = {
        TableName: this.tableName,
        Key: marshall({ id }),
      };

      const { Item } = await this.client.send(new GetItemCommand(params));
      
      if (!Item) {
        return null;
      }

      return unmarshall(Item) as SavedReceipt;
    } catch (error) {
      console.error('Error getting receipt from DynamoDB:', error);
      throw new Error('Failed to get receipt from database');
    }
  }

  async getAllReceipts(): Promise<SavedReceipt[]> {
    try {
      const params = {
        TableName: this.tableName,
      };

      const { Items = [] } = await this.client.send(new ScanCommand(params));
      
      return Items.map(item => unmarshall(item) as SavedReceipt);
    } catch (error) {
      console.error('Error getting all receipts from DynamoDB:', error);
      throw new Error('Failed to get receipts from database');
    }
  }

  async deleteReceipt(id: string): Promise<void> {
    try {
      const params = {
        TableName: this.tableName,
        Key: marshall({ id }),
      };

      await this.client.send(new DeleteItemCommand(params));
    } catch (error) {
      console.error('Error deleting receipt from DynamoDB:', error);
      throw new Error('Failed to delete receipt from database');
    }
  }

  async updateReceipt(id: string, updates: Partial<SavedReceipt>): Promise<SavedReceipt> {
    try {
      // First get the existing receipt
      const existingReceipt = await this.getReceipt(id);
      if (!existingReceipt) {
        throw new Error('Receipt not found');
      }

      // Merge the updates with existing receipt
      const updatedReceipt = {
        ...existingReceipt,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      // Save the updated receipt
      await this.saveReceipt(id, updatedReceipt);
      return updatedReceipt;
    } catch (error) {
      console.error('Error updating receipt in DynamoDB:', error);
      throw new Error('Failed to update receipt in database');
    }
  }
} 