# import google.generativeai as genai
# import json
# import re
# from PIL import Image
# import io
# from core.config import GEMINI_API_KEY

# # Initialize Gemini
# genai.configure(api_key=GEMINI_API_KEY)
# model = genai.GenerativeModel("gemini-1.5-flash-latest") # Free tier model


# INVOICE_PROMPT = """
# You are an invoice data extraction expert.
# Analyze this invoice image and extract all information.

# Return ONLY a valid JSON object — no explanation, no markdown, no extra text.

# JSON format to return:
# {
#   "vendor_name": "string or null",
#   "vendor_address": "string or null",
#   "vendor_gstin": "string or null",
#   "invoice_number": "string or null",
#   "invoice_date": "YYYY-MM-DD or null",
#   "items": [
#     {
#       "name": "product name",
#       "quantity": number,
#       "unit": "pcs/kg/box/etc",
#       "unit_price": number,
#       "total_price": number,
#       "hsn_code": "string or null"
#     }
#   ],
#   "subtotal": number or null,
#   "cgst": number or null,
#   "sgst": number or null,
#   "igst": number or null,
#   "total_amount": number or null,
#   "notes": "any other relevant info or null"
# }

# Rules:
# - If a field is not visible or unclear, return null for that field
# - For numbers, return only the numeric value (no currency symbols)
# - invoice_date must be in YYYY-MM-DD format
# - Extract ALL items from the invoice, even if there are many
# """


# async def parse_invoice_image(image_bytes: bytes, filename: str) -> dict:
#     """
#     Send invoice image to Gemini Vision and get structured data back.
    
#     Args:
#         image_bytes: Raw image bytes from uploaded file
#         filename: Original filename (to detect format)
    
#     Returns:
#         Parsed invoice data as dictionary
#     """
#     try:
#         # Convert bytes to PIL Image
#         image = Image.open(io.BytesIO(image_bytes))

#         # Send to Gemini
#         response = model.generate_content([INVOICE_PROMPT, image])
#         raw_text = response.text.strip()

#         # Clean response — remove markdown code blocks if present
#         raw_text = re.sub(r'^```json\s*', '', raw_text)
#         raw_text = re.sub(r'\s*```$', '', raw_text)
#         raw_text = raw_text.strip()

#         # Parse JSON
#         parsed_data = json.loads(raw_text)

#         return {
#             "success": True,
#             "data": parsed_data,
#             "raw_response": raw_text
#         }

#     except json.JSONDecodeError as e:
#         return {
#             "success": False,
#             "error": f"Gemini returned invalid JSON: {str(e)}",
#             "raw_response": raw_text if 'raw_text' in locals() else None
#         }

#     except Exception as e:
#         return {
#             "success": False,
#             "error": f"OCR failed: {str(e)}"
#         }


# async def parse_invoice_pdf(pdf_bytes: bytes) -> dict:
#     """
#     Handle PDF invoices — convert first page to image, then parse.
#     Requires: pip install pdf2image poppler
#     """
#     try:
#         from pdf2image import convert_from_bytes
        
#         # Convert first page of PDF to image
#         images = convert_from_bytes(pdf_bytes, first_page=1, last_page=1)
#         if not images:
#             return {"success": False, "error": "Could not convert PDF to image"}

#         # Convert PIL image to bytes
#         img_byte_arr = io.BytesIO()
#         images[0].save(img_byte_arr, format='PNG')
#         img_bytes = img_byte_arr.getvalue()

#         # Use same image parser
#         return await parse_invoice_image(img_bytes, "invoice.png")

#     except ImportError:
#         return {
#             "success": False,
#             "error": "pdf2image not installed. Run: pip install pdf2image"
#         }
#     except Exception as e:
#         return {
#             "success": False,
#             "error": f"PDF parsing failed: {str(e)}"
#         }
from google import genai
from google.genai import types
import json
import re
from PIL import Image
import io
import asyncio
from core.config import GEMINI_API_KEY

client = genai.Client(api_key=GEMINI_API_KEY)

INVOICE_PROMPT = """Extract the following from this invoice and return ONLY valid JSON, no extra text:
{
  "vendor_name": "",
  "gstin": "",
  "invoice_number": "",
  "invoice_date": "",
  "items": [{"name": "", "quantity": 0, "unit": "", "rate": 0, "amount": 0}],
  "subtotal": 0,
  "tax_amount": 0,
  "total_amount": 0
}"""

def _call_gemini_image(image_bytes: bytes) -> dict:
    image = Image.open(io.BytesIO(image_bytes))
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[INVOICE_PROMPT, image]
    )
    text = response.text.strip()
    text = re.sub(r'```json|```', '', text).strip()
    return json.loads(text)

def _call_gemini_pdf(pdf_bytes: bytes) -> dict:
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[
            types.Part.from_bytes(data=pdf_bytes, mime_type="application/pdf"),
            INVOICE_PROMPT
        ]
    )
    text = response.text.strip()
    text = re.sub(r'```json|```', '', text).strip()
    return json.loads(text)

async def parse_invoice_image(image_bytes: bytes) -> dict:
    try:
        loop = asyncio.get_event_loop()
        parsed = await loop.run_in_executor(None, _call_gemini_image, image_bytes)
        return {"success": True, "data": parsed}
    except Exception as e:
        return {"success": False, "error": str(e)}

async def parse_invoice_pdf(pdf_bytes: bytes) -> dict:
    try:
        loop = asyncio.get_event_loop()
        parsed = await loop.run_in_executor(None, _call_gemini_pdf, pdf_bytes)
        return {"success": True, "data": parsed}
    except Exception as e:
        return {"success": False, "error": str(e)}