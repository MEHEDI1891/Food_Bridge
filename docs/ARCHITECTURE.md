# System Architecture & Dashboard Design – FoodBridge

## 1. Unified 4-Section Dashboard Design
To ensure seamless usability for both food donors and NGOs, **FoodBridge** consolidates all core workflows into a single unified dashboard:
1. **Waste Reduction & Donation Impact Dashboard:** Displays total kg saved, waste reduction percentage, estimated meals donated, $\text{CO}_2$ prevented, and real-time Chart.js analytics.
2. **Restaurant / Shop Surplus Upload:** Allows instant entry of surplus food batches with category, weight (kg), safe shelf life (hours), area zone, and pickup address.
3. **NGO & Volunteer Food Collection:** Enables NGOs and volunteers to claim available food batches and confirm final delivery.
4. **Food Quantity, Expiry & Location Tracker:** Tracks batch weight bars, live ticking expiry countdown timers, urgency tags (`CRITICAL`, `EXPIRING SOON`, `FRESH`), and pickup map links.

## 2. Technology Stack
- **Frontend:** HTML5, Tailwind CSS, Vanilla JavaScript (ES6+), Chart.js
- **Backend:** Node.js, Express.js REST API
- **Database:** PostgreSQL/MySQL relational schema (`database/schema.sql`) with local JSON persistence (`backend/data/db.json`)
- **DevOps & QA:** Docker, GitHub Actions CI, Node Native Test Runner
