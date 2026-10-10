# Crescelo MCP API Reference

Official reference for all Model Context Protocol (MCP) tools exposed by the **Crescelo MCP Server**.

- **Base URL:** `https://www.crescelo.com/api/mcp`
- **Protocol Versions:** `2024-11-05`, `2025-03-26`
- **Transport:** Streamable HTTP / Server-Sent Events (SSE)

---

## 1. Summary of Tools

| Tool Name | Scope Required | Annotations | Description |
|-----------|----------------|-------------|-------------|
| `get_business_information` | `business:read` | Read-Only | Retrieves business name, address, hours, contact info, and website. |
| `list_services` | `services:read` | Read-Only | Lists all active services, durations, and pricing. |
| `get_service` | `services:read` | Read-Only | Looks up service details by name or ID. |
| `search_knowledge` | `knowledge:read` | Read-Only | Hybrid RAG search across uploaded documents, FAQs, and web pages. |
| `check_availability` | `bookings:read` | Read-Only | Real-time opening hours and conflict-free calendar slot lookup. |
| `create_booking` | `bookings:create` | Destructive / Confirmed | Books appointment with mutex concurrency locking and confirmation challenge. |
| `get_booking` | `bookings:read` | Read-Only | Retrieves appointment details by booking ID or customer email. |
| `cancel_booking` | `bookings:modify` | Destructive / Confirmed | Cancels an existing appointment with confirmation challenge. |
| `create_lead` | `leads:create` | Write | Ingests a new qualified prospective customer lead into the CRM. |
| `search_products` | `products:read` | Read-Only | Searches WooCommerce / catalog products with pricing and stock filters. |
| `get_product` | `products:read` | Read-Only | Retrieves rich product details, variations, and image URLs. |
| `get_booking_summary` | `analytics:read` | Read-Only | Summarizes appointment counts and fulfillment rates over N days. |
| `get_lead_summary` | `analytics:read` | Read-Only | Summarizes lead volume and conversion metrics over N days. |

---

## 2. Granular Tool Specifications

### `get_business_information`
- **Required Scope:** `business:read`
- **Input Parameters:** None (`{}`)
- **Returns:**
  ```json
  {
    "businessName": "Acme Wellness Clinic",
    "description": "Holistic therapy and rehabilitation center.",
    "website": "https://www.acmeclinic.com",
    "email": "contact@acmeclinic.com",
    "phone": "+1 (555) 234-5678",
    "address": "123 Main Street, Suite 400",
    "workingHours": {
      "monday": { "open": "09:00", "close": "17:00", "closed": false }
    }
  }
  ```

---

### `search_knowledge`
- **Required Scope:** `knowledge:read`
- **Input Parameters:**
  - `query` (string, required): Factual question or search keywords.
  - `limit` (integer, optional, default: 5, max: 20): Maximum chunks to return.
- **Defensive Framing:** All returned text passages are enclosed in `[BEGIN UNTRUSTED KNOWLEDGE PASSAGE]` and `[END UNTRUSTED KNOWLEDGE PASSAGE]` to neutralize indirect prompt injection payloads.

---

### `check_availability`
- **Required Scope:** `bookings:read`
- **Input Parameters:**
  - `date` (string, required): Target date in `YYYY-MM-DD` format.
  - `durationMinutes` (integer, optional, default: 30): Appointment duration in minutes.
  - `serviceId` (string, optional): Specific service identifier.
  - `timezone` (string, optional): IANA timezone string.
- **Returns:**
  ```json
  {
    "date": "2026-10-20",
    "dayOfWeek": "Tuesday",
    "availableSlots": ["09:00", "09:30", "10:00", "11:00", "14:00", "15:30"],
    "totalAvailable": 6
  }
  ```

---

### `create_booking`
- **Required Scope:** `bookings:create`
- **Input Parameters:**
  - `date` (string, required): `YYYY-MM-DD`.
  - `timeSlot` (string, required): `14:00` or `2:00 PM`.
  - `customerName` (string, required): Full name.
  - `customerEmail` (string, required): Valid email address.
  - `customerPhone` (string, optional): Phone number.
  - `serviceId` (string, optional): Service identifier.
  - `serviceName` (string, optional): Service title.
  - `durationMinutes` (integer, optional): Duration in minutes.
  - `notes` (string, optional): Special instructions.
  - `confirmed` (boolean, optional): Explicit confirmation flag. Must be `true` to execute.
- **Confirmation Behavior:**
  - If `confirmed` is omitted or `false`:
    ```json
    {
      "status": "requires_confirmation",
      "requiresExplicitConfirmation": true,
      "message": "Confirmation required: Please confirm with Alice Customer before finalizing the appointment for Consultation on 2026-10-20 at 14:00."
    }
    ```
  - If `confirmed: true`:
    Acquires calendar mutex lock, writes appointment to database, dispatches notifications, and returns:
    ```json
    {
      "status": "confirmed",
      "bookingId": "apt_89b21cf3e8",
      "date": "2026-10-20",
      "timeSlot": "14:00",
      "customerName": "Alice Customer"
    }
    ```

---

### `cancel_booking`
- **Required Scope:** `bookings:modify`
- **Input Parameters:**
  - `bookingId` (string, required): Appointment ID.
  - `reason` (string, optional): Reason for cancellation.
  - `confirmed` (boolean, optional): Explicit confirmation flag. Must be `true` to execute.

---

### `create_lead`
- **Required Scope:** `leads:create`
- **Input Parameters:**
  - `email` (string, required): Valid contact email.
  - `name` (string, optional): Prospect name.
  - `phone` (string, optional): Phone number.
  - `notes` (string, optional): Inquiry summary or project scope.
  - `customData` (object, optional): Structured qualifying data.

---

### `search_products`
- **Required Scope:** `products:read`
- **Input Parameters:**
  - `query` (string, required): Product search terms.
  - `category` (string, optional): Category filter.
  - `maxPrice` (number, optional): Price ceiling.
  - `limit` (integer, optional, default: 8): Max products to return.

---

## 3. Error Codes

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `-32001` / `UNAUTHORIZED` | `401` | Token is missing, invalid, expired, or revoked. |
| `FORBIDDEN` | `403` | Token lacks the required permission scope. |
| `NOT_FOUND` | `404` | Requested booking, service, or product was not found. |
| `VALIDATION_ERROR` | `400` | Input parameters failed Zod schema validation. |
| `CONFLICT` | `409` | Slot collision (the requested appointment time was already reserved). |
| `RATE_LIMITED` | `429` | Request threshold exceeded (100 req/min per workspace). |
| `INTERNAL_ERROR` | `500` | Unexpected server failure. Secrets are redacted automatically. |
