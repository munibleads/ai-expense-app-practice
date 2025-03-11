import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { ReceiptData } from '@/app/services/bedrockService';
import { saveReceipt, getAllReceipts, getReceipt } from './db';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.vendorName || !data.date || !data.s3Key || !data.s3Url) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate a unique ID for the receipt
    const id = uuidv4();
    const timestamp = new Date().toISOString();

    // Create the receipt record
    const receipt = {
      id,
      ...data,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    // Save to our database
    const savedReceipt = await saveReceipt(id, receipt);

    return NextResponse.json(savedReceipt);
  } catch (error) {
    console.error('Error saving receipt:', error);
    return NextResponse.json(
      { error: 'Failed to save receipt' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '10');
    const vendor = searchParams.get('vendor');
    const status = searchParams.get('status');

    if (id) {
      // Return a specific receipt
      const receipt = await getReceipt(id);
      if (!receipt) {
        return NextResponse.json(
          { error: 'Receipt not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(receipt);
    }

    // Get all receipts
    let receipts = await getAllReceipts();

    // Apply filters
    if (vendor) {
      receipts = receipts.filter(receipt => 
        receipt.vendorName?.toLowerCase().includes(vendor.toLowerCase())
      );
    }

    if (status) {
      receipts = receipts.filter(receipt => 
        receipt.status?.toLowerCase() === status.toLowerCase()
      );
    }

    // Get total count before pagination
    const total = receipts.length;

    // Apply pagination
    const start = page * limit;
    const paginatedReceipts = receipts.slice(start, start + limit);

    return NextResponse.json({
      data: paginatedReceipts,
      total,
      page,
      limit
    });
  } catch (error) {
    console.error('Error fetching receipts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch receipts' },
      { status: 500 }
    );
  }
} 