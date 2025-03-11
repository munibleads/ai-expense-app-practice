import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { compressImage } from "@/app/utils/imageCompression";
import { SUPPORTED_FORMATS } from "@/app/constants/expense";
import { ConfigService } from "./configService";

export interface ReceiptData {
  vendorName: string;
  customerName: string;
  date: string;
  total: string | number;
  taxAmount: string | number;
  subtotal: string | number;
  invoiceId: string;
  vatNumber: string;
  crNumber: string;
  lineItems: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    discount: number;
  }>;
}

interface ImageOptimizationConfig {
  maxWidth: number;
  maxHeight: number;
  quality: number;
  convertToGrayscale: boolean;
  preferWebP: boolean;
}

interface ExtractionConfig {
  extractLineItems: boolean;
  extractCustomerInfo: boolean;
  extractTaxInfo: boolean;
  basicFieldsOnly: boolean;
}

export class BedrockService {
  private client: BedrockRuntimeClient | null = null;
  private lastRequestTime: number = 0;
  private readonly MIN_REQUEST_INTERVAL = 2000; // Minimum 2 seconds between requests
  private configService: ConfigService;

  private readonly defaultImageConfig: ImageOptimizationConfig = {
    maxWidth: 1000,
    maxHeight: 1400,
    quality: 0.7,
    convertToGrayscale: true,
    preferWebP: true
  };

  private readonly defaultExtractionConfig: ExtractionConfig = {
    extractLineItems: true,
    extractCustomerInfo: true,
    extractTaxInfo: true,
    basicFieldsOnly: false
  };

  constructor() {
    this.configService = ConfigService.getInstance();
    this.initializeClient();
  }

  private initializeClient() {
    try {
      console.log('Initializing Bedrock client...');
      const isConfigured = this.configService.isBedrockConfigured();
      console.log('Bedrock configuration status:', { isConfigured });

      if (isConfigured) {
        const config = this.configService.getBedrockConfig();
        console.log('Got Bedrock config:', {
          region: config.region,
          hasAccessKey: !!config.accessKeyId,
          hasSecretKey: !!config.secretAccessKey,
          modelId: config.modelId
        });

        this.client = new BedrockRuntimeClient({
          region: config.region,
          credentials: {
            accessKeyId: config.accessKeyId,
            secretAccessKey: config.secretAccessKey
          }
        });
        console.log('Bedrock client initialized successfully');
      } else {
        console.warn('BedrockService: Missing required configuration. AI processing will not work.');
        console.warn('Required environment variables:');
        console.warn('- AWS_BEDROCK_REGION');
        console.warn('- AWS_BEDROCK_ACCESS_KEY_ID');
        console.warn('- AWS_BEDROCK_SECRET_ACCESS_KEY');
        console.warn('- AWS_BEDROCK_MODEL_ID');
      }
    } catch (error) {
      console.error('Failed to initialize Bedrock client:', error);
      this.client = null;
    }
  }

  private validateClient() {
    if (!this.client) {
      throw new Error(
        'Bedrock is not properly configured. Please check your environment variables:\n' +
        '- AWS_BEDROCK_REGION\n' +
        '- AWS_BEDROCK_ACCESS_KEY_ID\n' +
        '- AWS_BEDROCK_SECRET_ACCESS_KEY\n' +
        '- AWS_BEDROCK_MODEL_ID'
      );
    }
  }

  private cleanAmount(amount: string | number): string {
    if (typeof amount === 'number') {
      return amount.toString();
    }
    // Remove all non-numeric characters except decimal point and negative sign
    return amount.replace(/[^\d.-]/g, '');
  }

  private validateData(data: any): ReceiptData {
    // Ensure all required fields are present with default values
    const validatedData: ReceiptData = {
      vendorName: data?.vendorName || '',
      customerName: data?.customerName || '',
      date: data?.date || '',
      total: this.cleanAmount(data?.total || '0'),
      taxAmount: this.cleanAmount(data?.taxAmount || '0'),
      subtotal: this.cleanAmount(data?.subtotal || '0'),
      invoiceId: data?.invoiceId || '',
      vatNumber: data?.vatNumber || '',
      crNumber: data?.crNumber || '',
      lineItems: []
    };

    // Validate and transform line items
    if (Array.isArray(data?.lineItems)) {
      validatedData.lineItems = data.lineItems.map((item: any, index: number) => ({
        id: item?.id || `item-${index}`,
        description: item?.description || '',
        quantity: typeof item?.quantity === 'number' ? item.quantity : parseFloat(item?.quantity || '1'),
        unitPrice: typeof item?.unitPrice === 'number' ? item.unitPrice : parseFloat(this.cleanAmount(item?.unitPrice || '0')),
        amount: typeof item?.amount === 'number' ? item.amount : parseFloat(this.cleanAmount(item?.amount || '0')),
        discount: typeof item?.discount === 'number' ? item.discount : parseFloat(this.cleanAmount(item?.discount || '0'))
      }));
    }

    return validatedData;
  }

  private async enforceRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
      await new Promise(resolve => 
        setTimeout(resolve, this.MIN_REQUEST_INTERVAL - timeSinceLastRequest)
      );
    }
    
    this.lastRequestTime = Date.now();
  }

  async analyzeReceipt(file: File, 
    imageConfig?: Partial<ImageOptimizationConfig>,
    extractionConfig?: Partial<ExtractionConfig>
  ): Promise<ReceiptData> {
    try {
      this.validateClient();
      await this.enforceRateLimit();

      const finalImageConfig = { ...this.defaultImageConfig, ...imageConfig };
      const finalExtractionConfig = { ...this.defaultExtractionConfig, ...extractionConfig };

      console.log('Starting receipt analysis for file:', file.name);
      
      let processedFile = file;
      if (file.type !== SUPPORTED_FORMATS.PDF) {
        try {
          processedFile = await this.optimizeImage(file, finalImageConfig);
          console.log('File optimized successfully:', {
            originalSize: file.size,
            optimizedSize: processedFile.size,
          });
        } catch (error) {
          console.error('Error optimizing image:', error);
          throw new Error('Failed to optimize the image. Please try a smaller image or lower quality scan.');
        }
      }

      const formData = new FormData();
      formData.append('file', processedFile);
      formData.append('fileType', processedFile.type);
      formData.append('extractionConfig', JSON.stringify(finalExtractionConfig));

      const response = await fetch('/api/analyze-receipt', {
        method: 'POST',
        body: formData,
      });

      console.log('API Response status:', response.status);
      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.details || data.error || 'Failed to analyze receipt';
        if (response.status === 429) {
          throw new Error(`Service is busy: ${errorMessage}. Please try again in a few moments.`);
        }
        throw new Error(`Bedrock Error: ${errorMessage}`);
      }

      // Validate and transform the extracted data
      const receiptData = this.validateData(data);
      console.log('Parsed receipt data:', receiptData);

      return receiptData;
    } catch (error) {
      console.error('Error analyzing receipt:', error);
      if (!this.configService.isBedrockConfigured()) {
        throw new Error('Bedrock is not properly configured. Please check your environment variables.');
      }
      throw error;
    }
  }

  private async optimizeImage(file: File, config: ImageOptimizationConfig): Promise<File> {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    return new Promise((resolve, reject) => {
      img.onload = () => {
        try {
          // Calculate new dimensions
          let { width, height } = img;
          if (width > config.maxWidth) {
            height = (height * config.maxWidth) / width;
            width = config.maxWidth;
          }
          if (height > config.maxHeight) {
            width = (width * config.maxHeight) / height;
            height = config.maxHeight;
          }

          canvas.width = width;
          canvas.height = height;

          // Apply grayscale if configured
          if (config.convertToGrayscale && ctx) {
            ctx.filter = 'grayscale(100%)';
          }

          ctx?.drawImage(img, 0, 0, width, height);

          // Convert to WebP if supported and configured
          const mimeType = config.preferWebP && this.isWebPSupported() 
            ? 'image/webp' 
            : 'image/jpeg';

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(new File([blob], file.name, { type: mimeType }));
              } else {
                reject(new Error('Failed to create optimized image'));
              }
            },
            mimeType,
            config.quality
          );
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  private isWebPSupported(): boolean {
    const canvas = document.createElement('canvas');
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }
} 