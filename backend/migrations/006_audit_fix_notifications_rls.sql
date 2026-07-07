-- Audit fix: notification table and local API write access.

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recipient VARCHAR(128),
    type VARCHAR(50) NOT NULL,
    template VARCHAR(100),
    title VARCHAR(200),
    content TEXT NOT NULL,
    related_id VARCHAR(100),
    status VARCHAR(20) DEFAULT 'sent',
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

DO $$
BEGIN
    ALTER TABLE users DISABLE ROW LEVEL SECURITY;
EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'Skipping users RLS disable: current role is not table owner';
END $$;

DO $$
BEGIN
    ALTER TABLE demands DISABLE ROW LEVEL SECURITY;
EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'Skipping demands RLS disable: current role is not table owner';
END $$;
