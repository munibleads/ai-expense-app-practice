import { ConfigService } from './configService';

export class S3Service {
  private configService: ConfigService;

  constructor() {
    this.configService = ConfigService.getInstance();
  }

  async uploadFile(file: File, folder: string = 'receipts'): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/s3/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to upload file');
      }

      const { key } = await response.json();
      return key;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload file. Please try again later.');
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const response = await fetch('/api/s3/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete file');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('Failed to delete file. Please try again later.');
    }
  }

  getFileUrl(key: string): string {
    if (!key) {
      throw new Error('No file key provided');
    }

    const config = this.configService.getS3Config();
    return `https://${config.bucketName}.s3.${config.region}.amazonaws.com/${key}`;
  }
} 