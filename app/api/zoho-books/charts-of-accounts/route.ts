import { NextResponse } from 'next/server';

const ACCESS_TOKEN = process.env.ZOHO_BOOKS_ACCESS_TOKEN;
const API_DOMAIN = process.env.ZOHO_BOOKS_API_DOMAIN || 'https://www.zohoapis.sa';
const ORGANIZATION_ID = process.env.ZOHO_BOOKS_ORGANIZATION_ID;

export async function GET() {
  try {
    const response = await fetch(
      `${API_DOMAIN}/books/v3/chartofaccounts?organization_id=${ORGANIZATION_ID}`,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform the data to include necessary fields
    const transformedAccounts = (data.chartofaccounts || []).map((account: any) => ({
      account_id: account.account_id,
      account_code: account.account_code || '',
      account_name: account.account_name,
      account_type: account.account_type,
      parent_account_name: account.parent_account_name || null,
      description: account.description,
    }));

    return new NextResponse(JSON.stringify({
      chartOfAccounts: transformedAccounts,
    }), {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error fetching charts of accounts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch charts of accounts' },
      { status: 500 }
    );
  }
} 