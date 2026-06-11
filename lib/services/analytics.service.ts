import posthog from 'posthog-js';

// Define strict event types based on the Event Tracking Matrix
export type AnalyticsEvent = 
  // Auth
  | 'signup_started' 
  | 'signup_completed' 
  | 'login' 
  | 'logout'
  // Startup
  | 'startup_created' 
  | 'startup_viewed' 
  | 'startup_liked' 
  | 'startup_followed' 
  | 'startup_shared'
  // Investor
  | 'investor_profile_viewed' 
  | 'data_room_requested' 
  | 'data_room_granted' 
  | 'pitch_deck_viewed'
  // Talent
  | 'resume_uploaded' 
  | 'portfolio_uploaded' 
  | 'profile_viewed'
  // Conference
  | 'conference_created' 
  | 'conference_joined' 
  | 'conference_left' 
  | 'document_shared'
  // Collaboration
  | 'collaboration_request_sent' 
  | 'collaboration_request_accepted';

class AnalyticsService {
  private isInitialized = false;

  init() {
    if (typeof window !== 'undefined' && !this.isInitialized) {
      const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY || 'phc_placeholder';
      const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';
      
      posthog.init(apiKey, {
        api_host: apiHost,
        loaded: () => {
          this.isInitialized = true;
        },
        autocapture: false, // We rely on explicit tracking
        capture_pageview: true,
      });
    }
  }

  identify(userId: string, traits?: Record<string, any>) {
    if (typeof window === 'undefined') return;
    posthog.identify(userId, traits);
  }

  track(event: AnalyticsEvent, properties?: Record<string, any>) {
    if (typeof window === 'undefined') return;
    posthog.capture(event, properties);
  }

  reset() {
    if (typeof window === 'undefined') return;
    posthog.reset();
  }
}

export const analyticsService = new AnalyticsService();
