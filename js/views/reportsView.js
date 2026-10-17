import { store } from '../store.js';
import { getIcon, showToast, escapeHTML, formatDate, getBadge } from '../utils.js';

export function renderReportsView(container, router) {
  const state = store.getState();

  // 1. Occupancy Breakdown by Block
  const blocks = ['A', 'B', 'C', 'D'];
  const blockStats = blocks.map(b => {
    const blkRooms = state.rooms.filter(r => r.block === b);
    const capacity = blkRooms.reduce((acc, r) => acc + r.capacity, 0);
    const occupied = blkRooms.reduce((acc, r) => acc + r.occupants.length, 0);
    const vacant = capacity - occupied;
    const rate = capacity > 0 ? Math.round((occupied / capacity) * 100) : 0;
    return { block: b, totalRooms: blkRooms.length, capacity, occupied, vacant, rate };
  });

  const grandCapacity = blockStats.reduce((acc, b) => acc + b.capacity, 0);
  const grandOccupied = blockStats.reduce((acc, b) => acc + b.occupied, 0);
  const grandRate = Math.round((grandOccupied / grandCapacity) * 100);

  // 2. Service Requests & Turnaround
  const allRequests = state.serviceRequests;
  const maintenanceReqs = allRequests.filter(r => r.type === 'maintenance');
  const cleaningReqs = allRequests.filter(r => r.type === 'cleaning');
  const resolvedCount = allRequests.filter(r => r.status === 'resolved').length;
  const pendingCount = allRequests.filter(r => r.status === 'pending').length;
  const overdueCount = allRequests.filter(r => r.isOverdue || (r.status === 'pending' && r.createdAt.includes('2026-10-14'))).length;
  const resolutionRate = allRequests.length > 0 ? Math.round((resolvedCount / allRequests.length) * 100) : 0;

  // 3. Amenities Utilization
  const totalAmenityBookings = state.amenities.reduce((acc, a) => acc + a.bookings.length, 0);

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: var(--section-gap);">
      
      <!-- Header -->
      <div style="display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 8px;">
        <div>
          <h1 style="font-size: var(--text-2xl); font-weight: 600;">Campus Operational Reports</h1>
          <p style="font-size: var(--text-sm); color: var(--muted); margin-top: 2px;">
            Audited bed allocations, maintenance turnaround rates, and facility utilization metrics.
          </p>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn--secondary btn--sm" id="btn-print-report">
            ${getIcon('reports')}
            <span>Print Report</span>
          </button>
          <button class="btn btn--primary btn--sm" id="btn-export-csv">
            ${getIcon('plus')}
            <span>Export CSV Data</span>
          </button>
        </div>
      </div>

      <!-- Top Summary Metrics -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
        <div class="metric-card">
          <div class="metric-card__label">Total Campus Occupancy</div>
          <div class="metric-card__value">${grandRate}%</div>
          <div class="metric-card__sub">${grandOccupied} of ${grandCapacity} beds allocated</div>
        </div>

        <div class="metric-card">
          <div class="metric-card__label">Service Resolution Rate</div>
          <div class="metric-card__value">${resolutionRate}%</div>
          <div class="metric-card__sub">${resolvedCount} of ${allRequests.length} tickets resolved</div>
        </div>

        <div class="metric-card">
          <div class="metric-card__label">Pending Action Queue</div>
          <div class="metric-card__value">${pendingCount}</div>
          <div class="metric-card__sub">${overdueCount} overdue (> 48h)</div>
        </div>

        <div class="metric-card">
          <div class="metric-card__label">Amenity Reservations</div>
          <div class="metric-card__value">${totalAmenityBookings}</div>
          <div class="metric-card__sub">Across all campus facilities</div>
        </div>
      </div>

      <!-- Block-by-Block Occupancy Table -->
      <div class="card" style="padding: 0; overflow: hidden;">
        <div style="padding: 16px 20px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between;">
          <div>
            <h3 class="card__title">Accommodation Census by Block</h3>
            <p class="card__subtitle">Complete inventory of rooms, capacity, and bed allocations</p>
          </div>
        </div>

        <div class="table-container" style="border: none; border-radius: 0;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Hostel Block</th>
                <th>Total Rooms</th>
                <th>Bed Capacity</th>
                <th>Occupied Beds</th>
                <th>Vacant Beds</th>
                <th>Occupancy %</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${blockStats.map(b => `
                <tr>
                  <td style="font-weight: 600;">Block ${b.block} Quarters</td>
                  <td>${b.totalRooms}</td>
                  <td>${b.capacity}</td>
                  <td style="font-weight: 600;">${b.occupied}</td>
                  <td>${b.vacant}</td>
                  <td>${b.rate}%</td>
                  <td>${getBadge(b.rate >= 85 ? 'neutral' : 'success', b.rate >= 85 ? 'High Density' : 'Available Beds')}</td>
                </tr>
              `).join('')}
              <tr style="background: var(--field); font-weight: 600;">
                <td>Total Campus Summary</td>
                <td>${state.rooms.length}</td>
                <td>${grandCapacity}</td>
                <td>${grandOccupied}</td>
                <td>${grandCapacity - grandOccupied}</td>
                <td>${grandRate}%</td>
                <td>${getBadge('accent', 'Active Semester')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Ticket Resolution Breakdown -->
      <div class="card">
        <div class="card__header">
          <div>
            <h3 class="card__title">Service & Maintenance Department Breakdown</h3>
            <p class="card__subtitle">Work distribution across maintenance specialties and housekeeping</p>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--gap);">
          <div>
            <div style="font-size: var(--text-sm); font-weight: 600; margin-bottom: 10px;">Maintenance Complaints (${maintenanceReqs.length})</div>
            <div style="display: flex; flex-direction: column; gap: 8px; font-size: var(--text-sm);">
              ${['Air Conditioner', 'Electrical', 'Plumbing', 'Carpentry', 'Network'].map(cat => {
                const count = maintenanceReqs.filter(r => r.category.toLowerCase().includes(cat.toLowerCase())).length;
                return `
                  <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--border);">
                    <span style="color: var(--muted);">${cat}</span>
                    <span style="font-weight: 600;">${count} tickets</span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <div>
            <div style="font-size: var(--text-sm); font-weight: 600; margin-bottom: 10px;">Housekeeping Upkeep (${cleaningReqs.length})</div>
            <div style="display: flex; flex-direction: column; gap: 8px; font-size: var(--text-sm);">
              <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--border);">
                <span style="color: var(--muted);">Room Deep Mopping</span>
                <span style="font-weight: 600;">${cleaningReqs.filter(r => r.category.includes('Clean') || r.category.includes('Mop')).length} requests</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--border);">
                <span style="color: var(--muted);">Washroom Disinfection</span>
                <span style="font-weight: 600;">${cleaningReqs.filter(r => r.category.includes('Restroom') || r.category.includes('Washroom')).length} requests</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--border);">
                <span style="color: var(--muted);">Balcony & Window Wash</span>
                <span style="font-weight: 600;">${cleaningReqs.filter(r => r.category.includes('Balcony') || r.category.includes('Window')).length} requests</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--border);">
                <span style="color: var(--muted);">Trash & Liner Disposal</span>
                <span style="font-weight: 600;">${cleaningReqs.filter(r => r.category.includes('Trash') || r.category.includes('Clearance')).length} requests</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  `;

  // Real Export CSV Implementation
  container.querySelector('#btn-export-csv')?.addEventListener('click', () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "HostelHub Campus Operations Summary Report\n";
    csvContent += `Generated At: ${new Date().toISOString()}\n\n`;
    
    csvContent += "Block,Total Rooms,Capacity,Occupied,Vacant,Occupancy Rate\n";
    blockStats.forEach(b => {
      csvContent += `${b.block},${b.totalRooms},${b.capacity},${b.occupied},${b.vacant},${b.rate}%\n`;
    });
    csvContent += `Total,${state.rooms.length},${grandCapacity},${grandOccupied},${grandCapacity - grandOccupied},${grandRate}%\n\n`;

    csvContent += "Ticket ID,Type,Category,Room,Status,Priority,Assignee\n";
    state.serviceRequests.forEach(r => {
      csvContent += `"${r.id}","${r.type}","${r.category}","${r.roomId}","${r.status}","${r.priority}","${r.assignee || 'Unassigned'}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `HostelHub_Operations_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    showToast('Operational CSV report downloaded.', 'success');
  });

  // Print layout implementation
  container.querySelector('#btn-print-report')?.addEventListener('click', () => {
    window.print();
  });
}
