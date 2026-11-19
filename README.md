# 🍲 FoodBridge – Smart Food Waste Reduction and Donation Management Platform

![Course](https://img.shields.io/badge/Course-SE%20331%20Capstone%20Project-blue)
![University](https://img.shields.io/badge/University-Daffodil%20International%20University-green)
![Stack](https://img.shields.io/badge/Tech%20Stack-Node.js%20%7C%20Express%20%7C%20SQL%20%7C%20Tailwind%20CSS%20%7C%20Docker-orange)
![CI](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-brightgreen)

**FoodBridge** is a smart food waste reduction and donation management platform designed to connect restaurants and food shops with surplus food to local NGOs and community volunteers. The unified dashboard integrates real-time quantity, live expiry countdown, and location tracking alongside waste reduction impact analytics.

---

## 🌟 Core Dashboard Modules (4 Integrated Sections)

1. **Waste Reduction & Donation Impact Dashboard:**
   - Real-time KPIs tracking total surplus food rescued (kg), waste reduction percentage, estimated meals donated, and $\text{CO}_2$ emissions prevented.
   - Interactive visual charts breaking down rescued food by category and collection lifecycle status.
2. **Restaurant & Shop Surplus Food Upload:**
   - Dedicated donor portal allowing restaurants, bakeries, and grocery shops to publish surplus food details, quantity (kg), safe shelf-life duration, and pickup location.
3. **NGO & Volunteer Food Collection:**
   - Streamlined pickup hub where NGOs and volunteers can claim available batches, assign collection teams, and verify final delivery.
4. **Live Quantity, Expiry & Location Tracking:**
   - Real-time tracking table with live ticking expiry countdown timers, automated urgency classification (`CRITICAL`, `EXPIRING SOON`, `FRESH`), quantity meters, and pickup location zone mapping.

---

## 🏗️ Project Architecture & Folder Structure

```text
FoodBridge/
├── .github/
│   └── workflows/
│       └── ci.yml              # DevOps: GitHub Actions CI pipeline
├── backend/
│   ├── server.js               # Express REST API & Expiry Priority Engine
│   ├── data/
│   │   └── db.json             # Persistent local JSON datastore
│   └── package.json            # Backend dependencies & scripts
├── frontend/
│   ├── index.html              # Unified 4-Section Dashboard UI
│   ├── styles.css              # Custom styling & status animations
│   └── app.js                  # Real-time countdowns, API calls & Chart.js
├── database/
│   ├── schema.sql              # Relational DB Schema (MySQL / PostgreSQL)
│   ├── seed.sql                # Sample seed records
│   └── ER_DIAGRAM.md           # Entity-Relationship documentation
├── devops/
│   ├── Dockerfile              # Docker container configuration
│   └── docker-compose.yml      # Multi-container deployment setup
├── qa/
│   ├── api.test.js             # Automated unit & API logic tests
│   └── TEST_CASES.md           # QA Test Plan & Execution Report
├── docs/
│   └── ARCHITECTURE.md         # System Architecture & UI/UX Workflow
├── .gitignore
└── README.md
```

---

## 🛠️ How to Run Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)

### Step-by-Step Setup
1. **Clone the repository:**
   ```bash
   git clone https://github.com/<your-username>/FoodBridge.git
   cd FoodBridge/backend
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Start the server:**
   ```bash
   npm start
   ```
4. **Open in Browser:**
   Visit `http://localhost:5000` to view the full **FoodBridge** 4-section dashboard.

### Running Automated QA Tests
```bash
cd backend
npm test
```

---

## 📡 REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Check backend service status |
| `GET` | `/api/stats` | Retrieve waste reduction & donation impact metrics |
| `GET` | `/api/donations` | Fetch all surplus food entries sorted by expiry urgency |
| `POST` | `/api/donations` | Upload new surplus food from a restaurant or shop |
| `PATCH` | `/api/donations/:id/claim` | Claim a food batch for NGO/Volunteer collection |
| `PATCH` | `/api/donations/:id/deliver` | Confirm successful delivery of claimed food |
