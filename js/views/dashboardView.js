import { store } from '../store.js';
import { getIcon, animateCountUp, getCurrentMealInfo, escapeHTML, getBadge, getFloorPlanMotif, getBlockFloorGrid } from '../utils.js';

export function renderDashboardView(container, router) {
  const state = store.getState();
  const isAdmin = state.settings.activeRole === 'admin';

  if (isAdmin) {
    renderWardenOverview(container, router, state);
  } else {
    renderStudentOverview(container, router, state);
  }
}

/**
 * 1. STUDENT OVERVIEW (Art-directed, top priority)
 */
function renderStudentOverview(container, router, state) {
  const student = state.students.find(s => s.id === state.settings.currentStudentId) || state.students[0];
  const room = state.rooms.find(r => r.id === student.roomId);
  const mealInfo = getCurrentMealInfo();

  // Roommates in the assigned room
  const roommates = room
    ? state.students.filter(s => room.occupants.includes(s.id) && s.id !== student.id)
    : [];

  // Today's timeline tasks (cleaning, tickets, meals, amenity bookings)
  const studentRequests = state.serviceRequests.filter(r => r.studentId === student.id);
  const activeCleaning = studentRequests.find(r => r.type === 'cleaning' && r.status !== 'resolved');
  const activeRepair = studentRequests.find(r => r.type === 'maintenance' && r.status !== 'resolved');
  
  // Student's booked amenities
  const myBookings = [];
  state.amenities.forEach(a => {
    a.bookings.filter(b => b.studentId === student.id && b.status === 'confirmed').forEach(b => {
      myBookings.push({ amenityName: a.name, slot: b.slot, date: b.date });
    });
  });

  const timelineItems = [
    {
      time: activeCleaning ? activeCleaning.preferredSlot.split(' - ')[0] || "10:00" : "10:00",
      title: activeCleaning ? activeCleaning.title : "Daily Room Upkeep",
      sub: activeCleaning ? `Preferred slot: ${activeCleaning.preferredSlot}` : "Regular housekeeping sweep",
      status: activeCleaning ? activeCleaning.status : "completed"
    },
    {
      time: mealInfo.time.split(' - ')[0] || "12:30",
      title: `${mealInfo.label} in Dining Hall`,
      sub: mealInfo.status === 'now_serving' ? "Now serving hot in mess" : mealInfo.next,
      status: mealInfo.status === 'now_serving' ? "in-progress" : "upcoming"
    },
    {
      time: myBookings.length > 0 ? myBookings[0].slot.split(' - ')[0] || "18:00" : "17:00",
      title: myBookings.length > 0 ? `${myBookings[0].amenityName} Session` : "Recreation & Study Pods",
      sub: myBookings.length > 0 ? `Reserved for ${myBookings[0].slot}` : "Walk-in slots open",
      status: myBookings.length > 0 ? "confirmed" : "available"
    }
  ];

  // Latest 2 announcements
  const recentAnnouncements = state.announcements.slice(0, 2);

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: var(--section-gap);">
      
      <!-- Greeting & Context Header -->
      <div style="display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 8px;">
        <div>
          <h1 style="font-size: var(--text-2xl); font-weight: 600;">Good morning, ${escapeHTML(student.name.split(' ')[0])}</h1>
          <p style="font-size: var(--text-sm); color: var(--muted); margin-top: 2px;">
            Saturday, October 17 &bull; ${room ? `Block ${room.block} Resident` : 'Unassigned Resident'} &bull; ${escapeHTML(student.course)}
          </p>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          ${getBadge('active', 'Resident Active')}
        </div>
      </div>

      <!-- SIGNATURE DEVICE: Room Hero Panel -->
      <div class="room-hero-panel">
        <div class="room-hero-content">
          <div class="room-hero-meta">
            <span>RESIDENCE QUARTERS</span>
            <span>&bull;</span>
            <span>Block ${room ? room.block : 'A'}</span>
            <span>&bull;</span>
            <span>Floor ${room ? room.floor : 1}</span>
          </div>

          <div class="room-hero-main">
            <div class="room-hero__number">${room ? room.number : 'None'}</div>
            <div class="room-hero-sub">
              <div class="room-hero__details">
                ${room ? `${room.type} Room Quarters` : 'No Bed Assigned'}
              </div>
              <div class="room-hero__occupancy">
                ${room ? `${room.occupants.length} of ${room.capacity} beds occupied` : 'Contact warden office'}
                ${roommates.length > 0 ? `&bull; Roommate: ${escapeHTML(roommates[0].name)}` : ''}
              </div>
            </div>
          </div>

          <div style="margin-top: 10px;">
            <a href="#/myroom" class="btn btn--tertiary btn--sm" style="padding-left: 0; color: var(--accent); font-weight: 500;">
              <span>View Room Specifications & Inventory</span>
              ${getIcon('chevronRight', 'icon-sm')}
            </a>
          </div>
        </div>

        <div class="room-hero-visual">
          ${getBlockFloorGrid(room ? room.block : 'A', room ? room.floor : 1, room ? room.number : '101')}
          ${getFloorPlanMotif('floor-plan-motif')}
        </div>
      </div>

      <!-- 4 Quick Actions (Strict rule: ONE primary, three quiet) -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px;">
        <button class="btn btn--primary" id="btn-quick-clean" style="justify-content: flex-start; height: 48px; padding: 0 16px;">
          ${getIcon('housekeeping')}
          <span>Request Cleaning</span>
        </button>

        <button class="btn btn--secondary" id="btn-quick-repair" style="justify-content: flex-start; height: 48px; padding: 0 16px;">
          ${getIcon('wrench')}
          <span>Report a Repair</span>
        </button>

        <button class="btn btn--secondary" id="btn-quick-amenity" style="justify-content: flex-start; height: 48px; padding: 0 16px;">
          ${getIcon('amenities')}
          <span>Book an Amenity</span>
        </button>

        <button class="btn btn--secondary" id="btn-quick-mess" style="justify-content: flex-start; height: 48px; padding: 0 16px;">
          ${getIcon('mess')}
          <span>View Mess Menu</span>
        </button>
      </div>

      <!-- Asymmetric Grid: Today's Schedule (Left) + Amenity & Dining Preview (Right) -->
      <div style="display: grid; grid-template-columns: 1.25fr 1fr; gap: var(--gap);" class="dashboard-split-grid">
        
        <!-- Left: Today's Timeline -->
        <div class="card">
          <div class="card__header">
            <div>
              <h3 class="card__title">Today's Schedule</h3>
              <p class="card__subtitle">Your housekeeping, dining times, and amenity bookings</p>
            </div>
          </div>

          <div class="schedule-list">
            ${timelineItems.map(item => `
              <div class="schedule-row">
                <div class="schedule-time">${item.time}</div>
                <div class="schedule-main">
                  <div class="schedule-title">${escapeHTML(item.title)}</div>
                  <div class="schedule-sub">${escapeHTML(item.sub)}</div>
                </div>
                ${getBadge(item.status)}
              </div>
            `).join('')}
          </div>

          ${activeRepair ? `
            <div style="margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between;">
              <div style="font-size: var(--text-xs); color: var(--muted);">
                Open Ticket: <strong>${escapeHTML(activeRepair.title)}</strong>
              </div>
              <a href="#/servicedesk" style="font-size: var(--text-xs); color: var(--accent); font-weight: 500;">
                Track Status &rarr;
              </a>
            </div>
          ` : ''}
        </div>

        <!-- Right: Amenity Preview & Dining Status -->
        <div style="display: flex; flex-direction: column; gap: var(--gap);">
          
          <!-- Amenity Capacity Preview -->
          <div class="card">
            <div class="card__header">
              <div>
                <h3 class="card__title">Campus Facilities</h3>
                <p class="card__subtitle">Live capacity & availability</p>
              </div>
              <a href="#/amenities" class="btn btn--tertiary btn--sm" style="font-size: var(--text-xs); color: var(--accent);">Book slot</a>
            </div>

            <div style="display: flex; flex-direction: column; gap: 14px;">
              ${state.amenities.slice(0, 3).map(a => {
                const pct = Math.round((a.currentOccupancy / a.capacity) * 100);
                const isFull = a.currentOccupancy >= a.capacity;
                const isMaint = a.status === 'maintenance';
                return `
                  <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: var(--text-xs);">
                      <span style="font-weight: 600; color: var(--ink);">${escapeHTML(a.name)}</span>
                      <span style="color: var(--muted);">${isMaint ? 'Under Maintenance' : `${a.currentOccupancy}/${a.capacity} occupied`}</span>
                    </div>
                    <div class="capacity-bar">
                      <div class="capacity-bar__fill ${isFull ? 'capacity-bar__fill--full' : ''}" style="width: ${isMaint ? 0 : pct}%;"></div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Current Meal Card -->
          <div class="card">
            <div class="card__header">
              <div>
                <h3 class="card__title">Dining & Mess</h3>
                <p class="card__subtitle">${mealInfo.label} (${mealInfo.time})</p>
              </div>
              ${getBadge(mealInfo.status === 'now_serving' ? 'active' : 'upcoming', mealInfo.status === 'now_serving' ? 'Now Serving' : 'Upcoming')}
            </div>

            <div style="font-size: var(--text-sm); color: var(--ink-secondary); line-height: 1.5;">
              ${(state.messMenu.find(m => m.day === 'Saturday')?.meals[mealInfo.current] || []).slice(0, 3).join(' &bull; ')}
            </div>

            <div style="margin-top: 12px; display: flex; justify-content: flex-end;">
              <a href="#/mess" class="btn btn--tertiary btn--sm" style="font-size: var(--text-xs); color: var(--accent); padding: 0;">
                Weekly menu & ratings &rarr;
              </a>
            </div>
          </div>

        </div>

      </div>

      <!-- Compact Announcements Row -->
      <div class="card">
        <div class="card__header">
          <div>
            <h3 class="card__title">Campus Bulletins</h3>
            <p class="card__subtitle">Recent administrative announcements</p>
          </div>
          <a href="#/announcements" class="btn btn--tertiary btn--sm" style="font-size: var(--text-xs); color: var(--accent);">View all</a>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${recentAnnouncements.map(ann => `
            <div style="display: flex; align-items: baseline; justify-content: space-between; gap: 12px; padding: 6px 0; border-bottom: 1px solid var(--border);">
              <div style="display: flex; align-items: center; gap: 8px;">
                ${ann.pinned ? getBadge('accent', 'Pinned') : ''}
                <span style="font-size: var(--text-sm); font-weight: 500; color: var(--ink);">${escapeHTML(ann.title)}</span>
              </div>
              <span style="font-size: var(--text-xs); color: var(--muted); white-space: nowrap;">${ann.createdAt.split(' ')[0]}</span>
            </div>
          `).join('')}
        </div>
      </div>

    </div>
  `;

  // Action button event handlers
  container.querySelector('#btn-quick-clean')?.addEventListener('click', () => router.navigate('#/housekeeping'));
  container.querySelector('#btn-quick-repair')?.addEventListener('click', () => router.navigate('#/maintenance'));
  container.querySelector('#btn-quick-amenity')?.addEventListener('click', () => router.navigate('#/amenities'));
  container.querySelector('#btn-quick-mess')?.addEventListener('click', () => router.navigate('#/mess'));
}

/**
 * 2. WARDEN OVERVIEW (Dense, same language)
 */
function renderWardenOverview(container, router, state) {
  // Aggregate Metrics
  const totalBeds = state.rooms.reduce((acc, r) => acc + r.capacity, 0);
  const occupiedBeds = state.rooms.reduce((acc, r) => acc + r.occupants.length, 0);
  const occupancyPct = Math.round((occupiedBeds / totalBeds) * 100);

  const openMaintenance = state.serviceRequests.filter(r => r.type === 'maintenance' && ['pending', 'assigned', 'in-progress'].includes(r.status)).length;
  const housekeepingDueToday = state.serviceRequests.filter(r => r.type === 'cleaning' && r.status === 'pending').length;
  const overdueTasks = state.serviceRequests.filter(r => r.isOverdue || (r.status === 'pending' && r.createdAt.includes('2026-10-14'))).length;
  
  const openAmenities = state.amenities.filter(a => a.status === 'open').length;

  // Priority Work List (Pending & High priority tickets first)
  const priorityTickets = [...state.serviceRequests]
    .filter(r => r.status !== 'resolved')
    .sort((a, b) => (b.priority === 'urgent' ? 2 : 1) - (a.priority === 'urgent' ? 2 : 1))
    .slice(0, 5);

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: var(--section-gap);">
      
      <!-- Warden Header -->
      <div style="display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 8px;">
        <div>
          <h1 style="font-size: var(--text-2xl); font-weight: 600;">Warden Operations Desk</h1>
          <p style="font-size: var(--text-sm); color: var(--muted); margin-top: 2px;">
            Saturday, October 17 &bull; Campus Accommodation, Maintenance & Facility Roster
          </p>
        </div>
        <div style="display: flex; gap: 8px;">
          <a href="#/rooms" class="btn btn--secondary btn--sm">Floor Map</a>
          <a href="#/servicedesk" class="btn btn--primary btn--sm">Manage Tickets</a>
        </div>
      </div>

      <!-- Metric Row (Summary above the fold) -->
      <div class="metric-row" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px;">
        
        <div class="metric-card">
          <div class="metric-card__label">Occupancy Rate</div>
          <div class="metric-card__value" id="kpi-warden-occ">0%</div>
          <div class="metric-card__sub">${occupiedBeds} of ${totalBeds} beds assigned</div>
        </div>

        <div class="metric-card">
          <div class="metric-card__label">Open Maintenance</div>
          <div class="metric-card__value" id="kpi-warden-maint">0</div>
          <div class="metric-card__sub">HVAC, plumbing, electrical</div>
        </div>

        <div class="metric-card">
          <div class="metric-card__label">Housekeeping Due</div>
          <div class="metric-card__value" id="kpi-warden-hk">0</div>
          <div class="metric-card__sub">Rooms pending dispatch</div>
        </div>

        <div class="metric-card">
          <div class="metric-card__label">Overdue Tasks</div>
          <div class="metric-card__value" style="color: var(--danger);" id="kpi-warden-overdue">0</div>
          <div class="metric-card__sub">Tickets > 48h pending</div>
        </div>

        <div class="metric-card">
          <div class="metric-card__label">Amenities Active</div>
          <div class="metric-card__value">${openAmenities}/${state.amenities.length}</div>
          <div class="metric-card__sub">1 facility in maintenance</div>
        </div>

      </div>

      <!-- Priority Work List with Inline Actions -->
      <div class="card" style="padding: 0; overflow: hidden;">
        <div style="padding: 16px 20px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between;">
          <div>
            <h3 class="card__title">Priority Dispatch Queue</h3>
            <p class="card__subtitle">Pending maintenance complaints and housekeeping requests</p>
          </div>
          <a href="#/servicedesk" class="btn btn--tertiary btn--sm" style="font-size: var(--text-xs); color: var(--accent);">View full Kanban &rarr;</a>
        </div>

        <div class="table-container" style="border: none; border-radius: 0;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Room</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Assignee</th>
                <th style="text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${priorityTickets.map(ticket => `
                <tr>
                  <td style="font-weight: 500;">
                    ${escapeHTML(ticket.title)}
                    ${ticket.isOverdue ? `<span style="font-size: 10px; color: var(--danger); font-weight: 600; margin-left: 6px;">OVERDUE</span>` : ''}
                  </td>
                  <td>${ticket.roomId.replace('room-', '')}</td>
                  <td>${escapeHTML(ticket.category)}</td>
                  <td>${getBadge(ticket.priority === 'urgent' ? 'danger' : ticket.priority === 'high' ? 'warning' : 'neutral', ticket.priority)}</td>
                  <td>${getBadge(ticket.status)}</td>
                  <td style="color: var(--muted); font-size: var(--text-xs);">${ticket.assignee ? escapeHTML(ticket.assignee) : 'Unassigned'}</td>
                  <td style="text-align: right;">
                    <button class="btn btn--secondary btn--sm btn-inline-dispatch" data-id="${ticket.id}">
                      Assign
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Block Capacity Breakdown -->
      <div class="card">
        <div class="card__header">
          <div>
            <h3 class="card__title">Block Capacity Distribution</h3>
            <p class="card__subtitle">Beds occupancy and vacancy index</p>
          </div>
          <a href="#/rooms" class="btn btn--secondary btn--sm">Interactive Floor Map</a>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px;">
          ${['A', 'B', 'C', 'D'].map(blk => {
            const blkRooms = state.rooms.filter(r => r.block === blk);
            const blkCapacity = blkRooms.reduce((acc, r) => acc + r.capacity, 0);
            const blkOccupied = blkRooms.reduce((acc, r) => acc + r.occupants.length, 0);
            const blkPct = Math.round((blkOccupied / blkCapacity) * 100);

            return `
              <div style="padding: 14px; background: var(--field); border-radius: var(--radius-sm); border: 1px solid var(--border);">
                <div style="display: flex; justify-content: space-between; align-items: baseline;">
                  <span style="font-weight: 600; font-size: var(--text-sm);">Block ${blk}</span>
                  <span style="font-size: var(--text-xs); color: var(--muted);">${blkOccupied}/${blkCapacity} beds</span>
                </div>
                <div class="capacity-bar" style="margin-top: 8px;">
                  <div class="capacity-bar__fill" style="width: ${blkPct}%;"></div>
                </div>
                <div style="font-size: var(--text-xs); color: var(--muted); margin-top: 6px;">
                  ${blkPct}% occupancy &bull; ${blkCapacity - blkOccupied} vacant beds
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

    </div>
  `;

  // Animate count-up metrics
  animateCountUp(container.querySelector('#kpi-warden-occ'), occupancyPct, 600, '%');
  animateCountUp(container.querySelector('#kpi-warden-maint'), openMaintenance, 500);
  animateCountUp(container.querySelector('#kpi-warden-hk'), housekeepingDueToday, 500);
  animateCountUp(container.querySelector('#kpi-warden-overdue'), overdueTasks, 500);

  // Inline dispatch click handlers
  container.querySelectorAll('.btn-inline-dispatch').forEach(btn => {
    btn.addEventListener('click', () => {
      const ticketId = btn.getAttribute('data-id');
      router.navigate('#/servicedesk');
    });
  });
}
