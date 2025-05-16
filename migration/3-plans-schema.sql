-- Create table for subscription plans
CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- or use uuid_generate_v4()
    name VARCHAR(255) NOT NULL, -- e.g. "Pro", "Pro 50", etc.
    price INT NOT NULL, -- Price in cents
    token_limit INT NOT NULL, -- Monthly token limit
    dodo_product_id VARCHAR(255) NOT NULL, -- Product ID from Dodo
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    is_popular BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create ENUM type for subscription status
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') THEN
        CREATE TYPE subscription_status AS ENUM (
            'pending', 'active', 'on_hold', 'renewed',
            'paused', 'cancelled', 'failed', 'expired'
        );
    END IF;
END $$;

-- Create table for subscriptions
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    plan_id UUID NOT NULL,
    status subscription_status NOT NULL,
    dodo_subscription_id VARCHAR(255),
    start_date TIMESTAMP,
    next_billing_date TIMESTAMP,
    tokens_allocated INT DEFAULT 0 NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_plan_id FOREIGN KEY (plan_id) REFERENCES subscription_plans(id)
);

-- Add indexes for subscriptions table
CREATE INDEX user_plan_idx ON subscriptions (user_id, plan_id);
CREATE INDEX dodo_sub_idx ON subscriptions (dodo_subscription_id);