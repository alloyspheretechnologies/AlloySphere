-- Add new notification types
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'startup_liked';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'connection_request';

-- 1. Trigger for Startup Liked
CREATE OR REPLACE FUNCTION trigger_startup_liked()
RETURNS TRIGGER AS $$
DECLARE
  v_owner_id uuid;
  v_startup_name text;
  v_liker_name text;
BEGIN
  -- Get startup owner and name
  SELECT owner_id, name INTO v_owner_id, v_startup_name FROM startups WHERE id = NEW.startup_id;
  
  -- Get liker name
  SELECT name INTO v_liker_name FROM profiles WHERE id = NEW.user_id;

  -- Don't notify if the owner liked their own startup
  IF v_owner_id != NEW.user_id THEN
    PERFORM create_notification(
      v_owner_id,
      'startup_liked',
      v_liker_name || ' liked ' || v_startup_name,
      v_liker_name || ' recently liked your startup profile.',
      jsonb_build_object('startup_id', NEW.startup_id, 'liker_id', NEW.user_id, 'link', '/startup/' || (SELECT slug FROM startups WHERE id = NEW.startup_id))
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_startup_liked
  AFTER INSERT ON startup_likes
  FOR EACH ROW EXECUTE FUNCTION trigger_startup_liked();


-- 2. Trigger for Startup Followed
CREATE OR REPLACE FUNCTION trigger_startup_followed()
RETURNS TRIGGER AS $$
DECLARE
  v_owner_id uuid;
  v_startup_name text;
  v_follower_name text;
BEGIN
  SELECT owner_id, name INTO v_owner_id, v_startup_name FROM startups WHERE id = NEW.startup_id;
  SELECT name INTO v_follower_name FROM profiles WHERE id = NEW.user_id;

  IF v_owner_id != NEW.user_id THEN
    PERFORM create_notification(
      v_owner_id,
      'startup_followed',
      v_follower_name || ' followed ' || v_startup_name,
      v_follower_name || ' started following your startup. Keep them engaged with regular updates!',
      jsonb_build_object('startup_id', NEW.startup_id, 'follower_id', NEW.user_id, 'link', '/startup/' || (SELECT slug FROM startups WHERE id = NEW.startup_id))
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_startup_followed
  AFTER INSERT ON startup_followers
  FOR EACH ROW EXECUTE FUNCTION trigger_startup_followed();


-- 3. Trigger for Investor Interest (Saved Startup)
CREATE OR REPLACE FUNCTION trigger_investor_saved_startup()
RETURNS TRIGGER AS $$
DECLARE
  v_owner_id uuid;
  v_startup_name text;
  v_investor_name text;
BEGIN
  SELECT owner_id, name INTO v_owner_id, v_startup_name FROM startups WHERE id = NEW.startup_id;
  SELECT name INTO v_investor_name FROM profiles WHERE id = NEW.user_id;

  IF v_owner_id != NEW.user_id THEN
    PERFORM create_notification(
      v_owner_id,
      'investor_interest',
      'Investor saved ' || v_startup_name,
      v_investor_name || ' has saved your startup to their watchlist.',
      jsonb_build_object('startup_id', NEW.startup_id, 'investor_id', NEW.user_id, 'link', '/startup/' || (SELECT slug FROM startups WHERE id = NEW.startup_id))
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_investor_saved_startup
  AFTER INSERT ON saved_startups
  FOR EACH ROW EXECUTE FUNCTION trigger_investor_saved_startup();


-- 4. Trigger for New Message
CREATE OR REPLACE FUNCTION trigger_new_message()
RETURNS TRIGGER AS $$
DECLARE
  v_sender_name text;
  v_participant_id uuid;
BEGIN
  SELECT name INTO v_sender_name FROM profiles WHERE id = NEW.sender_id;

  -- Notify all other participants in the conversation
  FOR v_participant_id IN 
    SELECT user_id FROM conversation_participants 
    WHERE conversation_id = NEW.conversation_id AND user_id != NEW.sender_id
  LOOP
    PERFORM create_notification(
      v_participant_id,
      'message',
      'New message from ' || v_sender_name,
      NEW.content,
      jsonb_build_object('conversation_id', NEW.conversation_id, 'sender_id', NEW.sender_id, 'link', '/messages/' || NEW.conversation_id)
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_new_message
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION trigger_new_message();


-- 5. Trigger for Connection Request
CREATE OR REPLACE FUNCTION trigger_connection_request()
RETURNS TRIGGER AS $$
DECLARE
  v_requester_name text;
BEGIN
  SELECT name INTO v_requester_name FROM profiles WHERE id = NEW.requester_id;

  PERFORM create_notification(
    NEW.receiver_id,
    'connection_request',
    'New connection request',
    v_requester_name || ' wants to connect with you.',
    jsonb_build_object('request_id', NEW.id, 'requester_id', NEW.requester_id, 'link', '/network')
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_connection_request
  AFTER INSERT ON connection_requests
  FOR EACH ROW EXECUTE FUNCTION trigger_connection_request();


-- 6. Trigger for New Application (Collaboration request)
CREATE OR REPLACE FUNCTION trigger_new_application()
RETURNS TRIGGER AS $$
DECLARE
  v_applicant_name text;
  v_startup_id uuid;
  v_owner_id uuid;
  v_opportunity_title text;
BEGIN
  SELECT name INTO v_applicant_name FROM profiles WHERE id = NEW.applicant_id;
  SELECT startup_id, title INTO v_startup_id, v_opportunity_title FROM opportunities WHERE id = NEW.opportunity_id;
  SELECT owner_id INTO v_owner_id FROM startups WHERE id = v_startup_id;

  PERFORM create_notification(
    v_owner_id,
    'application_received',
    'New Application for ' || v_opportunity_title,
    v_applicant_name || ' applied for ' || v_opportunity_title,
    jsonb_build_object('application_id', NEW.id, 'applicant_id', NEW.applicant_id, 'link', '/applications')
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_new_application
  AFTER INSERT ON applications
  FOR EACH ROW EXECUTE FUNCTION trigger_new_application();
