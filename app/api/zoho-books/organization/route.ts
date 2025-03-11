import { NextResponse } from 'next/server';

const ACCESS_TOKEN = process.env.ZOHO_BOOKS_ACCESS_TOKEN;
const API_DOMAIN = process.env.ZOHO_BOOKS_API_DOMAIN || 'https://www.zohoapis.sa';

export async function GET() {
  try {
    const response = await fetch(`${API_DOMAIN}/books/v3/organizations`, {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const organization = data.organizations[0];

    return NextResponse.json({
      organizationId: organization.organization_id,
      userId: organization.user_id,
      name: organization.name,
    });
  } catch (error) {
    console.error('Error fetching organization info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organization information' },
      { status: 500 }
    );
  }
} 