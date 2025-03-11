import { NextResponse } from 'next/server';
import { getValidAccessToken } from '@/app/utils/zohoAuth';

const API_DOMAIN = process.env.ZOHO_BOOKS_API_DOMAIN || 'https://www.zohoapis.sa';
const ORGANIZATION_ID = process.env.ZOHO_BOOKS_ORGANIZATION_ID;

async function getAccountId(accessToken: string, accountCode: string): Promise<string | null> {
  try {
    const accountsUrl = `${API_DOMAIN}/books/v3/chartofaccounts?organization_id=${ORGANIZATION_ID}`;
    const response = await fetch(accountsUrl, {
      headers: {
        'Authorization': `Zoho-oauthtoken ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch accounts:', response.status);
      return null;
    }

    const data = await response.json();
    const account = data.chartofaccounts?.find((acc: any) => acc.account_code === accountCode);
    
    if (account) {
      console.log(`Found account for code ${accountCode}:`, {
        accountId: account.account_id,
        accountName: account.account_name,
        accountCode: account.account_code
      });
      return account.account_id;
    }
    
    console.error(`No account found for code ${accountCode}`);
    return null;
  } catch (error) {
    console.error('Error fetching account ID:', error);
    return null;
  }
}

async function createVATTax(accessToken: string): Promise<string | null> {
  try {
    const createTaxUrl = `${API_DOMAIN}/books/v3/settings/taxes?organization_id=${ORGANIZATION_ID}`;
    const response = await fetch(createTaxUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Zoho-oauthtoken ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tax_name: 'VAT 15%',
        tax_percentage: 15,
        tax_type: 'value_added_tax',
        is_default_tax: true,
        tax_specification: 'vat',
        is_editable: true
      })
    });

    if (!response.ok) {
      console.error('Failed to create VAT tax:', response.status);
      const errorText = await response.text();
      console.error('Create tax error:', errorText);
      return null;
    }

    const data = await response.json();
    console.log('Created VAT tax:', data);
    return data.tax?.tax_id;
  } catch (error) {
    console.error('Error creating VAT tax:', error);
    return null;
  }
}

async function getTaxId(accessToken: string): Promise<string | null> {
  try {
    const taxesUrl = `${API_DOMAIN}/books/v3/settings/taxes?organization_id=${ORGANIZATION_ID}`;
    const response = await fetch(taxesUrl, {
      headers: {
        'Authorization': `Zoho-oauthtoken ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch taxes:', response.status);
      return null;
    }

    const data = await response.json();
    console.log('Available taxes:', data.taxes?.map((t: any) => ({
      id: t.tax_id,
      name: t.tax_name,
      percentage: t.tax_percentage,
      isActive: t.is_active
    })));

    // First try to find the Standard Rate tax (which is the 15% VAT in Saudi Arabia)
    const standardRateTax = data.taxes?.find((t: any) => 
      t.tax_name === 'Standard Rate' && t.tax_percentage === 15
    );

    if (standardRateTax) {
      console.log('Found Standard Rate tax:', {
        taxId: standardRateTax.tax_id,
        taxName: standardRateTax.tax_name,
        taxPercentage: standardRateTax.tax_percentage
      });
      return standardRateTax.tax_id;
    }

    // If Standard Rate not found, try to find any 15% tax
    const anyTax = data.taxes?.find((t: any) => t.tax_percentage === 15);
    if (anyTax) {
      console.log('Found 15% tax:', {
        taxId: anyTax.tax_id,
        taxName: anyTax.tax_name,
        taxPercentage: anyTax.tax_percentage
      });
      return anyTax.tax_id;
    }
    
    console.error('No suitable tax found. Please ensure Standard Rate (15%) tax is configured in Zoho Books');
    return null;
  } catch (error) {
    console.error('Error fetching tax ID:', error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    // Get a valid access token (will refresh if needed)
    const accessToken = await getValidAccessToken();

    // Get tax ID
    const taxId = await getTaxId(accessToken);
    if (!taxId) {
      return NextResponse.json(
        { 
          error: 'Tax configuration error',
          details: 'Could not find appropriate VAT tax rate. Please configure VAT tax in Zoho Books.'
        },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    
    // Get and validate required fields
    const receiptFile = formData.get('receipt') as File;
    const date = formData.get('date');
    const vendorName = formData.get('vendorName');
    const expenseAccountCode = formData.get('expenseAccountId') as string;
    const paidThroughAccountCode = formData.get('paidThroughAccountId') as string;
    const amount = formData.get('amount');

    // Log the received data
    console.log('Received expense data:', {
      fileName: receiptFile?.name,
      fileType: receiptFile?.type,
      fileSize: receiptFile?.size,
      date,
      vendorName,
      expenseAccountCode,
      paidThroughAccountCode,
      amount,
      organizationId: ORGANIZATION_ID
    });

    if (!receiptFile || !date || !vendorName || !expenseAccountCode || !paidThroughAccountCode || !amount) {
      console.error('Missing required fields:', {
        hasFile: !!receiptFile,
        hasDate: !!date,
        hasVendor: !!vendorName,
        hasExpenseAccount: !!expenseAccountCode,
        hasPaidThrough: !!paidThroughAccountCode,
        hasAmount: !!amount
      });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the actual account IDs from the account codes
    const expenseAccountId = await getAccountId(accessToken, expenseAccountCode);
    const paidThroughAccountId = await getAccountId(accessToken, paidThroughAccountCode);

    if (!expenseAccountId || !paidThroughAccountId) {
      return NextResponse.json(
        { 
          error: 'Invalid account selection',
          details: 'Could not find one or more account IDs. Please verify your account selections.'
        },
        { status: 400 }
      );
    }

    // First create the expense without the receipt
    const expenseUrl = `${API_DOMAIN}/books/v3/expenses?organization_id=${ORGANIZATION_ID}`;
    console.log('Creating expense in Zoho Books:', expenseUrl, {
      expenseAccountId,
      paidThroughAccountId
    });

    const expenseResponse = await fetch(expenseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Zoho-oauthtoken ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        date: date,
        account_id: expenseAccountId,
        paid_through_account_id: paidThroughAccountId,
        vendor_name: vendorName,
        vendor_vat_number: formData.get('vatNumber') || '',
        amount: amount,
        tax_id: taxId,
        is_inclusive_tax: true,
        tax_treatment: 'vat_registered',
        tax_scope: 'within_ksa',
        is_tax_period_valid: true,
        reference_number: formData.get('referenceNumber') || '',
        description: formData.get('description') || '',
        is_billable: false,
        payment_mode: 'cash'
      }),
    });

    console.log('Expense creation response status:', expenseResponse.status);

    const expenseResponseText = await expenseResponse.text();
    console.log('Raw expense response:', expenseResponseText);

    if (!expenseResponse.ok) {
      let expenseError;
      try {
        expenseError = JSON.parse(expenseResponseText);
      } catch {
        expenseError = { error: expenseResponseText };
      }
      
      console.error('Failed to create expense:', {
        status: expenseResponse.status,
        statusText: expenseResponse.statusText,
        error: expenseError,
      });
      return NextResponse.json(
        { 
          error: 'Failed to create expense in Zoho Books',
          details: `Status: ${expenseResponse.status}, Error: ${JSON.stringify(expenseError)}`
        },
        { status: expenseResponse.status }
      );
    }

    let expenseData;
    try {
      expenseData = JSON.parse(expenseResponseText);
    } catch (e) {
      console.error('Failed to parse expense response:', e);
      return NextResponse.json(
        { 
          error: 'Invalid response from Zoho Books',
          details: 'Failed to parse expense response JSON'
        },
        { status: 500 }
      );
    }

    // Get the expense ID from the response
    const expenseId = expenseData.expense?.expense_id;
    if (!expenseId) {
      console.error('No expense ID in response:', expenseData);
      return NextResponse.json(
        { 
          error: 'Invalid response from Zoho Books',
          details: 'No expense ID returned'
        },
        { status: 500 }
      );
    }

    // Convert receipt to base64
    const receiptBuffer = await receiptFile.arrayBuffer();
    const base64Receipt = Buffer.from(receiptBuffer).toString('base64');

    // Now attach the receipt to the expense
    const receiptUrl = `${API_DOMAIN}/books/v3/expenses/${expenseId}/receipt?organization_id=${ORGANIZATION_ID}`;
    console.log('Uploading receipt:', {
      expenseId,
      fileName: receiptFile.name,
      fileSize: receiptFile.size,
      fileType: receiptFile.type,
      url: receiptUrl
    });

    // First try multipart/form-data upload
    const uploadFormData = new FormData();
    uploadFormData.append('receipt', receiptFile);

    let uploadResponse = await fetch(receiptUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Zoho-oauthtoken ${accessToken}`,
      },
      body: uploadFormData
    });

    let uploadResponseText = await uploadResponse.text();

    if (!uploadResponse.ok) {
      console.log('Multipart upload failed, trying JSON upload...');
      // If multipart fails, try the JSON method
      uploadResponse = await fetch(receiptUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_name: receiptFile.name,
          file_type: receiptFile.type || 'image/png',
          file_size: receiptFile.size,
          file_content: base64Receipt,
          can_send_in_mail: true,
          can_show_in_portal: true,
          attachment_name: receiptFile.name
        }),
      });

      uploadResponseText = await uploadResponse.text();
    }

    console.log('Receipt upload response status:', uploadResponse.status);
    console.log('Raw upload response:', uploadResponseText);

    if (!uploadResponse.ok) {
      let uploadError;
      try {
        uploadError = JSON.parse(uploadResponseText);
      } catch {
        uploadError = { error: uploadResponseText };
      }
      
      console.error('Failed to upload receipt:', {
        status: uploadResponse.status,
        statusText: uploadResponse.statusText,
        error: uploadError,
      });
      
      // Even if receipt upload fails, return the expense data since it was created
      return NextResponse.json({
        ...expenseData,
        warning: 'Expense created but receipt upload failed',
        uploadError: uploadError
      });
    }

    // Verify the receipt was attached by fetching the expense details
    const verifyUrl = `${API_DOMAIN}/books/v3/expenses/${expenseId}?organization_id=${ORGANIZATION_ID}`;
    const verifyResponse = await fetch(verifyUrl, {
      headers: {
        'Authorization': `Zoho-oauthtoken ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const verifyData = await verifyResponse.json();
    console.log('Expense verification after receipt upload:', {
      expenseId,
      hasReceipt: !!verifyData.expense?.has_receipt,
      receiptDetails: verifyData.expense?.receipt_ids,
      fullResponse: verifyData // Log the full response for debugging
    });

    // Return the complete expense data
    return NextResponse.json({
      ...expenseData,
      receipt: JSON.parse(uploadResponseText),
      receiptVerification: verifyData.expense?.has_receipt
    });

  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to create expense',
        details: error instanceof Error ? error.stack : 'Please check the server logs for more information'
      },
      { status: 500 }
    );
  }
} 