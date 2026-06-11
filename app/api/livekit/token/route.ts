import { NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { roomName } = await req.json();

    if (!roomName) {
      return NextResponse.json({ error: 'Missing roomName' }, { status: 400 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('name')
      .eq('user_id', user.id)
      .single();

    const participantName = profile?.name || user.email || 'Anonymous';

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

    if (!apiKey || !apiSecret || !wsUrl) {
      console.error("LiveKit environment variables are missing");
      return NextResponse.json({ error: 'LiveKit configuration error' }, { status: 500 });
    }

    const at = new AccessToken(apiKey, apiSecret, {
      identity: user.id,
      name: participantName,
    });

    at.addGrant({ roomJoin: true, room: roomName, canPublish: true, canSubscribe: true });

    const token = await at.toJwt();

    return NextResponse.json({ token });
  } catch (error: any) {
    console.error("LiveKit token generation error:", error);
    return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 });
  }
}
