interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  api_domain: string;
  token_type: string;
}

export async function refreshZohoToken(): Promise<string> {
  const clientId = process.env.ZOHO_BOOKS_CLIENT_ID;
  const clientSecret = process.env.ZOHO_BOOKS_CLIENT_SECRET;
  const refreshToken = process.env.ZOHO_BOOKS_REFRESH_TOKEN;
  
  // Validate credentials
  if (!clientId || !clientSecret || !refreshToken) {
    const missingCreds = [];
    if (!clientId) missingCreds.push('Client ID');
    if (!clientSecret) missingCreds.push('Client Secret');
    if (!refreshToken) missingCreds.push('Refresh Token');
    
    console.error('Missing Zoho credentials:', missingCreds.join(', '));
    throw new Error(`Missing required Zoho credentials: ${missingCreds.join(', ')}`);
  }

  try {
    console.log('Attempting to refresh token with:', {
      clientIdLength: clientId.length,
      clientSecretLength: clientSecret.length,
      refreshTokenLength: refreshToken.length,
      url: 'https://accounts.zoho.sa/oauth/v2/token' // Note: Changed to .sa domain
    });
    
    const params = new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token'
    });

    const response = await fetch('https://accounts.zoho.sa/oauth/v2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params
    });

    console.log('Refresh token response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    const responseText = await response.text();
    console.log('Raw response:', responseText);

    if (!response.ok) {
      let error;
      try {
        error = JSON.parse(responseText);
      } catch {
        error = { error: responseText };
      }
      
      // Handle specific error cases
      if (error.error === 'invalid_client') {
        throw new Error('Invalid Zoho client credentials. Please check your Client ID and Client Secret.');
      } else if (error.error === 'invalid_grant') {
        throw new Error('Invalid or expired refresh token. Please generate new credentials.');
      }
      
      console.error('Failed to refresh token:', {
        status: response.status,
        statusText: response.statusText,
        error
      });
      throw new Error(`Failed to refresh token: ${error.error || response.statusText}`);
    }

    let data: TokenResponse;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse token response:', e);
      throw new Error('Invalid JSON response from token refresh');
    }
    
    if (!data.access_token) {
      console.error('Invalid token response:', data);
      throw new Error('Refresh token response did not include access token');
    }

    console.log('Successfully refreshed token:', {
      tokenLength: data.access_token.length,
      expiresIn: data.expires_in,
      apiDomain: data.api_domain
    });
    
    // Update the access token in environment
    process.env.ZOHO_BOOKS_ACCESS_TOKEN = data.access_token;
    
    return data.access_token;
  } catch (error) {
    console.error('Error refreshing Zoho token:', error);
    throw error;
  }
}

export async function getValidAccessToken(): Promise<string> {
  const accessToken = process.env.ZOHO_BOOKS_ACCESS_TOKEN;
  const apiDomain = process.env.ZOHO_BOOKS_API_DOMAIN;
  
  if (!accessToken) {
    console.error('Access token not configured in environment');
    throw new Error('Access token not configured');
  }

  if (!apiDomain) {
    console.error('API domain not configured in environment');
    throw new Error('API domain not configured');
  }

  try {
    console.log('Validating current access token:', {
      tokenPrefix: accessToken.substring(0, 10) + '...',
      apiDomain
    });
    
    // Try to use current token
    const response = await fetch(`${apiDomain}/books/v3/organizations`, {
      headers: {
        'Authorization': `Zoho-oauthtoken ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Token validation response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    const responseText = await response.text();
    console.log('Raw validation response:', responseText);

    // If token is valid, return it
    if (response.ok) {
      console.log('Current token is valid');
      return accessToken;
    }

    // If we get a 401, refresh the token
    if (response.status === 401) {
      console.log('Token expired, attempting refresh...');
      return await refreshZohoToken();
    }

    let error;
    try {
      error = JSON.parse(responseText);
    } catch {
      error = { error: responseText };
    }

    throw new Error(`Unexpected response: ${response.status} ${response.statusText} - ${JSON.stringify(error)}`);
  } catch (error) {
    console.error('Error validating/refreshing token:', error);
    throw error;
  }
} 