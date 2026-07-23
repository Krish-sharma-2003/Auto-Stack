// Central backend API base URL for the StockFlow FastAPI server.
// Override in dev by setting VITE_API_BASE in a .env file if needed.
export const API_BASE =
  (import.meta.env.VITE_API_BASE as string | undefined) || 'http://127.0.0.1:8002';
