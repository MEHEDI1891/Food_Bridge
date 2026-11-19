const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const DB_PATH = path.join(__dirname, 'data', 'db.json');
const FRONTEND_PATH = path.join(__dirname, '..', 'frontend');

app.use(cors());
app.use(express.json());
app.use(express.static(FRONTEND_PATH));

function readDB() {
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(raw);
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// Classify food expiry urgency
function calculateUrgency(expiryHours) {
  const hours = Number(expiryHours);
  if (hours <= 3) return 'CRITICAL';
  if (hours <= 6) return 'EXPIRING SOON';
  return 'FRESH';
}

// 1. Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', platform: 'FoodBridge', timestamp: new Date().toISOString() });
});

// 2. Waste Reduction & Donation Impact Analytics
app.get('/api/stats', (req, res) => {
  const db = readDB();
  const donations = db.donations;

  const totalFoodKg = donations.reduce((sum, item) => sum + Number(item.quantityKg || 0), 0);
  const rescuedKg = donations
    .filter((d) => d.status === 'Claimed' || d.status === 'Delivered')
    .reduce((sum, item) => sum + Number(item.quantityKg || 0), 0);

  const wasteReductionPercent =
    totalFoodKg > 0 ? Math.min(100, Math.round(((rescuedKg + totalFoodKg * 0.35) / totalFoodKg) * 100)) : 0;

  // 1 kg rescued food ~ 2.5 meals & ~1.9 kg CO2 prevented
  const estimatedMeals = Math.round(totalFoodKg * 2.5);
  const co2SavedKg = Number((totalFoodKg * 1.9).toFixed(1));

  const statusBreakdown = {
    Available: donations.filter((d) => d.status === 'Available').length,
    Claimed: donations.filter((d) => d.status === 'Claimed').length,
    Delivered: donations.filter((d) => d.status === 'Delivered').length,
  };

  const categoryMap = {};
  donations.forEach((d) => {
    categoryMap[d.category] = (categoryMap[d.category] || 0) + Number(d.quantityKg);
  });

  res.json({
    totalFoodKg: Number(totalFoodKg.toFixed(1)),
    rescuedKg: Number(rescuedKg.toFixed(1)),
    wasteReductionPercent,
    estimatedMeals,
    co2SavedKg,
    totalListings: donations.length,
    statusBreakdown,
    categoryBreakdown: categoryMap,
  });
});

// 3. Get All Donations (Sorted by Expiry Urgency)
app.get('/api/donations', (req, res) => {
  const db = readDB();
  const urgencyRank = { CRITICAL: 1, 'EXPIRING SOON': 2, FRESH: 3 };
  const sorted = [...db.donations].sort(
    (a, b) => (urgencyRank[a.urgency] || 9) - (urgencyRank[b.urgency] || 9)
  );
  res.json(sorted);
});

// 4. Restaurant / Shop Surplus Upload
app.post('/api/donations', (req, res) => {
  const { donorName, foodItem, category, quantityKg, expiryHours, location, zone, contactPhone } = req.body;

  if (!donorName || !foodItem || !quantityKg || !expiryHours || !location) {
    return res.status(400).json({ error: 'All required fields must be provided.' });
  }

  const hours = Number(expiryHours);
  const expiresAt = new Date(Date.now() + hours * 3600 * 1000).toISOString();

  const db = readDB();
  const newDonation = {
    id: `FB-${1001 + db.donations.length}`,
    donorName: donorName.trim(),
    foodItem: foodItem.trim(),
    category: category || 'Cooked Meals',
    quantityKg: Number(quantityKg),
    expiryHours: hours,
    expiresAt,
    urgency: calculateUrgency(hours),
    location: location.trim(),
    zone: (zone || location.split(',')[0]).trim(),
    contactPhone: (contactPhone || '01700-000000').trim(),
    status: 'Available',
    claimedBy: null,
    createdAt: new Date().toISOString(),
  };

  db.donations.unshift(newDonation);
  writeDB(db);

  res.status(201).json({ message: 'Surplus food uploaded & tracking started!', donation: newDonation });
});

// 5. NGO / Volunteer Food Collection Claim
app.patch('/api/donations/:id/claim', (req, res) => {
  const { id } = req.params;
  const { ngoName } = req.body;

  if (!ngoName || !ngoName.trim()) {
    return res.status(400).json({ error: 'NGO or Volunteer name is required.' });
  }

  const db = readDB();
  const item = db.donations.find((d) => d.id === id);

  if (!item) return res.status(404).json({ error: 'Food batch not found.' });
  if (item.status !== 'Available') {
    return res.status(400).json({ error: `Batch is already ${item.status}.` });
  }

  item.status = 'Claimed';
  item.claimedBy = ngoName.trim();
  writeDB(db);

  res.json({ message: 'Food batch assigned to NGO/Volunteer!', donation: item });
});

// 6. Confirm Collection & Delivery
app.patch('/api/donations/:id/deliver', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const item = db.donations.find((d) => d.id === id);

  if (!item) return res.status(404).json({ error: 'Food batch not found.' });

  item.status = 'Delivered';
  writeDB(db);

  res.json({ message: 'Food batch marked as collected & delivered!', donation: item });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(FRONTEND_PATH, 'index.html'));
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`FoodBridge server running on http://localhost:${PORT}`);
  });
}

module.exports = { app, calculateUrgency };
