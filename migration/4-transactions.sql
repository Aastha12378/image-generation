-- 1. Create the ENUM type for status
DO $$ BEGIN
  CREATE TYPE transaction_status AS ENUM ('pending', 'processing', 'succeeded', 'failed', 'refunded');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2. Create the transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    amount INT NOT NULL,
    tax INT NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    status transaction_status NOT NULL,
    dodo_payment_id VARCHAR(255),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 3. Create indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_dodo_payment_id ON transactions(dodo_payment_id);


-- 5. Enable Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- 6. RLS policy: Allow users to view their own transactions
CREATE POLICY "Users can view their transactions"
ON transactions
FOR SELECT
USING (auth.uid() = user_id);

-- 7. RLS policy: Allow users to insert transactions
CREATE POLICY "Users can insert their transactions"
ON transactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 8. RLS policy: Allow users to update their transactions
CREATE POLICY "Users can update their transactions"
ON transactions
FOR UPDATE
USING (auth.uid() = user_id);

-- 9. RLS policy: Allow users to delete their transactions
CREATE POLICY "Users can delete their transactions"
ON transactions
FOR DELETE
USING (auth.uid() = user_id);
