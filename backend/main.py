from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.invoice_router import router as invoice_router
from routers.inventory_router import router as inventory_router 
from routers.challan_router import router as challan_router
from routers.sales_invoice_router import router as sales_invoice_router
from routers.stock_movement_router import router as stock_movement_router
from routers.party_router import router as party_router
from routers.company_router import router as company_router
app = FastAPI(
    title="Smart Inventory API",
    description="AI-powered invoice processing & inventory management system",
    version="1.0.0"
)
# CORS — allow frontend to call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite dev server (default)
        "http://localhost:5174",   # Vite dev server (StockFlow frontend)
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Register routers
app.include_router(invoice_router)
app.include_router(inventory_router)
app.include_router(challan_router)
app.include_router(sales_invoice_router)
app.include_router(stock_movement_router)
app.include_router(party_router)
app.include_router(company_router)

@app.get("/")
async def root():
    return {
        "message": "Smart Inventory API is running",
        "docs": "/docs"  # Swagger UI available here
    }
