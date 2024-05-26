import {NextRequest, NextResponse} from 'next/server';
import {serverConfig} from '../../../config/server-config';
import {getAppCheck} from 'next-firebase-auth-edge/lib/app-check';

export async function POST(request: NextRequest) {
  const appCheckToken = request.headers.get('X-Firebase-AppCheck');
  const {verifyToken} = getAppCheck({
    serviceAccount: serverConfig.serviceAccount
  });

  if (!appCheckToken) {
    return new NextResponse(
      JSON.stringify({
        message: 'X-Firebase-AppCheck header is missing'
      }),
      {
        status: 400,
        headers: {'content-type': 'application/json'}
      }
    );
  }

  try {
    const response = await verifyToken(appCheckToken, {
      referer: request.headers.get('Referer') ?? ''
    });

    return new NextResponse(JSON.stringify(response.token), {
      status: 200,
      headers: {'content-type': 'application/json'}
    });
  } catch (e) {
    return new NextResponse(
      JSON.stringify({
        message: (e as Error)?.message
      }),
      {
        status: 500,
        headers: {'content-type': 'application/json'}
      }
    );
  }
}
