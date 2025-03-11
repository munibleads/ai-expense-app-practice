export const VAT_RATE = 0.15;
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
export const CURRENCY = 'SAR';

// Bedrock API related constants
export const BEDROCK_MODEL_ID = 'anthropic.claude-3-haiku-20240307-v1:0';
export const SUPPORTED_FORMATS = {
  PDF: 'application/pdf',
  PNG: 'image/png',
  JPEG: 'image/jpeg'
} as const;

// Image compression settings
export const IMAGE_COMPRESSION = {
  MAX_WIDTH: 1600,
  MAX_HEIGHT: 1600,
  QUALITY: 0.8,
  MAX_FILE_SIZE_BYTES: 1024 * 1024, // 1MB after compression
} as const;

export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_AMOUNT: 'Please enter a valid amount',
  FILE_TYPE: (types: string[]) => `Supported file types: ${types.join(', ')}`,
  FILE_SIZE: (maxSize: number) => `Maximum file size: ${maxSize / (1024 * 1024)}MB`,
  API_ERROR: 'Error processing receipt. Please try again.',
  IMAGE_TOO_LARGE: 'Image is too large. Please try a smaller image or lower quality scan.',
} as const;

export const formatCurrency = (amount: number | string): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `${CURRENCY} ${numAmount.toLocaleString('en-SA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const SORT_DIRECTIONS = {
  ASC: 'asc',
  DESC: 'desc',
} as const;

export type SortDirection = typeof SORT_DIRECTIONS[keyof typeof SORT_DIRECTIONS];

export interface SortConfig {
  field: string;
  direction: SortDirection;
} 