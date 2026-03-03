import { Platform } from 'react-native';
import { VehicleStorage, ServiceStorage, ImageStorage } from '../lib/storage';
import { HealthScore, ServiceDue, CostAnalytics } from '../lib/analytics';
import manufacturerDB from '../content/v1/vehicles.json';

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

const formatCurrency = (amount) => {
  if (amount == null || isNaN(amount)) return '$0.00';
  return '$' + Number(amount).toFixed(2);
};

const escapeHtml = (str) => {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
};

export const generateReport = async (vehicleId) => {
  // Load all data
  const vehicle = await VehicleStorage.getById(vehicleId);
  if (!vehicle) return;

  const services = await ServiceStorage.getByVehicleId(vehicleId);
  const images = await ImageStorage.getByVehicleId(vehicleId);
  const totalCost = await CostAnalytics.getTotalCost(vehicleId);
  const costPerMile = await CostAnalytics.getCostPerMile(vehicleId);
  const healthScore = await HealthScore.calculate(vehicleId);
  const upcomingServices = await ServiceDue.getUpcomingServices(vehicleId, 365);

  // Get manufacturer schedule
  const mfgData = manufacturerDB.vehicles.find(
    v => v.make.toLowerCase() === vehicle.make.toLowerCase() &&
         v.model.toLowerCase() === vehicle.model.toLowerCase()
  );
  const schedule = mfgData ? mfgData.schedule : [];

  // Build schedule status
  const scheduleStatus = schedule.map((item) => {
    const matching = services
      .filter(s => s.serviceType === item.service)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    const lastDone = matching[0];
    const upcoming = upcomingServices.find(u => u.service === item.service);
    let status = 'upcoming';
    if (upcoming) {
      status = upcoming.isOverdue ? 'overdue' : 'due_soon';
    } else if (lastDone) {
      status = 'completed';
    }
    return { ...item, lastDone, status };
  });

  // Cost analytics
  const milesDriven = vehicle.currentMileage - (vehicle.initialMileage || 0);
  const monthsOwned = vehicle.purchaseDate
    ? Math.max(1, Math.ceil((new Date() - new Date(vehicle.purchaseDate)) / (30.44 * 24 * 60 * 60 * 1000)))
    : Math.max(1, Math.ceil((new Date() - new Date(vehicle.createdAt)) / (30.44 * 24 * 60 * 60 * 1000)));
  const monthlyAverage = totalCost / monthsOwned;

  // Action items
  const overdueItems = upcomingServices.filter(s => s.isOverdue);
  const dueSoonItems = upcomingServices.filter(s => !s.isOverdue);

  const vehicleName = `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ' ' + vehicle.trim : ''}`;
  const generatedDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  // Sort services chronologically (oldest first) for report
  const chronologicalServices = [...services].reverse();

  const statusBadge = (status) => {
    const colors = {
      completed: { bg: '#dcfce7', text: '#166534', label: 'Completed' },
      due_soon: { bg: '#fef3c7', text: '#92400e', label: 'Due Soon' },
      overdue: { bg: '#fee2e2', text: '#991b1b', label: 'Overdue' },
      upcoming: { bg: '#e0e7ff', text: '#3730a3', label: 'Upcoming' },
    };
    const c = colors[status] || colors.upcoming;
    return `<span style="display:inline-block;padding:2px 10px;border-radius:12px;font-size:12px;font-weight:600;background:${c.bg};color:${c.text}">${c.label}</span>`;
  };

  const hasProfileData = vehicle.conditionWhenPurchased || vehicle.purchasePrice ||
    vehicle.knownIssues || vehicle.accidentHistory || vehicle.modifications ||
    vehicle.smokerVehicle || vehicle.petsTransported ||
    (vehicle.primaryUse && vehicle.primaryUse.length > 0);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Glovebox Report — ${escapeHtml(vehicleName)}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; background: #fff; line-height: 1.5; }
  .container { max-width: 800px; margin: 0 auto; padding: 40px 32px; }
  .header { text-align: center; margin-bottom: 36px; padding-bottom: 24px; border-bottom: 2px solid #e2e8f0; }
  .header h1 { font-size: 28px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
  .header .subtitle { font-size: 18px; color: #3b82f6; font-weight: 600; }
  .header .date { font-size: 13px; color: #94a3b8; margin-top: 8px; }
  .section { margin-bottom: 28px; }
  .section h2 { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid #e2e8f0; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; }
  .info-item { display: flex; justify-content: space-between; padding: 4px 0; }
  .info-label { color: #64748b; font-size: 14px; }
  .info-value { font-weight: 600; font-size: 14px; color: #1e293b; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { background: #f8fafc; text-align: left; padding: 8px 12px; font-weight: 600; color: #475569; border-bottom: 2px solid #e2e8f0; }
  td { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; }
  tr:hover { background: #f8fafc; }
  .cost { color: #059669; font-weight: 600; }
  .summary-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .summary-card { background: #f8fafc; border-radius: 12px; padding: 16px; text-align: center; border: 1px solid #e2e8f0; }
  .summary-card .value { font-size: 24px; font-weight: 700; color: #0f172a; }
  .summary-card .label { font-size: 12px; color: #94a3b8; margin-top: 4px; }
  .action-item { padding: 8px 12px; border-radius: 8px; margin-bottom: 6px; font-size: 14px; }
  .action-overdue { background: #fee2e2; color: #991b1b; }
  .action-due { background: #fef3c7; color: #92400e; }
  .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .container { padding: 20px; } }
</style>
</head>
<body>
<div class="container">

<div class="header">
  <h1>🧤 Glovebox Vehicle Report</h1>
  <div class="subtitle">${escapeHtml(vehicleName)}</div>
  <div class="date">Generated ${generatedDate}</div>
</div>

<!-- Vehicle Overview -->
<div class="section">
  <h2>Vehicle Overview</h2>
  <div class="info-grid">
    <div class="info-item"><span class="info-label">Year</span><span class="info-value">${vehicle.year}</span></div>
    <div class="info-item"><span class="info-label">Make</span><span class="info-value">${escapeHtml(vehicle.make)}</span></div>
    <div class="info-item"><span class="info-label">Model</span><span class="info-value">${escapeHtml(vehicle.model)}</span></div>
    ${vehicle.trim ? `<div class="info-item"><span class="info-label">Trim</span><span class="info-value">${escapeHtml(vehicle.trim)}</span></div>` : ''}
    ${vehicle.nickname ? `<div class="info-item"><span class="info-label">Nickname</span><span class="info-value">${escapeHtml(vehicle.nickname)}</span></div>` : ''}
    <div class="info-item"><span class="info-label">Current Mileage</span><span class="info-value">${vehicle.currentMileage?.toLocaleString() || 'N/A'} miles</span></div>
    ${vehicle.conditionWhenPurchased ? `<div class="info-item"><span class="info-label">Purchased</span><span class="info-value">${vehicle.conditionWhenPurchased}</span></div>` : ''}
    ${vehicle.purchaseDate ? `<div class="info-item"><span class="info-label">Purchase Date</span><span class="info-value">${vehicle.purchaseDate}</span></div>` : ''}
    ${vehicle.purchasePrice ? `<div class="info-item"><span class="info-label">Purchase Price</span><span class="info-value">${formatCurrency(vehicle.purchasePrice)}</span></div>` : ''}
    ${vehicle.initialMileage ? `<div class="info-item"><span class="info-label">Purchase Mileage</span><span class="info-value">${vehicle.initialMileage.toLocaleString()} miles</span></div>` : ''}
  </div>
</div>

${hasProfileData ? `
<!-- Vehicle Condition -->
<div class="section">
  <h2>Vehicle Condition</h2>
  <div class="info-grid">
    ${vehicle.knownIssues ? `<div class="info-item" style="grid-column:1/-1"><span class="info-label">Known Issues</span><span class="info-value">${escapeHtml(vehicle.knownIssues)}</span></div>` : ''}
    ${vehicle.accidentHistory ? `<div class="info-item"><span class="info-label">Accident History</span><span class="info-value">${vehicle.accidentHistory}</span></div>` : ''}
    ${vehicle.modifications ? `<div class="info-item" style="grid-column:1/-1"><span class="info-label">Modifications</span><span class="info-value">${escapeHtml(vehicle.modifications)}</span></div>` : ''}
    ${vehicle.smokerVehicle ? `<div class="info-item"><span class="info-label">Smoker Vehicle</span><span class="info-value">${vehicle.smokerVehicle}</span></div>` : ''}
    ${vehicle.petsTransported ? `<div class="info-item"><span class="info-label">Pets Transported</span><span class="info-value">${vehicle.petsTransported}</span></div>` : ''}
    ${vehicle.primaryUse && vehicle.primaryUse.length > 0 ? `<div class="info-item"><span class="info-label">Primary Use</span><span class="info-value">${vehicle.primaryUse.join(', ')}</span></div>` : ''}
  </div>
</div>
` : ''}

<!-- Cost Summary -->
<div class="section">
  <h2>Cost Summary</h2>
  <div class="summary-cards">
    <div class="summary-card"><div class="value">${formatCurrency(totalCost)}</div><div class="label">Total Spent</div></div>
    <div class="summary-card"><div class="value">${formatCurrency(costPerMile)}</div><div class="label">Cost per Mile</div></div>
    <div class="summary-card"><div class="value">${formatCurrency(monthlyAverage)}</div><div class="label">Monthly Average</div></div>
  </div>
</div>

${(overdueItems.length > 0 || dueSoonItems.length > 0) ? `
<!-- Action Items -->
<div class="section">
  <h2>⚠️ Action Items</h2>
  ${overdueItems.map(s => `<div class="action-item action-overdue">🔴 <strong>${escapeHtml(s.service)}</strong> — Overdue by ${Math.abs(s.daysUntilDue)} days</div>`).join('')}
  ${dueSoonItems.map(s => `<div class="action-item action-due">⚠️ <strong>${escapeHtml(s.service)}</strong> — Due in ${s.daysUntilDue} days</div>`).join('')}
</div>
` : ''}

${schedule.length > 0 ? `
<!-- Maintenance Status -->
<div class="section">
  <h2>Maintenance Schedule Status</h2>
  <table>
    <tr><th>Service</th><th>Interval</th><th>Last Performed</th><th>Status</th></tr>
    ${scheduleStatus.map(s => `<tr>
      <td>${escapeHtml(s.service)}</td>
      <td>${s.mileInterval.toLocaleString()} mi / ${s.monthInterval} mo</td>
      <td>${s.lastDone ? formatDate(s.lastDone.date) : 'Never'}</td>
      <td>${statusBadge(s.status)}</td>
    </tr>`).join('')}
  </table>
</div>
` : ''}

${chronologicalServices.length > 0 ? `
<!-- Service History -->
<div class="section">
  <h2>Service History</h2>
  <table>
    <tr><th>Date</th><th>Service</th><th>Mileage</th><th>Cost</th><th>Vendor</th><th>Notes</th></tr>
    ${chronologicalServices.map(s => `<tr>
      <td>${formatDate(s.date)}</td>
      <td>${escapeHtml(s.serviceType)}</td>
      <td>${s.mileage?.toLocaleString() || '—'}</td>
      <td class="cost">${s.cost != null ? formatCurrency(s.cost) : '—'}</td>
      <td>${escapeHtml(s.vendor || '—')}</td>
      <td>${escapeHtml(s.notes || '—')}</td>
    </tr>`).join('')}
  </table>
</div>
` : ''}

<div class="footer">
  Generated by Glovebox — Your personal car maintenance companion<br>
  Photo count: ${images.length} | Health Score: ${healthScore}%
</div>

</div>
</body>
</html>`;

  // Open in new window and print
  if (Platform.OS === 'web') {
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(html);
      newWindow.document.close();
      setTimeout(() => newWindow.print(), 500);
    }
  }
};

export default { generateReport };
