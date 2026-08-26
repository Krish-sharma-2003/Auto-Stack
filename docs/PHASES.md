# ERP Usage Phases

| Phase | User journey | Frontend | Backend |
| --- | --- | --- | --- |
| 1. Company & parties | Company details, parties, ledgers. | `/company`, `/account-groups`, `/ledger`, `AddPartyModal` | `GET/POST /api/parties/` only |
| 2. Inventory | View stock/low stock. Products are created by purchases; no dedicated product-create API. | `/stock`, `/low-stock` | `GET /api/inventory/` |
| 3. Purchase | Upload → extraction/risk → vendor sync → permitted stock update. | `/upload`, `/purchase` (UI entry) | `POST /api/invoices/upload`, `GET /api/invoices/` |
| 4. Sales | Select party/products → save invoice → deduct stock/log movement. | `/sales` | `POST /api/sales-invoices`, `GET /api/parties/`, `GET /api/inventory/` |
| 5. Delivery | Create goods-movement challan. | `/challan` | `POST /api/challans` |
| 6. Tracking/reports | Review stock/movements; use reporting screens. | `/stock-movement`, `/stock`, `/low-stock`, report routes | `GET /api/stock-movements/`, `GET /api/inventory/`; reports lack APIs |
| 7. Administration | Manage users/company. | `/users`, `/company` | Planned; no routes |

```text
Company/parties -> inventory baseline -> purchases -> sales -> challans
-> tracking/reports -> administration
```

