export interface S3Config {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
}

export interface BedrockConfig {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  modelId: string;
}

export interface ApiConfig {
  endpoint: string;
}

export class ConfigService {
  private static instance: ConfigService;
  private s3Config: S3Config | null = null;
  private bedrockConfig: BedrockConfig | null = null;
  private apiConfig: ApiConfig | null = null;

  private constructor() {
    console.log('Initializing ConfigService...');
    this.loadConfigurations();
  }

  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  private loadConfigurations() {
    console.log('Loading configurations...');
    
    // Load S3 configuration
    const s3Region = process.env.NEXT_PUBLIC_AWS_REGION;
    const s3AccessKeyId = process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID;
    const s3SecretAccessKey = process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY;
    const bucketName = process.env.NEXT_PUBLIC_S3_BUCKET_NAME;

    console.log('S3 Configuration:', {
      region: s3Region,
      accessKeyId: s3AccessKeyId ? '***' : undefined,
      secretAccessKey: s3SecretAccessKey ? '***' : undefined,
      bucketName
    });

    if (s3Region && s3AccessKeyId && s3SecretAccessKey && bucketName) {
      this.s3Config = {
        region: s3Region,
        accessKeyId: s3AccessKeyId,
        secretAccessKey: s3SecretAccessKey,
        bucketName
      };
      console.log('S3 configuration loaded successfully');
    } else {
      console.warn('Missing S3 configuration values');
    }

    // Load Bedrock configuration
    const bedrockRegion = process.env.NEXT_PUBLIC_AWS_BEDROCK_REGION;
    const bedrockAccessKeyId = process.env.NEXT_PUBLIC_AWS_BEDROCK_ACCESS_KEY_ID;
    const bedrockSecretAccessKey = process.env.NEXT_PUBLIC_AWS_BEDROCK_SECRET_ACCESS_KEY;
    const bedrockModelId = process.env.NEXT_PUBLIC_AWS_BEDROCK_MODEL_ID;

    console.log('Bedrock Configuration:', {
      region: bedrockRegion,
      accessKeyId: bedrockAccessKeyId ? '***' : undefined,
      secretAccessKey: bedrockSecretAccessKey ? '***' : undefined,
      modelId: bedrockModelId
    });

    if (bedrockRegion && bedrockAccessKeyId && bedrockSecretAccessKey && bedrockModelId) {
      this.bedrockConfig = {
        region: bedrockRegion,
        accessKeyId: bedrockAccessKeyId,
        secretAccessKey: bedrockSecretAccessKey,
        modelId: bedrockModelId
      };
      console.log('Bedrock configuration loaded successfully');
    } else {
      console.warn('Missing Bedrock configuration values:', {
        hasRegion: !!bedrockRegion,
        hasAccessKey: !!bedrockAccessKeyId,
        hasSecretKey: !!bedrockSecretAccessKey,
        hasModelId: !!bedrockModelId
      });
    }

    // Load API configuration
    const endpoint = process.env.NEXT_PUBLIC_API_ENDPOINT;
    if (endpoint) {
      this.apiConfig = {
        endpoint
      };
      console.log('API configuration loaded successfully');
    }
  }

  public getS3Config(): S3Config {
    if (!this.s3Config) {
      throw new Error(
        'S3 configuration is not available. Please check your environment variables:\n' +
        '- NEXT_PUBLIC_AWS_REGION\n' +
        '- NEXT_PUBLIC_AWS_ACCESS_KEY_ID\n' +
        '- NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY\n' +
        '- NEXT_PUBLIC_S3_BUCKET_NAME'
      );
    }
    return this.s3Config;
  }

  public getBedrockConfig(): BedrockConfig {
    if (!this.bedrockConfig) {
      console.error('Bedrock configuration is null. Current env values:', {
        region: process.env.AWS_BEDROCK_REGION,
        hasAccessKey: !!process.env.AWS_BEDROCK_ACCESS_KEY_ID,
        hasSecretKey: !!process.env.AWS_BEDROCK_SECRET_ACCESS_KEY,
        modelId: process.env.AWS_BEDROCK_MODEL_ID
      });
      throw new Error(
        'Bedrock configuration is not available. Please check your environment variables:\n' +
        '- AWS_BEDROCK_REGION\n' +
        '- AWS_BEDROCK_ACCESS_KEY_ID\n' +
        '- AWS_BEDROCK_SECRET_ACCESS_KEY\n' +
        '- AWS_BEDROCK_MODEL_ID'
      );
    }
    return this.bedrockConfig;
  }

  public getApiConfig(): ApiConfig {
    if (!this.apiConfig) {
      // Default to local API endpoint if not configured
      return {
        endpoint: '/api'
      };
    }
    return this.apiConfig;
  }

  public isS3Configured(): boolean {
    return this.s3Config !== null;
  }

  public isBedrockConfigured(): boolean {
    const isConfigured = this.bedrockConfig !== null;
    console.log('Checking Bedrock configuration:', {
      isConfigured,
      hasConfig: !!this.bedrockConfig
    });
    return isConfigured;
  }
} 