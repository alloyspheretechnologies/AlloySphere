import { NextResponse } from 'next/server';
import { emailService } from '@/lib/services/email.service';
import { createSupabaseAdminClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    // Basic API Key check (you should implement a more robust webhook secret)
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.WEBHOOK_SECRET || 'alloy_secret'}`) {
      // Allow passing for development if no secret configured
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const payload = await req.json();
    
    // Supabase webhook payload structure: { type: 'INSERT', table: 'notifications', record: { ... } }
    if (payload.type === 'INSERT' && payload.table === 'notifications' && payload.record) {
      const notification = payload.record;
      
      // Fetch user email
      const supabase = await createSupabaseAdminClient();
      const { data: userData } = await supabase.auth.admin.getUserById(notification.user_id);
      
      if (!userData?.user?.email) {
        return NextResponse.json({ error: 'User email not found' }, { status: 404 });
      }

      // Check user preferences here (omitted for brevity, assume enabled)
      const userEmail = userData.user.email;

      const notifLink = notification.data?.link || notification.link;
      const linkUrl = notifLink ? `${process.env.NEXT_PUBLIC_SITE_URL}${notifLink}` : '';

      // Route based on notification type
      if (notification.type === 'message') {
        // Message payload might have sender_name in body or title, but let's parse from title: "New message from XYZ"
        const senderName = notification.title.replace('New message from ', '') || 'A user';
        await emailService.sendMessageEmail(
          userEmail,
          senderName,
          notification.body || 'You have a new message.',
          linkUrl
        );
      } else if (notification.type === 'connection_request') {
        await emailService.sendConnectionEmail(
          userEmail,
          notification.title,
          notification.body || 'Someone wants to connect with you.',
          linkUrl
        );
      } else if (notification.type === 'application_received') {
        await emailService.sendApplicationEmail(
          userEmail,
          notification.title,
          notification.body || 'A new application has been submitted.',
          linkUrl
        );
      } else {
        // Generic template for startup_liked, startup_followed, investor_interest, etc.
        await emailService.sendNotificationEmail(
          userEmail,
          notification.title,
          notification.body || 'You have a new notification on AlloySphere.',
          linkUrl ? linkUrl : undefined,
          linkUrl ? 'View Notification' : undefined
        );
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });

  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
