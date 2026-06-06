-- =============================================================
-- AlloySphere Migration 00007: Messaging System
-- =============================================================

-- Conversations
CREATE TABLE conversations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type            text DEFAULT 'direct' CHECK (type IN ('direct', 'group')),
  name            text,
  created_by      uuid REFERENCES profiles(id) ON DELETE SET NULL,
  last_message_at timestamptz DEFAULT now(),
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX idx_conversations_last_msg ON conversations(last_message_at DESC);

-- Conversation Participants
CREATE TABLE conversation_participants (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_read_at    timestamptz DEFAULT now(),
  joined_at       timestamptz DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);

CREATE INDEX idx_conv_participants_conv ON conversation_participants(conversation_id);
CREATE INDEX idx_conv_participants_user ON conversation_participants(user_id);

-- Messages
CREATE TABLE messages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content         text NOT NULL,
  media_url       text,
  is_read         boolean DEFAULT false,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX idx_messages_conv     ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender   ON messages(sender_id);

CREATE TRIGGER trg_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Update conversation.last_message_at on new message
CREATE OR REPLACE FUNCTION handle_new_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_message_update_conv
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION handle_new_message();
