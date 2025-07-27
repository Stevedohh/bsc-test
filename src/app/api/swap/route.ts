import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.ONEINCH_API_KEY;
const ONEINCH_API_BASE_URL = process.env.ONEINCH_API_BASE_URL;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const src = searchParams.get('src');
  const dst = searchParams.get('dst');
  const amount = searchParams.get('amount');
  const from = searchParams.get('from');
  const slippage = searchParams.get('slippage');

  if (!src || !dst || !amount || !from || !slippage) {
    return NextResponse.json(
      { error: 'Missing required parameters: src, dst, amount, from, slippage' },
      { status: 400 }
    );
  }

  try {
    const oneInchParams = new URLSearchParams({
      src,
      dst,
      amount,
      from,
      slippage,
      includeTokensInfo: 'true',
      includeGas: 'true',
      includeProtocols: 'false',
      disableEstimate: 'false',
      allowPartialFill: 'false',
    });

    const optionalParams = [
      'protocols', 'fee', 'gasPrice', 'complexityLevel',
      'connectorTokens', 'allowPartialFill', 'disableEstimate', 'usePatching'
    ];

    optionalParams.forEach(param => {
      const value = searchParams.get(param);
      if (value !== null) {
        oneInchParams.set(param, value);
      }
    });

    const oneInchUrl = `${ONEINCH_API_BASE_URL}/swap?${oneInchParams.toString()}`;

    const response = await fetch(oneInchUrl, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('1inch Swap API error:', errorData);

      return NextResponse.json(
        {
          error: '1inch Swap API Error',
          details: errorData.description || errorData.error || 'Unknown error',
          statusCode: response.status
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });

  } catch (error: any) {
    console.error('Swap Proxy error:', error);

    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
