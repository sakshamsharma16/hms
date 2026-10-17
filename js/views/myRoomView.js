import { store } from '../store.js';
import { getIcon, showToast, escapeHTML, formatDate, getBadge, getFloorPlanMotif, getBlockFloorGrid } from '../utils.js';

export function renderMyRoomView(container, router, params) {
  const state = store.getState();
  const currentStudent = state.students.find(s => s.id === state.settings.currentStudentId) || state.students[0];
  const assignedRoom = state.rooms.find(r => r.id === currentStudent.roomId);

  // Filter requests for this specific room & resident
  const studentRequests = state.serviceRequests.filter(r => r.studentId === currentStudent.id);

  // Roommates in the assigned room
  const roommates = assignedRoom
    ? state.students.filter(s => assignedRoom.occupants.includes(s.id) && s.id !== currentStudent.id)
    : [];

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: var(--section-gap);">
      
      <!-- Page Header -->
      <div style="display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 8px;">
        <div>
          <h1 style="font-size: var(--text-2xl); font-weight: 600;">My Room Quarters</h1>
          <p style="font-size: var(--text-sm); color: var(--muted); margin-top: 2px;">
            Residence allocation specifications, bed assignment, inventory, and room service history.
          </p>
        </div>
        <div style="display: flex; gap: 8px;">
          <a href="#/housekeeping" class="btn btn--secondary btn--sm">Housekeeping Schedule</a>
          <a href="#/maintenance" class="btn btn--primary btn--sm">Report Repair</a>
        </div>
      </div>

      <!-- SIGNATURE DEVICE: Room Hero Panel -->
      <div class="room-hero-panel">
        <div class="room-hero-content">
          <div class="room-hero-meta">
            <span>OFFICIAL ALLOCATION</span>
            <span>&bull;</span>
            <span>Block ${assignedRoom ? assignedRoom.block : 'A'}</span>
            <span>&bull;</span>
            <span>Floor ${assignedRoom ? assignedRoom.floor : 1}</span>
          </div>

          <div class="room-hero-main">
            <div class="room-hero__number">${assignedRoom ? assignedRoom.number : 'None'}</div>
            <div class="room-hero-sub">
              <div class="room-hero__details">
                ${assignedRoom ? `${assignedRoom.type} Bed Layout` : 'Unassigned'}
              </div>
              <div class="room-hero__occupancy">
                ${assignedRoom ? `${assignedRoom.occupants.length} of ${assignedRoom.capacity} beds occupied` : 'No room assigned'}
              </div>
            </div>
          </div>

          <div style="margin-top: 8px;">
            ${assignedRoom ? getBadge(assignedRoom.status === 'full' ? 'neutral' : 'success', assignedRoom.status === 'full' ? 'Fully Allocated' : 'Active Assignment') : getBadge('warning', 'Awaiting Assignment')}
          </div>
        </div>

        <div class="room-hero-visual">
          ${getBlockFloorGrid(assignedRoom ? assignedRoom.block : 'A', assignedRoom ? assignedRoom.floor : 1, assignedRoom ? assignedRoom.number : '101')}
          ${getFloorPlanMotif('floor-plan-motif')}
        </div>
      </div>

      <!-- Roommates & Bed Slots -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: var(--gap);">
        
        <!-- Roommates List -->
        <div class="card">
          <div class="card__header">
            <div>
              <h3 class="card__title">Room Residents</h3>
              <p class="card__subtitle">Allocated occupants for this quarters</p>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px;">
            <!-- Current student -->
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: var(--field); border-radius: var(--radius-sm); border: 1px solid var(--border);">
              <div style="display: flex; align-items: center; gap: 10px;">
                <img src="${currentStudent.avatar}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;" alt="${escapeHTML(currentStudent.name)}" />
                <div>
                  <div style="font-size: var(--text-sm); font-weight: 600; color: var(--ink);">
                    ${escapeHTML(currentStudent.name)} <span style="font-size: 11px; color: var(--muted);">(You)</span>
                  </div>
                  <div style="font-size: var(--text-xs); color: var(--muted);">${escapeHTML(currentStudent.rollNo)} &bull; Bed 1</div>
                </div>
              </div>
              ${getBadge('success', 'Active')}
            </div>

            <!-- Other roommates -->
            ${roommates.map((rm, idx) => `
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: var(--surface); border-radius: var(--radius-sm); border: 1px solid var(--border);">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <img src="${rm.avatar}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;" alt="${escapeHTML(rm.name)}" />
                  <div>
                    <div style="font-size: var(--text-sm); font-weight: 500; color: var(--ink);">
                      ${escapeHTML(rm.name)}
                    </div>
                    <div style="font-size: var(--text-xs); color: var(--muted);">${escapeHTML(rm.rollNo)} &bull; Bed ${idx + 2}</div>
                  </div>
                </div>
                ${getBadge('success', 'Active')}
              </div>
            `).join('')}

            ${assignedRoom && assignedRoom.occupants.length < assignedRoom.capacity ? `
              <div style="padding: 10px 12px; border: 1px dashed var(--border); border-radius: var(--radius-sm); font-size: var(--text-xs); color: var(--muted); text-align: center;">
                ${assignedRoom.capacity - assignedRoom.occupants.length} vacant bed slot(s) available in this room.
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Room Inventory & Facilities -->
        <div class="card">
          <div class="card__header">
            <div>
              <h3 class="card__title">Room Inventory & Fixtures</h3>
              <p class="card__subtitle">Supplied furnishings and utility appliances</p>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 8px; font-size: var(--text-sm);">
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border);">
              <span style="color: var(--muted);">Air Conditioning</span>
              <span style="font-weight: 500;">Voltas 1.5 Ton Split Unit</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border);">
              <span style="color: var(--muted);">Study Desks & Chairs</span>
              <span style="font-weight: 500;">2 Ergonomic Sets</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border);">
              <span style="color: var(--muted);">Wardrobe Storage</span>
              <span style="font-weight: 500;">2 Full-Length 3-Door Units</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border);">
              <span style="color: var(--muted);">Water Heating</span>
              <span style="font-weight: 500;">25L Storage Geyser</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0;">
              <span style="color: var(--muted);">Internet Connectivity</span>
              <span style="font-weight: 500;">Gigabit Ethernet + Wi-Fi 6</span>
            </div>
          </div>
        </div>

      </div>

      <!-- Room Service & Complaint History -->
      <div class="card" style="padding: 0; overflow: hidden;">
        <div style="padding: 16px 20px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between;">
          <div>
            <h3 class="card__title">Room Service & Maintenance History</h3>
            <p class="card__subtitle">Past and ongoing requests filed for this room</p>
          </div>
          <span style="font-size: var(--text-xs); color: var(--muted);">${studentRequests.length} records</span>
        </div>

        <div class="table-container" style="border: none; border-radius: 0;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Service Request</th>
                <th>Type</th>
                <th>Category</th>
                <th>Date Filed</th>
                <th>Status</th>
                <th>Staff Assignee</th>
              </tr>
            </thead>
            <tbody>
              ${studentRequests.length > 0 ? studentRequests.map(r => `
                <tr>
                  <td style="font-weight: 500;">${escapeHTML(r.title)}</td>
                  <td>${escapeHTML(r.type.charAt(0).toUpperCase() + r.type.slice(1))}</td>
                  <td>${escapeHTML(r.category)}</td>
                  <td style="font-size: var(--text-xs); color: var(--muted);">${r.createdAt.split(' ')[0]}</td>
                  <td>${getBadge(r.status)}</td>
                  <td style="font-size: var(--text-xs); color: var(--muted);">${r.assignee ? escapeHTML(r.assignee) : 'Unassigned'}</td>
                </tr>
              `).join('') : `
                <tr>
                  <td colspan="6" style="padding: 32px; text-align: center; color: var(--muted);">
                    No service requests filed for this room yet.
                  </td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `;
}
