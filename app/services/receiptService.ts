import { ReceiptData } from './bedrockService';
import { ConfigService } from './configService';

export interface SavedReceipt extends ReceiptData {
  id: string;
  s3Key: string;
  s3Url: string;
  createdAt: string;
  updatedAt: string;
  status: string;
}

export class ReceiptService {
  private apiEndpoint: string;
  private configService: ConfigService;

  constructor() {
    this.configService = ConfigService.getInstance();
    const config = this.configService.getApiConfig();
    this.apiEndpoint = config.endpoint;
  }

  async saveReceipt(receiptData: ReceiptData, s3Key: string, s3Url: string): Promise<SavedReceipt> {
    try {
      const response = await fetch(`${this.apiEndpoint}/receipts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...receiptData,
          s3Key,
          s3Url,
          status: 'Pending',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save receipt data');
      }

      const savedReceipt = await response.json();
      
      // Verify the saved receipt was returned
      if (!savedReceipt || !savedReceipt.id) {
        throw new Error('Invalid response from server');
      }

      return savedReceipt;
    } catch (error) {
      console.error('Error saving receipt data:', error);
      throw new Error('Failed to save receipt data to database. Please try again later.');
    }
  }

  async getReceipt(id: string): Promise<SavedReceipt> {
    try {
      console.log('Fetching receipt:', id);
      const response = await fetch(`${this.apiEndpoint}/receipts/${id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch receipt data');
      }

      const receipt = await response.json();
      
      // Verify the receipt data
      if (!receipt || !receipt.id) {
        throw new Error('Invalid receipt data returned from server');
      }

      return receipt;
    } catch (error) {
      console.error('Error fetching receipt data:', error);
      throw new Error('Failed to fetch receipt data from database. Please try again later.');
    }
  }

  async updateReceipt(id: string, receiptData: Partial<SavedReceipt>): Promise<SavedReceipt> {
    try {
      const response = await fetch(`${this.apiEndpoint}/receipts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(receiptData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update receipt data');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating receipt data:', error);
      throw new Error('Failed to update receipt data in database. Please try again later.');
    }
  }

  async deleteReceipt(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiEndpoint}/receipts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete receipt data');
      }
    } catch (error) {
      console.error('Error deleting receipt data:', error);
      throw new Error('Failed to delete receipt data from database. Please try again later.');
    }
  }
} 