import { NextRequest, NextResponse } from 'next/server';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { SUPPORTED_FORMATS, BEDROCK_MODEL_ID } from '@/app/constants/expense';

// Maximum number of retries for throttled requests
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function processWithRetry(client: BedrockRuntimeClient, command: InvokeModelCommand, retryCount = 0): Promise<any> {
  try {
    return await client.send(command);
  } catch (error: any) {
    console.error('Bedrock API error:', error);
    
    if (error.name === 'ThrottlingException' && retryCount < MAX_RETRIES) {
      // Calculate delay with exponential backoff: 1s, 2s, 4s
      const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
      console.log(`Request throttled, retrying in ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`);
      await sleep(delay);
      return processWithRetry(client, command, retryCount + 1);
    }

    // Handle specific error types
    if (error.name === 'ValidationException') {
      throw new Error('Invalid request format: ' + error.message);
    }
    if (error.name === 'ModelNotReadyException') {
      throw new Error('AI model is currently unavailable. Please try again in a few moments.');
    }
    if (error.name === 'ServiceQuotaExceededException') {
      throw new Error('Service quota exceeded. Please try again later.');
    }

    throw error;
  }
}

interface ExtractionFields {
  vendorName: boolean;
  date: boolean;
  total: boolean;
  customerName?: boolean;
  taxAmount?: boolean;
  vatNumber?: boolean;
  crNumber?: boolean;
  subtotal?: boolean;
  invoiceId?: boolean;
}

interface LineItemFields {
  description: boolean;
  quantity: boolean;
  unitPrice: boolean;
  amount: boolean;
  discount: boolean;
}

interface ExtractionTemplate extends ExtractionFields {
  lineItems?: LineItemFields[];
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const extractionConfigStr = formData.get('extractionConfig') as string;
    const extractionConfig = extractionConfigStr ? JSON.parse(extractionConfigStr) : null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!Object.values(SUPPORTED_FORMATS).includes(file.type as any)) {
      return NextResponse.json({ error: 'Unsupported file format' }, { status: 400 });
    }

    // Get file bytes and convert to base64
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Data = buffer.toString('base64');

    // Initialize Bedrock client
    const client = new BedrockRuntimeClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });

    // Build extraction prompt based on config
    const extractionPrompt = buildExtractionPrompt(extractionConfig);

    // Create the command with proper Claude format
    const command = new InvokeModelCommand({
      modelId: BEDROCK_MODEL_ID,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 4096,
        temperature: 0.1,
        top_p: 0.999,
        top_k: 250,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: file.type,
                  data: base64Data
                }
              },
              {
                type: "text",
                text: extractionPrompt
              }
            ]
          }
        ]
      })
    });

    try {
      // Process with retry logic
      const response = await processWithRetry(client, command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));

      if (!responseBody || !responseBody.content) {
        throw new Error('Invalid response format from Bedrock');
      }

      // Extract JSON from the response
      const content = responseBody.content[0].text;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('No valid JSON found in the response');
      }

      const extractedData = JSON.parse(jsonMatch[0]);

      // Validate the extracted data
      if (!extractedData.vendorName && !extractedData.total && !extractedData.lineItems?.length) {
        throw new Error('No valid receipt data could be extracted from the image');
      }

      return NextResponse.json(extractedData);
    } catch (error: any) {
      console.error('Error processing receipt:', error);
      return NextResponse.json(
        { error: 'Failed to process receipt', details: error.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error in receipt analysis:', error);
    return NextResponse.json(
      { error: 'Failed to analyze receipt', details: error.message },
      { status: 500 }
    );
  }
}

function buildExtractionPrompt(config: any): string {
  if (!config) {
    return getDefaultPrompt();
  }

  let fields: ExtractionFields = {
    vendorName: true,
    date: true,
    total: true
  };

  if (config.extractCustomerInfo) {
    fields.customerName = true;
  }

  if (config.extractTaxInfo) {
    fields.taxAmount = true;
    fields.vatNumber = true;
    fields.crNumber = true;
  }

  if (!config.basicFieldsOnly) {
    fields.subtotal = true;
    fields.invoiceId = true;
  }

  const jsonTemplate: ExtractionTemplate = {
    ...fields,
    lineItems: config.extractLineItems ? [
      {
        description: true,
        quantity: true,
        unitPrice: true,
        amount: true,
        discount: true
      }
    ] : undefined
  };

  // Remove undefined fields
  (Object.keys(jsonTemplate) as Array<keyof ExtractionTemplate>).forEach(key => {
    if (jsonTemplate[key] === undefined) {
      delete jsonTemplate[key];
    }
  });

  return `Extract only the following fields from this receipt in JSON format:
${JSON.stringify(jsonTemplate, null, 2).replace(/: true/g, ': ""')}
Rules: Only include visible information. Use empty string for text fields and 0 for numeric fields if not found.`;
}

function getDefaultPrompt(): string {
  return `Extract the following from this receipt in JSON format:
{
  "vendorName": "",
  "date": "YYYY-MM-DD",
  "total": 0,
  "taxAmount": 0,
  "subtotal": 0,
  "invoiceId": "",
  "vatNumber": "",
  "crNumber": "",
  "lineItems": [
    {
      "description": "",
      "quantity": 0,
      "unitPrice": 0,
      "amount": 0,
      "discount": 0
    }
  ]
}
Rules: Only include visible information. Use empty string for text fields and 0 for numeric fields if not found.`;
} 