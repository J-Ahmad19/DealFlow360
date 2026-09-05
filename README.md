# DealFlow360

## Intelligent, Self-Governing Sales Operations Platform

DealFlow360 is a sales operations platform that manages the complete lifecycle:

**Quotation → Approval → Fulfillment → Billing → Negotiation → Reporting**

Business rules are enforced on the backend.

---

## 🚀 Features

- Role-Based Authentication & Authorization
- Customer & Product Management
- Dynamic Pricing
- Discount Governance & Approval
- Quotation Management
- Upsell & Cross-Sell Recommendations
- Multi-Warehouse Fulfillment
- One-Time & Recurring Billing
- Customer Negotiation
- Deal Health Monitoring
- Reporting & Dashboards
- Notifications & Audit Logs

---

## 🛠️ Tech Stack

**Frontend**
- React
- TypeScript
- React Router
- Zod

**Backend**
- Node.js
- Express.js
- TypeScript
- Drizzle ORM
- Zod

**Database & Services**
- PostgreSQL
- pgAdmin4
- Upstash Redis

---

## 🧩 Architecture

DealFlow360 uses a modular monolith architecture.

```text
React UI
   ↓
Express API
   ↓
Authentication & Zod Validation
   ↓
Service / Business Logic
   ↓
Rule Engines
   ↓
Drizzle ORM
   ↓
PostgreSQL

Redis → Caching / Rate Limiting
Workers → Background Jobs
```

---

## 👤 User Roles

| Role | Main Responsibilities |
|------|------------------------|
| Sales Representative | Create quotations, apply discounts, submit deals |
| Sales Manager | Review and approve quotations |
| Finance / Operations | Billing, fulfillment and inventory |
| Customer | View quotations and submit counter offers |
| Admin | Manage users, products, pricing and rules |

---

## 💰 Discount & Approval Rules

Discount limits are configured by customer tier and product type.

Example:

```text
GOLD Customer
Hardware → 15%
Service  → 10%
```

If the requested discount exceeds the configured limit, the backend automatically routes the quotation for approval.

```text
Discount Violation
       ↓
Approval Required
       ↓
Sales Manager
       ↓
Finance (when required)
```

The frontend cannot bypass these rules.

---

## 🧾 Quotation

A quotation contains:

- Customer
- Products
- Quantity
- Price
- Discount
- Tax
- Total
- Margin
- Approval Status
- Fulfillment Status
- Billing Type

---

## 🧠 Recommendations

The system can recommend related products for upselling and cross-selling.

Example:

```text
Laptop
   ↓
Extended Warranty
```

Recommendations should use actual product and quotation data.

---

## 🏭 Fulfillment

Orders can be fulfilled from multiple warehouses based on available inventory.

```text
Order: 100

Warehouse A → 60
Warehouse B → 40
```

---

## 💳 Billing

Supports both one-time and recurring billing.

```text
Laptop          → One-Time
Setup Service   → One-Time
Support Plan    → Recurring
```

---

## 🤝 Negotiation

Customers can submit counter offers.

```text
Original Discount → 15%
Counter Offer     → 22%
        ↓
Backend Rule Check
        ↓
Approval Required
```

---

## 🔐 Security

- Backend authentication and authorization
- Role-based access control
- Customer resource isolation
- Zod request validation
- Parameterized database queries
- Rate limiting
- Security headers
- Secrets stored in environment variables
- `.env` excluded from Git

Example customer isolation:

```text
AuthenticatedCustomer.id === Quotation.customerId
```

---

## ⚡ Performance

Use:

- Database indexes
- Pagination
- Redis caching
- Batching
- Background jobs
- Server-side aggregation
- N+1 query prevention

Example:

```text
GET /quotations?page=1&pageSize=25
```

---

## 🌱 Environment Variables

Create a `.env` file:

```env
NODE_ENV=development
DATABASE_URL=postgresql://username:password@localhost:5432/dealflow360
REDIS_URL=your_redis_url
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
WEB_URL=http://localhost:5173
API_URL=http://localhost:5000
```

**Never commit `.env` to Git.**

---

## 🚀 Installation

```bash
git clone <your-repository-url>
cd DealFlow360
npm install
```

Configure `.env`, create the PostgreSQL database, then run:

```bash
npm run db:migrate
npm run db:seed
npm run dev
```

---

## 🧪 Testing

Test the important business rules:

- Discount validation
- Approval routing
- Authentication & authorization
- Customer isolation
- Inventory allocation
- Billing
- Negotiation

---

## 🎯 MVP

1. Discount Risk & Approval
2. Quotation Builder
3. Upsell/Cross-Sell
4. Warehouse Fulfillment
5. Customer Negotiation
6. Hybrid Billing
7. Deal Health

---

## 📌 Core Principle

> **Business rules belong in the backend, not in frontend shortcuts.**

The backend is responsible for validation, authorization, pricing, discount governance, approval routing, inventory, billing, negotiation and auditability.

---

## 📄 License

For development and educational/hackathon purposes unless otherwise specified.
