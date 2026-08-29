-- ============================================================
-- OPTIONAL BACKFILL — Do NOT run automatically.
-- ============================================================
-- Use this ONLY after you manually create your demo company
-- and know its UUID. Replace 'YOUR-COMPANY-ID-HERE' with the
-- actual company id from your companies table.
--
-- Example to find your company id:
--   SELECT id, name FROM public.companies;
-- ============================================================

UPDATE public.inventory        SET company_id = 'YOUR-COMPANY-ID-HERE' WHERE company_id IS NULL;
UPDATE public.invoices          SET company_id = 'YOUR-COMPANY-ID-HERE' WHERE company_id IS NULL;
UPDATE public.sales_invoices   SET company_id = 'YOUR-COMPANY-ID-HERE' WHERE company_id IS NULL;
UPDATE public.challans         SET company_id = 'YOUR-COMPANY-ID-HERE' WHERE company_id IS NULL;
UPDATE public.vendors          SET company_id = 'YOUR-COMPANY-ID-HERE' WHERE company_id IS NULL;
UPDATE public.parties          SET company_id = 'YOUR-COMPANY-ID-HERE' WHERE company_id IS NULL;
UPDATE public.stock_movements  SET company_id = 'YOUR-COMPANY-ID-HERE' WHERE company_id IS NULL;
