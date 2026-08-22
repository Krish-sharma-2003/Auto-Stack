# 🚀 StockFlow — AI-Powered Inventory & ERP System

<div align="center">

![StockFlow Banner](https://img.shields.io/badge/StockFlow-AI%20Powered%20ERP-3B82F6?style=for-the-badge&logo=lightning&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini%20Vision-4285F4?style=for-the-badge&logo=google&logoColor=white)

**StockFlow** is an AI-powered Inventory Management & Accounting ERP system built for Indian businesses.  
Upload an invoice image or PDF — AI extracts data, validates GSTIN, and auto-updates your stock. 

[Features](#-features) • [Tech Stack](#-tech-stack) • [Setup](#-setup) • [API Docs](#-api-endpoints) • [Screenshots](#-screenshots)

</div>

---

## 🎯 What Makes StockFlow Unique?

Traditional ERP systems (Tally, MARG) require **manual data entry** for every invoice. StockFlow solves this:

| Feature | Traditional ERP | StockFlow |
|---------|----------------|-----------|
| Invoice Entry | Manual typing | 📸 Upload image/PDF → AI extracts |
| GSTIN Validation | Manual check | ✅ Auto-validates via regex + state match |
| Fraud Detection | None | 🔍 Risk scoring system |
| Stock Update | Manual | ⚡ Automatic after invoice scan |
| Time per Invoice | 5-10 minutes | **< 30 seconds** |

---

## ✨ Features

### 🤖 AI Invoice Processing (Core USP)
- Upload **PDF, JPG, or PNG** invoices
- **Gemini Vision API** extracts vendor name, GSTIN, items, quantities, prices
- Automatic stock update after successful processing
- Support for medical, FMCG, and general trade invoices

### 🔐 GSTIN Fraud Detection
- **Format Validation** — Regex check against official GSTIN pattern
- **State Code Verification** — Cross-checks state in GSTIN vs vendor address
- **Risk Scoring System** — Assigns risk level: `NONE / LOW / MEDIUM / HIGH / CRITICAL`
- **Auto-block** suspicious invoices, flag for manual review

### 📦 Inventory Management
- Real-time stock tracking
- Low stock alerts with threshold configuration
- Stock movement history (audit trail)
- Per-product stock valuation

### 📊 Accounting & Reports
- Sales & Purchase Invoice creation
- Payment & Receipt Vouchers
- Ledger with Debit/Credit/Balance
- GST Reports (GSTR-1, GSTR-3B, HSN Summary)
- Export to PDF / Excel

### 🧾 Transaction Management
- Sales Invoice
- Purchase Entry (with AI auto-fill from scanned invoice)
- Delivery Challan
- Outstanding (Receivable/Payable tracking)

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| **FastAPI** | REST API framework |
| **Python 3.13** | Backend language |
| **Supabase** | PostgreSQL database + Auth |
| **Gemini Vision API** | Invoice OCR & data extraction |
| **google-generativeai** | Gemini SDK |
| **pdf2image + Pillow** | PDF to image conversion |

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 18 + TypeScript** | UI framework |
| **Tailwind CSS** | Styling |
| **shadcn/ui** | UI components |
| **Framer Motion** | Animations |
| **Recharts** | Charts & data visualization |
| **lucide-react** | Icons |
| **Vite** | Build tool |

---

## 📁 Project Structure

```
smart-inventory/
│
├── backend/
│   ├── main.py                    # FastAPI app entry point
│   ├── requirements.txt           # Python dependencies
│   ├── .env                       # Environment variables (DO NOT COMMIT)
│   ├── .env.example               # Environment template
│   │
│   ├── core/
│   │   ├── config.py              # Load env variables
│   │   └── supabase_client.py     # Supabase connection
│   │
│   ├── services/
│   │   ├── ocr_service.py         # Gemini Vision — invoice parsing
│   │   ├── gstin_service.py       # GSTIN validation & fraud detection
│   │   └── inventory_service.py   # Stock update logic
│   │
│   └── routers/
│       ├── invoice_router.py      # POST /api/invoices/upload
│       └── inventory_router.py    # GET /api/inventory/
│
├── frontend/
│   └── project/
│       ├── src/
│       │   ├── components/
│       │   │   ├── layout/        # Sidebar, Navbar
│       │   │   ├── pages/         # All page components
│       │   │   └── ui/            # shadcn components
│       │   ├── lib/
│       │   │   └── api.ts         # API base URL config
│       │   └── App.tsx            # Routes
│       ├── package.json
│       └── vite.config.ts
│
├── supabase_schema.sql            # Database schema
└── README.md
```

---

## ⚙️ Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- Supabase account (free tier works)
- Google AI Studio API key (free)

---

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/smart-inventory.git
cd smart-inventory
```

---

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env
```

Edit `.env` file:
```env
GEMINI_API_KEY=your_gemini_api_key_here
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
```

**Get Gemini API Key:**
1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Click "Get API Key"
3. Create new key → Copy it

**Get Supabase Keys:**
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Settings → API → Copy `Project URL` and `anon/public` key

---

### 3. Database Setup

1. Open Supabase Dashboard → SQL Editor
2. Paste contents of `supabase_schema.sql`
3. Click **Run**

This creates 4 tables:
- `invoices` — Invoice records with risk assessment
- `inventory` — Stock items
- `stock_movements` — Audit trail of all stock changes
- `vendors` — Vendor master data

---

### 4. Start Backend

```bash
cd backend
source venv/bin/activate
python3 -m uvicorn main:app --reload --port 8002
```

API will be available at: `http://localhost:8002`  
Swagger docs at: `http://localhost:8002/docs`

---

### 5. Frontend Setup

```bash
cd frontend/project

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at: `http://localhost:5173`

---

## 🔌 API Endpoints

### Invoice

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/invoices/upload` | Upload invoice image/PDF for AI processing |
| `GET` | `/api/invoices/` | Get all invoices |

### Inventory

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/inventory/` | Get all stock items with low stock alerts |

---

### Sample API Response — Invoice Upload

```json
{
  "success": true,
  "invoice_id": "5b10d74a-928f-479d-ad29-62493c419de1",
  "status": "PROCESSED",
  "invoice_data": {
    "vendor_name": "ANIL MEDICINE HOUSE",
    "gstin": "09BCBPC5463P1Z9",
    "invoice_number": "A000997",
    "invoice_date": "2025-01-21",
    "items": [
      {
        "name": "DEBISTAL-GM TAB",
        "quantity": 10,
        "unit": "1*10",
        "rate": 25.5,
        "amount": 255.0
      }
    ],
    "total_amount": 958.0
  },
  "gstin_report": {
    "format_check": {
      "valid": true,
      "state_code": "09",
      "state_name": "Uttar Pradesh"
    },
    "risk_assessment": {
      "score": 10,
      "level": "LOW",
      "action": "AUTO_APPROVE"
    }
  },
  "stock_update": {
    "success": true,
    "updated_items": 3,
    "results": [
      {
        "product": "DEBISTAL-GM TAB",
        "action": "CREATED",
        "new_qty": 10
      }
    ]
  }
}
```

---

## 🗄️ Database Schema

```sql
-- Invoices with risk assessment
invoices (id, vendor_name, vendor_gstin, vendor_address, 
          invoice_number, invoice_date, total_amount, 
          risk_level, status, created_at)

-- Real-time stock levels
inventory (id, product_name, quantity, unit, 
           unit_price, last_updated)

-- Full audit trail
stock_movements (id, invoice_id, product_name, 
                 quantity_added, movement_type, created_at)

-- Vendor master
vendors (id, name, gstin, address, state, created_at)
```

---

## 🔍 GSTIN Validation Logic

StockFlow implements a **multi-layer fraud detection** system:

```
Layer 1: Format Validation
  Pattern: ^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$
  Example: 09ABCDE1234F1Z5
  → Invalid format = CRITICAL risk

Layer 2: State Code Verification
  First 2 digits of GSTIN = State code
  Cross-check with vendor address
  → Mismatch = HIGH risk

Risk Score Calculation:
  CRITICAL flag = +40 points
  HIGH flag     = +25 points
  MEDIUM flag   = +10 points
  
  0-10  → NONE  → Auto Approve
  11-30 → LOW   → Auto Approve
  31-60 → HIGH  → Manual Review
  61+   → CRITICAL → Block
```

---

## 🚀 Deployment

### Backend (Railway / Render)
```bash
# Add to requirements.txt — already included
# Set environment variables in dashboard
# Start command:
uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Frontend (Vercel)
```bash
cd frontend/project
npm run build
# Deploy dist/ folder to Vercel
```

### Environment Variable for Production
```env
# frontend/project/.env.production
VITE_API_BASE=https://your-backend-url.railway.app
```

---

## 👨‍💻 Developer

**Krish Sharma**  
B.Tech CSE — MIET Meerut (2023-2027)  
Intern at IIT Roorkee AMSC Lab  

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgements

- [Google Gemini Vision API](https://ai.google.dev/) — Invoice OCR
- [Supabase](https://supabase.com/) — Database & Backend
- [FastAPI](https://fastapi.tiangolo.com/) — Python API Framework
- [shadcn/ui](https://ui.shadcn.com/) — UI Components
- IIT Roorkee Faculty — Project guidance

---

<div align="center">
Made with ❤️ for Indian Businesses
</div>
