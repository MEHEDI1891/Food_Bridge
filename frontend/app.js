const API_BASE = '/api';
let allDonations = [];
let categoryChartInstance = null;
let statusChartInstance = null;

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 3200);
}

// Format remaining time from ISO timestamp into HH:MM:SS
function getRemainingTimeText(expiresAt) {
  const diffMs = new Date(expiresAt).getTime() - Date.now();
  if (diffMs <= 0) return '00h 00m 00s (Expired)';
  const totalSec = Math.floor(diffMs / 1000);
  const hrs = String(Math.floor(totalSec / 3600)).padStart(2, '0');
  const mins = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
  const secs = String(totalSec % 60).padStart(2, '0');
  return `${hrs}h ${mins}m ${secs}s left`;
}

function getUrgencyBadge(urgency) {
  if (urgency === 'CRITICAL') {
    return '<span class="badge-critical px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-700 border border-red-200">CRITICAL</span>';
  }
  if (urgency === 'EXPIRING SOON') {
    return '<span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">EXPIRING SOON</span>';
  }
  return '<span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">FRESH</span>';
}

// Section 1: Load Impact Dashboard Stats & Charts
async function loadStats() {
  try {
    const res = await fetch(`${API_BASE}/stats`);
    const stats = await res.json();

    document.getElementById('kpi-total-kg').textContent = `${stats.totalFoodKg} kg`;
    document.getElementById('kpi-reduction-rate').textContent = `${stats.wasteReductionPercent}%`;
    document.getElementById('kpi-meals').textContent = stats.estimatedMeals.toLocaleString();
    document.getElementById('kpi-co2').textContent = `${stats.co2SavedKg} kg`;

    renderCharts(stats);
  } catch (err) {
    console.error('Failed to load impact stats:', err);
  }
}

function renderCharts(stats) {
  const catCtx = document.getElementById('categoryChart').getContext('2d');
  const statusCtx = document.getElementById('statusChart').getContext('2d');

  if (categoryChartInstance) categoryChartInstance.destroy();
  if (statusChartInstance) statusChartInstance.destroy();

  categoryChartInstance = new Chart(catCtx, {
    type: 'bar',
    data: {
      labels: Object.keys(stats.categoryBreakdown),
      datasets: [
        {
          label: 'Food Saved (kg)',
          data: Object.values(stats.categoryBreakdown),
          backgroundColor: ['#059669', '#0284c7', '#d97706', '#7c3aed'],
          borderRadius: 8,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
    },
  });

  statusChartInstance = new Chart(statusCtx, {
    type: 'doughnut',
    data: {
      labels: ['Available for Pickup', 'Claimed by NGO', 'Collected & Delivered'],
      datasets: [
        {
          data: [
            stats.statusBreakdown.Available,
            stats.statusBreakdown.Claimed,
            stats.statusBreakdown.Delivered,
          ],
          backgroundColor: ['#f59e0b', '#3b82f6', '#10b981'],
        },
      ],
    },
    options: { responsive: true },
  });
}

// Fetch all donations and render Sections 3 & 4
async function loadDonations() {
  try {
    const res = await fetch(`${API_BASE}/donations`);
    allDonations = await res.json();
    renderAll();
  } catch (err) {
    console.error('Failed to load donations:', err);
  }
}

function renderAll() {
  renderNGOCollectionSection();
  renderTrackingSection();
}

// Section 3: Render NGO & Volunteer Collection Cards
function renderNGOCollectionSection() {
  const container = document.getElementById('ngo-collection-list');
  if (allDonations.length === 0) {
    container.innerHTML = '<p class="text-sm text-slate-500">No surplus food batches uploaded yet.</p>';
    return;
  }

  container.innerHTML = allDonations
    .map(
      (item) => `
    <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <span class="text-xs font-mono font-bold text-slate-400">${item.id}</span>
          ${getUrgencyBadge(item.urgency)}
          <span class="text-xs text-slate-400">&bull; ${item.category}</span>
        </div>
        <h3 class="text-base font-bold text-slate-900">${item.foodItem}</h3>
        <p class="text-xs font-semibold text-emerald-700">${item.donorName} &bull; ${item.quantityKg} kg</p>
        <p class="text-xs text-slate-500">📍 ${item.location} &nbsp;|&nbsp; 📞 ${item.contactPhone}</p>
        ${
          item.claimedBy
            ? `<p class="text-xs font-semibold text-blue-700">🤝 Assigned NGO/Volunteer: ${item.claimedBy}</p>`
            : ''
        }
      </div>

      <div class="flex sm:flex-col items-end justify-between gap-2 shrink-0">
        <span class="text-[11px] font-bold uppercase px-2.5 py-1 rounded-lg ${
          item.status === 'Available'
            ? 'bg-amber-50 text-amber-700'
            : item.status === 'Claimed'
            ? 'bg-blue-50 text-blue-700'
            : 'bg-emerald-50 text-emerald-700'
        }">${item.status}</span>

        ${
          item.status === 'Available'
            ? `<button onclick="claimFood('${item.id}')" class="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm">Collect / Claim</button>`
            : item.status === 'Claimed'
            ? `<button onclick="deliverFood('${item.id}')" class="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm">Confirm Delivery</button>`
            : `<span class="text-xs font-bold text-emerald-700">&#10003; Delivered</span>`
        }
      </div>
    </div>
  `
    )
    .join('');
}

// Section 4: Render Quantity, Expiry & Location Tracking Table
function renderTrackingSection() {
  const zoneFilter = document.getElementById('filter-zone').value;
  const urgencyFilter = document.getElementById('filter-urgency').value;
  const tbody = document.getElementById('tracking-table-body');

  const filtered = allDonations.filter((d) => {
    const matchZone = zoneFilter === 'ALL' || (d.zone && d.zone.toLowerCase().includes(zoneFilter.toLowerCase()));
    const matchUrgency = urgencyFilter === 'ALL' || d.urgency === urgencyFilter;
    return matchZone && matchUrgency;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="py-6 text-center text-slate-500 text-xs">No tracked food batches match the selected filters.</td></tr>';
    return;
  }

  tbody.innerHTML = filtered
    .map((item) => {
      const pct = Math.min(100, Math.round((item.quantityKg / 40) * 100));
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.location)}`;
      return `
      <tr class="hover:bg-slate-50/80 transition">
        <td class="py-3.5 px-4">
          <div class="font-bold text-slate-900 text-xs">${item.id} &mdash; ${item.foodItem}</div>
          <div class="text-xs text-slate-500">${item.donorName}</div>
        </td>
        <td class="py-3.5 px-4">
          <div class="font-bold text-slate-800 text-xs">${item.quantityKg} kg (~${Math.round(item.quantityKg * 2.5)} meals)</div>
          <div class="w-28 bg-slate-200 h-1.5 rounded-full mt-1.5">
            <div class="bg-emerald-600 h-1.5 rounded-full" style="width: ${pct}%"></div>
          </div>
        </td>
        <td class="py-3.5 px-4">
          <div class="mb-1">${getUrgencyBadge(item.urgency)}</div>
          <div class="font-mono text-xs font-semibold text-slate-700 expiry-timer" data-expires="${item.expiresAt}">
            ${getRemainingTimeText(item.expiresAt)}
          </div>
        </td>
        <td class="py-3.5 px-4">
          <div class="text-xs font-semibold text-slate-800">${item.zone || 'Dhaka'}</div>
          <div class="text-xs text-slate-500">${item.location}</div>
          <a href="${mapsUrl}" target="_blank" class="text-[11px] text-blue-600 hover:underline font-semibold">View Pickup Map &rarr;</a>
        </td>
        <td class="py-3.5 px-4">
          <span class="inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${
            item.status === 'Available'
              ? 'bg-amber-100 text-amber-800'
              : item.status === 'Claimed'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-emerald-100 text-emerald-800'
          }">
            ${item.status === 'Available' ? '1. Awaiting Pickup' : item.status === 'Claimed' ? '2. NGO In-Transit' : '3. Delivered'}
          </span>
        </td>
      </tr>
    `;
    })
    .join('');
}

// Section 2 Form Handler: Restaurant Surplus Upload
document.getElementById('donation-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    donorName: document.getElementById('donorName').value,
    foodItem: document.getElementById('foodItem').value,
    category: document.getElementById('category').value,
    quantityKg: document.getElementById('quantityKg').value,
    expiryHours: document.getElementById('expiryHours').value,
    zone: document.getElementById('zone').value,
    location: document.getElementById('location').value,
    contactPhone: document.getElementById('contactPhone').value,
  };

  const res = await fetch(`${API_BASE}/donations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (res.ok) {
    e.target.reset();
    showToast('Surplus food uploaded! Tracker & Impact Dashboard updated.');
    await loadDonations();
    await loadStats();
  }
});

// Section 3 Action: Claim Food
async function claimFood(id) {
  const ngoInput = document.getElementById('active-ngo-name').value.trim();
  const ngoName = ngoInput || prompt('Enter NGO or Volunteer Name:');
  if (!ngoName) return;

  const res = await fetch(`${API_BASE}/donations/${id}/claim`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ngoName }),
  });

  if (res.ok) {
    showToast(`Batch ${id} claimed by ${ngoName}!`);
    await loadDonations();
    await loadStats();
  }
}

// Section 3 Action: Confirm Delivery
async function deliverFood(id) {
  const res = await fetch(`${API_BASE}/donations/${id}/deliver`, { method: 'PATCH' });
  if (res.ok) {
    showToast(`Batch ${id} marked as delivered!`);
    await loadDonations();
    await loadStats();
  }
}

// Live 1-second tick for Expiry Countdowns in Section 4
setInterval(() => {
  document.querySelectorAll('.expiry-timer').forEach((el) => {
    const exp = el.getAttribute('data-expires');
    if (exp) el.textContent = getRemainingTimeText(exp);
  });
}, 1000);

// Initial Dashboard Boot
loadStats();
loadDonations();
