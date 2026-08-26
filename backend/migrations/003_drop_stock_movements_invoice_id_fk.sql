-- stock_movements may refer to either purchase invoices or sales invoices.
-- Keep invoice_id as a UUID value but remove single-table FK enforcement.
ALTER TABLE public.stock_movements
  DROP CONSTRAINT IF EXISTS stock_movements_invoice_id_fkey;
