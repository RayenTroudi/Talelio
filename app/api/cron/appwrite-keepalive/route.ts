import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isAuthorized(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;

  // If no secret is configured, allow local/manual calls only.
  if (!cronSecret) {
    return process.env.NODE_ENV !== 'production';
  }

  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
  const apiKey = process.env.APPWRITE_API_KEY;

  if (!endpoint || !projectId || !databaseId || !apiKey) {
    return NextResponse.json(
      {
        success: false,
        error: 'Missing required Appwrite environment variables for keep-alive',
      },
      { status: 500 }
    );
  }

  const normalizedEndpoint = endpoint.replace(/\/$/, '');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-Appwrite-Project': projectId,
    'X-Appwrite-Key': apiKey,
  };

  try {
    // Touch Appwrite health endpoint so platform activity is recorded.
    const healthResponse = await fetch(`${normalizedEndpoint}/health`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    // Touch database API with a lightweight read to keep DB service active.
    const databaseResponse = await fetch(`${normalizedEndpoint}/databases/${databaseId}`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    if (!healthResponse.ok || !databaseResponse.ok) {
      const healthBody = await healthResponse.text();
      const databaseBody = await databaseResponse.text();

      return NextResponse.json(
        {
          success: false,
          healthStatus: healthResponse.status,
          databaseStatus: databaseResponse.status,
          healthBody,
          databaseBody,
        },
        { status: 502 }
      );
    }

    const healthData = await healthResponse.json();
    const databaseData = await databaseResponse.json();

    return NextResponse.json({
      success: true,
      message: 'Appwrite keep-alive ping completed',
      checkedAt: new Date().toISOString(),
      healthStatus: healthData.status || 'ok',
      databaseId: databaseData.$id,
      databaseName: databaseData.name,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown keep-alive error';

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}