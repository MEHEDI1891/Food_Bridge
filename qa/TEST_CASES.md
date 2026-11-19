# Quality Assurance (QA) Test Report – FoodBridge

| Test ID | Dashboard Section | Test Scenario | Input / Action | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Section 1: Impact Dashboard | Verify KPI & Chart calculation | Load dashboard with 4 sample batches (`87.5 kg`) | Displays `87.5 kg` saved, `219` meals, `166.3 kg` CO2, and renders Bar/Doughnut charts | PASS |
| **TC-02** | Section 2: Restaurant Upload | Upload new surplus food listing | Submit valid restaurant, food item, kg, expiry hours, and location | HTTP 201 Created; new batch appears in NGO Collection & Tracker | PASS |
| **TC-03** | Section 3: NGO Collection | Claim available food batch | Select NGO name and click **Collect / Claim** | Batch status updates from `Available` to `Claimed` | PASS |
| **TC-04** | Section 3: NGO Collection | Confirm delivery completion | Click **Confirm Delivery** on claimed batch | Batch status updates to `Delivered` and Impact KPIs recalculate | PASS |
| **TC-05** | Section 4: Quantity, Expiry & Location Tracker | Live countdown & urgency badge | Set `expiryHours = 2.5` | Ticking `HH:MM:SS` countdown active with `CRITICAL` badge and Google Maps link | PASS |
