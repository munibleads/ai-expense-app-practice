interface ReceiptData {
  merchantName: string;
  date: string;
  totalAmount: number;
  items: Array<{
    description: string;
    amount: number;
  }>;
  taxAmount: number;
}

interface OCRResponse {
  ParsedResults: Array<{
    ParsedText: string;
    ErrorMessage: string;
    ErrorDetails: string;
  }>;
  OCRExitCode: number;
  IsErroredOnProcessing: boolean;
  ErrorMessage: string | null;
  ErrorDetails: string | null;
}

export class OCRService {
  private static API_KEY = 'K85161327988957';
  private static API_URL = 'https://api.ocr.space/parse/image';

  static async testConnection(): Promise<boolean> {
    try {
      console.log('Testing connection to OCR.space API...');
      
      // Create a simple test image with text
      const testImageUrl = 'https://dl.a9t9.com/blog/ocr-online/screenshot.jpg';

      const formData = new FormData();
      formData.append('apikey', this.API_KEY);
      formData.append('url', testImageUrl);
      formData.append('language', 'eng');
      formData.append('isOverlayRequired', 'false');

      const response = await fetch(this.API_URL, {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);
      
      const responseData: OCRResponse = await response.json();
      console.log('Complete response data:', JSON.stringify(responseData, null, 2));

      if (!response.ok || responseData.IsErroredOnProcessing) {
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          error: responseData.ErrorMessage
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('API Connection Test Error:', error);
      return false;
    }
  }

  static async extractReceiptData(file: File): Promise<ReceiptData> {
    try {
      console.log('Processing receipt with OCR.space API...');

      const formData = new FormData();
      formData.append('apikey', this.API_KEY);
      formData.append('language', 'eng');
      formData.append('isOverlayRequired', 'false');
      formData.append('file', file);
      formData.append('detectOrientation', 'true');
      formData.append('scale', 'true');
      formData.append('OCREngine', '2'); // More accurate OCR engine

      const response = await fetch(this.API_URL, {
        method: 'POST',
        body: formData,
      });

      console.log('Receipt processing response status:', response.status);
      
      const responseData: OCRResponse = await response.json();
      console.log('OCR Response:', JSON.stringify(responseData, null, 2));

      if (!response.ok || responseData.IsErroredOnProcessing) {
        throw new Error(`OCR failed: ${responseData.ErrorMessage || 'Unknown error'}`);
      }

      if (!responseData.ParsedResults?.[0]?.ParsedText) {
        throw new Error('No text was extracted from the image');
      }

      // Process the extracted text to identify receipt information
      const extractedText = responseData.ParsedResults[0].ParsedText;
      console.log('Extracted text:', extractedText);

      // Parse the extracted text to find receipt details
      // This is a basic implementation - you might want to enhance this based on your receipt format
      const receiptData = this.parseReceiptText(extractedText);
      
      return receiptData;
    } catch (error) {
      console.error('Error processing receipt:', error);
      throw error;
    }
  }

  private static parseReceiptText(text: string): ReceiptData {
    // Split the text into lines
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Initialize receipt data with default values
    const receiptData: ReceiptData = {
      merchantName: 'Unknown Merchant',
      date: new Date().toISOString().split('T')[0],
      totalAmount: 0,
      items: [],
      taxAmount: 0
    };

    let isItemSection = false;

    // Process each line
    lines.forEach((line, index) => {
      // Try to find merchant name (usually at the top)
      if (index === 0) {
        receiptData.merchantName = line;
      }

      // Look for date
      if (line.match(/\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/)) {
        receiptData.date = this.standardizeDate(line);
      }

      // Look for items with prices
      const itemMatch = line.match(/(.+?)\s*\$?\s*(\d+\.\d{2})/);
      if (itemMatch) {
        const [, description, amount] = itemMatch;
        if (!description.toLowerCase().includes('total') && !description.toLowerCase().includes('tax')) {
          receiptData.items.push({
            description: description.trim(),
            amount: parseFloat(amount)
          });
        }
      }

      // Look for tax amount
      if (line.toLowerCase().includes('tax') && line.match(/\d+\.\d{2}/)) {
        const taxMatch = line.match(/\d+\.\d{2}/);
        if (taxMatch) {
          receiptData.taxAmount = parseFloat(taxMatch[0]);
        }
      }

      // Look for total amount
      if (line.toLowerCase().includes('total') && line.match(/\d+\.\d{2}/)) {
        const totalMatch = line.match(/\d+\.\d{2}/);
        if (totalMatch) {
          receiptData.totalAmount = parseFloat(totalMatch[0]);
        }
      }
    });

    // If no total was found, calculate it from items and tax
    if (receiptData.totalAmount === 0) {
      const itemsTotal = receiptData.items.reduce((sum, item) => sum + item.amount, 0);
      receiptData.totalAmount = itemsTotal + receiptData.taxAmount;
    }

    return receiptData;
  }

  private static standardizeDate(dateStr: string): string {
    // Extract numbers from the date string
    const numbers = dateStr.match(/\d+/g);
    if (!numbers || numbers.length < 3) {
      return new Date().toISOString().split('T')[0];
    }

    let [month, day, year] = numbers.map(n => parseInt(n));

    // Adjust year if it's in short format
    if (year < 100) {
      year += year < 50 ? 2000 : 1900;
    }

    // Ensure month and day are valid
    month = Math.min(12, Math.max(1, month));
    day = Math.min(31, Math.max(1, day));

    // Format date as YYYY-MM-DD
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  }
} 