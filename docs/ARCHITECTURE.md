# StockFlow Architecture

## Stack and layout

```text
frontend/project (React 18 + TypeScript + Vite + Tailwind)
  -> HTTP (`src/lib/api.ts`, VITE_API_BASE or :8002)
backend (FastAPI routers + services)
  -> Supabase PostgreSQL
  -> Gemini Vision (purchase-invoice OCR only)
```

```text
backend/  main.py; core/ (env, Supabase); routers/; services/; migrations/
frontend/project/src/  App.tsx; components/layout/; components/pages/; components/ui/; lib/api.ts; data/mockData.ts
```

## Backend modules

| Module | Role |
| --- | --- |
| `invoice_router` | Validates JPG/PNG/PDF purchase invoices (10 MB max); orchestrates OCR, GSTIN risk checks, vendor sync, invoice write, and conditional stock updates. |
| `sales_invoice_router` | Saves a sales invoice, deducts available stock, and writes `SALE` movements. |
| `challan_router` | Validates and stores delivery challans with JSON items. |
| `party_router` | Lists and creates parties. |
| `stock_movement_router` | Returns history and resolves purchase/sales invoice references. |
| `inventory_router` / `inventory_service` | Lists stock, derives low stock (`quantity < 10`), normalizes names, and creates/increments stock for purchases. |
| `ocr_service` | Gemini Vision JSON extraction for invoice image/PDF bytes. |
| `gstin_service` | GSTIN regex/state checks and `NONE`/`LOW`/`MEDIUM`/`HIGH`/`CRITICAL` risk. |

## Data flows

```text
Purchase: Upload -> Gemini OCR -> GSTIN checks
  -> CRITICAL: BLOCKED (no DB/stock write)
  -> otherwise: vendor lookup/create by GSTIN -> save invoice
  -> NONE/LOW: inventory create/increment -> PURCHASE movement
  -> MEDIUM/HIGH: MANUAL_REVIEW; no stock update

Sale: Form -> save sales invoice -> per item normalize/find/check stock
  -> decrement inventory -> SALE movement -> SOLD/SKIPPED/ERROR result
```

## Live Supabase schema (verified 2026-08-26)

| Table | Columns |
| --- | --- |
| `inventory` | `id`, `product_name`, `quantity`, `unit`, `unit_price`, `last_updated` |
| `invoices` | `id`, `vendor_name`, `vendor_gstin`, `vendor_address`, `invoice_number`, `invoice_date`, `total_amount`, `risk_level`, `status`, `created_at` |
| `sales_invoices` | `id`, `invoice_no`, `party_name`, `invoice_date`, `items`, `subtotal`, `tax_amount`, `total_amount`, `created_at` |
| `challans` | `id`, `challan_no`, `party_name`, `challan_date`, `delivery_address`, `transport_name`, `vehicle_no`, `items`, `created_at` |
| `vendors` | `id`, `name`, `gstin`, `address`, `state`, `created_at` |
| `parties` | `id`, `name`, `party_type`, `address`, `city`, `pincode`, `state`, `country`, `phone`, `email`, `website`, `gst_no`, `dl_no`, `food_licence_no`, `bank_acc`, `created_at` |
| `stock_movements` | `id`, `invoice_id`, `product_name`, `quantity_added`, `movement_type`, `created_at` |

## Constraints

- Multi-step Supabase writes are not database transactions.
- Sale invoices save before per-item stock operations; item-level skips/errors can coexist with a saved invoice. A local rollback is attempted if movement logging fails after deduction.
- `stock_movements.invoice_id` deliberately has no FK: it may reference either purchase or sales invoices (`migration 003`).
- Vendor sync is create-only by normalized GSTIN; OCR quality controls downstream data.

