# StockFlow Design System

## Palette and typography

- Primary: `blue-500`, `blue-600`, `blue-700`; focus ring `blue-500`.
- Success/IN: `green-100`, `green-600`, `green-700`; error/OUT: `red-50`, `red-100`, `red-500`, `red-600`, `red-700`, `red-900`; warning: `amber-100`, `amber-500`, `amber-600`, `amber-700`.
- Neutrals: white and `slate-50` through `slate-800`. Global tokens specify a pale blue-slate background, white cards, blue primary, red destructive, and `0.5rem` radius.
- No custom font is defined. Body has `font-weight: 500`; headings are globally bold. Common sizes: `text-xl`/`text-2xl font-bold`, `text-sm` body, `text-xs` labels/tables.

## Component patterns

- Card: `bg-white rounded-xl`/`rounded-2xl shadow-sm border border-slate-100`; headers often `p-6 border-b` with slate-to-white gradient.
- Controls: `px-3`/`px-4 py-2 rounded-lg`, `border-slate-200`, `text-sm`, blue focus ring.
- Status pill: `px-2.5 py-1 rounded-full text-xs font-semibold`; green for IN/success, red for OUT/error.
- Icons: `lucide-react` (e.g. `Package`, `FileText`, `Search`, `Calendar`, `AlertTriangle`, `TrendingUp/Down`, `Plus`, `Trash2`, `Printer`, `Save`).

## Motion and async feedback

- Framer Motion convention: `initial={{ opacity: 0, y: 20 }}` → `animate={{ opacity: 1, y: 0 }}`, with stagger delays; `AnimatePresence` for modals/conditional panels.
- `StockMovementHistory.tsx` defines the async reference: spinner + muted copy for loading, pale-red `AlertTriangle` error panel, centered `PackageSearch` empty state, and a responsive filtered table for data.

