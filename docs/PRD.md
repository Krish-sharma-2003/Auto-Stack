# StockFlow PRD

## Problem and users

Manual purchase-invoice entry delays stock updates and causes quantity/GSTIN mistakes. StockFlow serves Indian SMBs, distributors, pharmacies, and general-trade/accounting teams that buy, stock, and sell goods.

## Product promise

Convert invoice images/PDFs into validated purchase data and stock changes, alongside sales, delivery, stock movements, and ERP views.

## Scope

| Area | Status |
| --- | --- |
| Purchase OCR, GSTIN gating, vendor creation, stock update | Built backend + UI |
| Sales invoice, stock deduction, movement log, parties | Built backend + UI |
| Challan, inventory, live stock history, dashboard | Built; relevant pages use live APIs |
| Accounting, reports, company profile, users | UI-only/local/mock data; no matching backend APIs |

## Differentiator

Gemini OCR plus GSTIN format/address-state validation produces `NONE`, `LOW`, `MEDIUM`, `HIGH`, or `CRITICAL` risk. `NONE/LOW` update stock; `MEDIUM/HIGH` become manual review; `CRITICAL` is blocked before persistence.

## Planned / incomplete

- Persisted users and company settings; real report/accounting APIs.
- Functional PDF/export and WhatsApp sharing (some UI controls exist but services do not).
- OAuth/login and a landing page.

## Non-goals now

- Full ledger/payment posting, tax filing, stock reservations, or purchase orders.
- Multi-user auth/roles and end-to-end transactional consistency.
- Replacing human review for elevated GSTIN risk.

