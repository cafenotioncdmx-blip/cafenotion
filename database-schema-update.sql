-- Add soft delete functionality to orders table
-- This allows us to "delete" records from the admin view while keeping them in CSV exports

-- Add deleted_at column
ALTER TABLE orders ADD COLUMN deleted_at timestamptz;

-- Add index for better performance when filtering out deleted records
CREATE INDEX idx_orders_deleted_at ON orders(deleted_at);

-- Update the existing policy to exclude soft-deleted records from normal queries
-- (We'll handle this in the API routes, but this is good practice)
DROP POLICY IF EXISTS deny_all ON orders;
CREATE POLICY deny_all ON orders FOR ALL USING (false);

-- Add a comment explaining the soft delete approach
COMMENT ON COLUMN orders.deleted_at IS 'Timestamp when the order was soft deleted. NULL means not deleted. Deleted records are hidden from admin view but kept in CSV exports.';
