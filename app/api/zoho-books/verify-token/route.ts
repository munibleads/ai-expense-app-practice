import { NextResponse } from 'next/server';
import { getValidAccessToken } from '@/app/utils/zohoAuth';

const API_DOMAIN = process.env.ZOHO_BOOKS_API_DOMAIN || 'https://www.zohoapis.sa';
const ORGANIZATION_ID = process.env.ZOHO_BOOKS_ORGANIZATION_ID;

export async function GET() {
  try {
    // Get a valid access token (will refresh if needed)
    let accessToken: string;
    try {
      accessToken = await getValidAccessToken();
    } catch (error) {
      console.error('Failed to get valid access token:', error);
      return NextResponse.json({
        valid: false,
        error: 'Failed to get valid access token',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 401 });
    }

    if (!accessToken) {
      return NextResponse.json({
        valid: false,
        error: 'No access token available'
      }, { status: 401 });
    }

    // Log token length and first/last few characters for debugging
    console.log('Token validation:', {
      length: accessToken.length,
      prefix: accessToken.substring(0, 10) + '...',
      suffix: '...' + accessToken.substring(accessToken.length - 10),
      apiDomain: API_DOMAIN
    });

    // Try to fetch organization info as a test
    const response = await fetch(`${API_DOMAIN}/books/v3/organizations`, {
      headers: {
        'Authorization': `Zoho-oauthtoken ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('API Response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('API Error Response:', error);
      
      return NextResponse.json({
        valid: false,
        status: response.status,
        error: error.message || response.statusText,
        details: error
      }, { status: response.status });
    }

    const data = await response.json();
    
    if (!data || !data.organizations) {
      console.error('Invalid API response format:', data);
      return NextResponse.json({
        valid: false,
        error: 'Invalid API response format',
        details: 'Response does not contain organizations data'
      }, { status: 500 });
    }

    console.log('API Success Response:', {
      organizationCount: data.organizations.length,
      organizations: data.organizations.map((org: any) => ({
        id: org.organization_id,
        name: org.name
      }))
    });
    
    return NextResponse.json({
      valid: true,
      organizationId: ORGANIZATION_ID,
      organizations: data.organizations.map((org: any) => ({
        id: org.organization_id,
        name: org.name,
        fiscalYearStartDate: org.fiscal_year_start_date,
        timeZone: org.time_zone,
        currencyCode: org.currency_code
      }))
    });

  } catch (error) {
    console.error('Error verifying token:', error);
    return NextResponse.json({
      valid: false,
      error: error instanceof Error ? error.message : 'Failed to verify token',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 