import { SavedReceipt } from '@/app/services/receiptService';
import { DynamoDBService } from '@/app/services/dynamoDBService';

const dynamoDBService = new DynamoDBService();

export async function saveReceipt(id: string, receipt: SavedReceipt): Promise<SavedReceipt> {
  return dynamoDBService.saveReceipt(id, receipt);
}

export async function getReceipt(id: string): Promise<SavedReceipt | null> {
  return dynamoDBService.getReceipt(id);
}

export async function getAllReceipts(): Promise<SavedReceipt[]> {
  return dynamoDBService.getAllReceipts();
}

export async function updateReceipt(id: string, updates: Partial<SavedReceipt>): Promise<SavedReceipt> {
  return dynamoDBService.updateReceipt(id, updates);
}

export async function deleteReceipt(id: string): Promise<void> {
  return dynamoDBService.deleteReceipt(id);
} 