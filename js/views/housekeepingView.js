import { store } from '../store.js';
import { getIcon, showToast, escapeHTML, formatDate, getBadge } from '../utils.js';

export function renderHousekeepingView(container, router) {
  const state = store.getState();
  const isAdmin = state.settings.activeRole === 'admin';

  if (isAdmin) {
    renderWardenHousekeepingRoster(container, router, state);
  } else {
    renderStudentHousekeeping(container, router, state);
  }
}

/**
 * Student Housekeeping View: Schedule & Track Room Upkeep
 */
function renderStudentHousekeeping(container, router, state) {
  const student = state.students.find(s => s.id === state.settings.currentStudentId) || state.students[0];
  const room = state.rooms.find(r => r.id === student.roomId);

  const cleaningRequests = state.serviceRequests.filter(r => r.studentId === student.id && r.type === 'cleaning');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: var(--section-gap);">
      
      <!-- Header -->
      <div style="display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 8px;">
        <div>
          <h1 style="font-size: var(--text-2xl); font-weight: 600;">Housekeeping & Room Upkeep</h1>
          <p style="font-size: var(--text-sm); color: var(--muted); margin-top: 2px;">
            Schedule daily room sweeping, bathroom sanitation, and trash clearance.
          </p>
        </div>
        <div>
          <button class="btn btn--primary" id="btn-open-cleaning-modal">
            ${getIcon('plus')}
            <span>Book Cleaning Slot</span>
          </button>
        </div>
      </div>

      <!-- Schedule Cards / Overview -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--gap);">
        
        <div class="card">
          <div class="card__header">
            <div>
              <h3 class="card__title">Scheduled Housekeeping Standard</h3>
              <p class="card__subtitle">Included daily hostel services</p>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px; font-size: var(--text-sm); color: var(--ink-secondary);">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: var(--accent);">&bull;</span>
              <span>Floor sweeping and wet mopping</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: var(--accent);">&bull;</span>
              <span>Bathroom disinfection and drain check</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: var(--accent);">&bull;</span>
              <span>Daily trash clearance and liner replacement</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: var(--accent);">&bull;</span>
              <span>Bi-weekly window mesh dust removal</span>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card__header">
            <div>
              <h3 class="card__title">Current Room Status</h3>
              <p class="card__subtitle">Assigned housekeeping zone</p>
            </div>
            ${room ? getBadge('active', `Room ${room.block}-${room.number}`) : getBadge('warning', 'Unassigned')}
          </div>

          <div style="font-size: var(--text-sm); color: var(--muted); line-height: var(--leading-body);">
            ${room ? `Housekeeping crew visits Block ${room.block} (Floor ${room.floor}) between 09:00 and 17:00 daily. Please select your preferred time slot to prevent study interruptions.` : 'Please visit the warden office to receive your room allocation before booking housekeeping.'}
          </div>
        </div>

      </div>

      <!-- Cleaning Requests Table -->
      <div class="card" style="padding: 0; overflow: hidden;">
        <div style="padding: 16px 20px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between;">
          <div>
            <h3 class="card__title">Housekeeping Request History</h3>
            <p class="card__subtitle">Your past and upcoming cleaning reservations</p>
          </div>
          <span style="font-size: var(--text-xs); color: var(--muted);">${cleaningRequests.length} requests</span>
        </div>

        <div class="table-container" style="border: none; border-radius: 0;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Service Type</th>
                <th>Preferred Time Slot</th>
                <th>Date Filed</th>
                <th>Staff Assignee</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${cleaningRequests.length > 0 ? cleaningRequests.map(req => `
                <tr>
                  <td style="font-weight: 500;">${escapeHTML(req.title)}</td>
                  <td>${escapeHTML(req.preferredSlot)}</td>
                  <td style="font-size: var(--text-xs); color: var(--muted);">${req.createdAt.split(' ')[0]}</td>
                  <td style="font-size: var(--text-xs); color: var(--muted);">${req.assignee ? escapeHTML(req.assignee) : 'Staff will be assigned'}</td>
                  <td>${getBadge(req.status)}</td>
                </tr>
              `).join('') : `
                <tr>
                  <td colspan="5" style="padding: 32px; text-align: center; color: var(--muted);">
                    No housekeeping requests filed yet. Click "Book Cleaning Slot" above to schedule.
                  </td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `;

  container.querySelector('#btn-open-cleaning-modal')?.addEventListener('click', () => {
    openBookingModal(student, room, () => renderStudentHousekeeping(container, router, store.getState()));
  });
}

/**
 * Warden Housekeeping Roster: Operational Duty Grid
 */
function renderWardenHousekeepingRoster(container, router, state) {
  let filterBlock = 'all';
  let filterStatus = 'all';

  function renderTable() {
    const currentState = store.getState();
    const cleanings = currentState.serviceRequests.filter(r => r.type === 'cleaning');

    const filtered = cleanings.filter(c => {
      const room = currentState.rooms.find(r => r.id === c.roomId);
      const matchBlock = filterBlock === 'all' ? true : (room && room.block === filterBlock);
      const matchStatus = filterStatus === 'all' ? true : c.status === filterStatus;
      return matchBlock && matchStatus;
    });

    const pendingCount = cleanings.filter(c => c.status === 'pending').length;
    const completedCount = cleanings.filter(c => c.status === 'resolved').length;

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: var(--section-gap);">
        
        <!-- Header -->
        <div style="display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 8px;">
          <div>
            <h1 style="font-size: var(--text-2xl); font-weight: 600;">Housekeeping Duty Roster</h1>
            <p style="font-size: var(--text-sm); color: var(--muted); margin-top: 2px;">
              Sanitation staffing, room mopping schedules, and floor supervisor sign-offs.
            </p>
          </div>
          <div style="display: flex; gap: 8px;">
            <span class="badge badge--neutral">${pendingCount} Pending</span>
            <span class="badge badge--success">${completedCount} Completed</span>
          </div>
        </div>

        <!-- Filter Row -->
        <div class="card" style="padding: 12px 18px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: var(--text-xs); font-weight: 600; text-transform: uppercase; color: var(--muted);">Block:</span>
            <div style="display: flex; gap: 4px;">
              ${['all', 'A', 'B', 'C', 'D'].map(b => `
                <button class="btn ${filterBlock === b ? 'btn--secondary' : 'btn--tertiary'} btn--sm tab-block-btn" data-block="${b}" style="${filterBlock === b ? 'background: var(--surface-hover); font-weight: 600;' : ''}">
                  ${b === 'all' ? 'All Blocks' : `Block ${b}`}
                </button>
              `).join('')}
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: var(--text-xs); font-weight: 600; text-transform: uppercase; color: var(--muted);">Status:</span>
            <select class="form-select" id="select-hk-status" style="width: auto; height: 32px; font-size: var(--text-xs); padding: 0 10px;">
              <option value="all" ${filterStatus === 'all' ? 'selected' : ''}>All Statuses</option>
              <option value="pending" ${filterStatus === 'pending' ? 'selected' : ''}>Pending Dispatch</option>
              <option value="assigned" ${filterStatus === 'assigned' ? 'selected' : ''}>Assigned</option>
              <option value="in-progress" ${filterStatus === 'in-progress' ? 'selected' : ''}>In Progress</option>
              <option value="resolved" ${filterStatus === 'resolved' ? 'selected' : ''}>Completed</option>
            </select>
          </div>
        </div>

        <!-- Roster Table -->
        <div class="card" style="padding: 0; overflow: hidden;">
          <div class="table-container" style="border: none; border-radius: 0;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Room</th>
                  <th>Task Category</th>
                  <th>Preferred Window</th>
                  <th>Filed At</th>
                  <th>Assigned Cleaner</th>
                  <th>Status</th>
                  <th style="text-align: right;">Action</th>
                </tr>
              </thead>
              <tbody>
                ${filtered.length > 0 ? filtered.map(req => {
                  const rNum = req.roomId.replace('room-', '');
                  return `
                    <tr>
                      <td style="font-weight: 600;">${rNum}</td>
                      <td>${escapeHTML(req.category)}</td>
                      <td>${escapeHTML(req.preferredSlot)}</td>
                      <td style="font-size: var(--text-xs); color: var(--muted);">${req.createdAt.split(' ')[0]}</td>
                      <td style="font-size: var(--text-xs);">
                        ${req.assignee ? escapeHTML(req.assignee) : '<span style="color: var(--muted);">Unassigned</span>'}
                      </td>
                      <td>${getBadge(req.status)}</td>
                      <td style="text-align: right;">
                        <button class="btn btn--secondary btn--sm btn-roster-assign" data-id="${req.id}">
                          ${req.status === 'resolved' ? 'View' : 'Dispatch / Update'}
                        </button>
                      </td>
                    </tr>
                  `;
                }).join('') : `
                  <tr>
                    <td colspan="7" style="padding: 32px; text-align: center; color: var(--muted);">
                      No housekeeping tasks found matching current filters.
                    </td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;

    // Filter events
    container.querySelectorAll('.tab-block-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        filterBlock = btn.getAttribute('data-block');
        renderTable();
      });
    });

    container.querySelector('#select-hk-status')?.addEventListener('change', (e) => {
      filterStatus = e.target.value;
      renderTable();
    });

    // Assign / update cleaner
    container.querySelectorAll('.btn-roster-assign').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openCleanerAssignModal(id, () => renderTable());
      });
    });
  }

  renderTable();
}

/**
 * Clean Room Modal for Student
 */
function openBookingModal(student, room, onComplete) {
  if (!room) {
    showToast('You must have an assigned room to book housekeeping.', 'warning');
    return;
  }

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';

  backdrop.innerHTML = `
    <div class="modal">
      <div class="modal__header">
        <h3 class="modal__title">Book Housekeeping Service</h3>
        <button class="icon-btn btn-modal-close" aria-label="Close dialog">${getIcon('close')}</button>
      </div>
      <form id="form-book-cleaning">
        <div class="modal__body" style="display: flex; flex-direction: column; gap: 14px;">
          <div style="font-size: var(--text-xs); color: var(--muted); padding: 8px 12px; background: var(--field); border-radius: var(--radius-sm);">
            Allocated to <strong>Room ${room.block}-${room.number}</strong> &bull; Resident: ${escapeHTML(student.name)}
          </div>

          <div class="form-group">
            <label class="form-label">Service Focus</label>
            <select class="form-select" id="clean-focus" required>
              <option value="Routine Mopping & Dusting">Routine Mopping & Dusting</option>
              <option value="Washroom Deep Scrub">Washroom Deep Scrub & Descaling</option>
              <option value="Balcony & Mesh Wash">Balcony & Window Mesh Wash</option>
              <option value="Trash & Liner Clearance">Trash Clearance & Liner Replacement</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Preferred Time Slot</label>
            <select class="form-select" id="clean-time-slot" required>
              <option value="09:00 - 11:00">Morning (09:00 - 11:00)</option>
              <option value="11:00 - 13:00">Noon (11:00 - 13:00)</option>
              <option value="14:00 - 16:00">Afternoon (14:00 - 16:00)</option>
              <option value="16:00 - 18:00">Evening (16:00 - 18:00)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Special Instructions (Optional)</label>
            <textarea class="form-textarea" id="clean-notes" placeholder="e.g. Please scrub the shower tile floor..."></textarea>
          </div>
        </div>
        <div class="modal__footer">
          <button type="button" class="btn btn--secondary btn-modal-close">Cancel</button>
          <button type="submit" class="btn btn--primary">Confirm Reservation</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(backdrop);

  const cleanup = () => backdrop.remove();
  backdrop.querySelectorAll('.btn-modal-close').forEach(b => b.addEventListener('click', cleanup));

  backdrop.querySelector('#form-book-cleaning').addEventListener('submit', (e) => {
    e.preventDefault();
    const focus = backdrop.querySelector('#clean-focus').value;
    const slot = backdrop.querySelector('#clean-time-slot').value;
    const notes = backdrop.querySelector('#clean-notes').value;

    store.createServiceRequest({
      studentId: student.id,
      roomId: room.id,
      type: 'cleaning',
      category: focus,
      title: focus,
      description: notes || `Scheduled housekeeping for ${focus} during ${slot}`,
      priority: 'low',
      preferredSlot: slot
    });

    showToast('Housekeeping booked successfully!', 'success');
    cleanup();
    onComplete();
  });
}

/**
 * Warden Cleaner Assignment Modal
 */
function openCleanerAssignModal(requestId, onComplete) {
  const state = store.getState();
  const req = state.serviceRequests.find(r => r.id === requestId);
  if (!req) return;

  const cleaners = ["Sunita (Housekeeping)", "Manoj (Housekeeping)", "Kishore (Sanitation Team)", "Pramod (Sanitation)"];

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';

  backdrop.innerHTML = `
    <div class="modal">
      <div class="modal__header">
        <h3 class="modal__title">Dispatch Housekeeping Cleaner</h3>
        <button class="icon-btn btn-modal-close" aria-label="Close dialog">${getIcon('close')}</button>
      </div>
      <div class="modal__body" style="display: flex; flex-direction: column; gap: 14px;">
        <div style="font-size: var(--text-sm);">
          <strong>Room ${req.roomId.replace('room-', '')}</strong> &bull; ${escapeHTML(req.category)} (${escapeHTML(req.preferredSlot)})
        </div>

        <div class="form-group">
          <label class="form-label">Assign Housekeeping Staff</label>
          <select class="form-select" id="select-cleaner">
            <option value="">Unassigned</option>
            ${cleaners.map(c => `
              <option value="${c}" ${req.assignee === c ? 'selected' : ''}>${c}</option>
            `).join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Workflow Status</label>
          <select class="form-select" id="select-hk-work-status">
            <option value="pending" ${req.status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="assigned" ${req.status === 'assigned' ? 'selected' : ''}>Assigned</option>
            <option value="in-progress" ${req.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
            <option value="resolved" ${req.status === 'resolved' ? 'selected' : ''}>Completed / Signed Off</option>
          </select>
        </div>
      </div>
      <div class="modal__footer">
        <button class="btn btn--secondary btn-modal-close">Cancel</button>
        <button class="btn btn--primary" id="btn-save-cleaner">Save Assignment</button>
      </div>
    </div>
  `;

  document.body.appendChild(backdrop);

  const cleanup = () => backdrop.remove();
  backdrop.querySelectorAll('.btn-modal-close').forEach(b => b.addEventListener('click', cleanup));

  backdrop.querySelector('#btn-save-cleaner').addEventListener('click', () => {
    const cleaner = backdrop.querySelector('#select-cleaner').value;
    const newStatus = backdrop.querySelector('#select-hk-work-status').value;

    store.updateServiceRequestStatus(req.id, newStatus, `Housekeeping updated: Staff - ${cleaner || 'None'}, Status - ${newStatus}`, cleaner);
    showToast('Housekeeping dispatch saved.', 'success');
    cleanup();
    onComplete();
  });
}
