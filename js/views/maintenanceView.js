import { store } from '../store.js';
import { getIcon, showToast, escapeHTML, formatDate, getBadge } from '../utils.js';

export function renderMaintenanceView(container, router) {
  let filterCategory = 'all';
  let filterStatus = 'all';

  function render() {
    const state = store.getState();
    const isAdmin = state.settings.activeRole === 'admin';
    const currentStudent = state.students.find(s => s.id === state.settings.currentStudentId) || state.students[0];

    // Filter tickets
    const allRepairs = state.serviceRequests.filter(r => r.type === 'maintenance');
    const viewRepairs = isAdmin ? allRepairs : allRepairs.filter(r => r.studentId === currentStudent.id);

    const filtered = viewRepairs.filter(r => {
      const matchCat = filterCategory === 'all' ? true : r.category.toLowerCase().includes(filterCategory.toLowerCase());
      const matchStatus = filterStatus === 'all' ? true : r.status === filterStatus;
      return matchCat && matchStatus;
    });

    const openCount = viewRepairs.filter(r => ['pending', 'assigned', 'in-progress'].includes(r.status)).length;

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: var(--section-gap);">
        
        <!-- Header -->
        <div style="display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 8px;">
          <div>
            <h1 style="font-size: var(--text-2xl); font-weight: 600;">Maintenance & Facility Repairs</h1>
            <p style="font-size: var(--text-sm); color: var(--muted); margin-top: 2px;">
              Report malfunctioning air conditioners, plumbing fixtures, electrical switches, or furniture repairs.
            </p>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn--primary" id="btn-report-repair">
              ${getIcon('plus')}
              <span>Report a Repair</span>
            </button>
          </div>
        </div>

        <!-- Filter Row -->
        <div class="card" style="padding: 12px 18px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: var(--text-xs); font-weight: 600; text-transform: uppercase; color: var(--muted);">Category:</span>
            <select class="form-select" id="filter-repair-cat" style="width: auto; height: 32px; font-size: var(--text-xs); padding: 0 10px;">
              <option value="all" ${filterCategory === 'all' ? 'selected' : ''}>All Categories</option>
              <option value="Air Conditioner" ${filterCategory === 'Air Conditioner' ? 'selected' : ''}>Air Conditioner</option>
              <option value="Electrical" ${filterCategory === 'Electrical' ? 'selected' : ''}>Electrical</option>
              <option value="Plumbing" ${filterCategory === 'Plumbing' ? 'selected' : ''}>Plumbing</option>
              <option value="Carpentry" ${filterCategory === 'Carpentry' ? 'selected' : ''}>Carpentry</option>
              <option value="Network" ${filterCategory === 'Network' ? 'selected' : ''}>Network / Wi-Fi</option>
            </select>
          </div>

          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: var(--text-xs); font-weight: 600; text-transform: uppercase; color: var(--muted);">Status:</span>
            <select class="form-select" id="filter-repair-status" style="width: auto; height: 32px; font-size: var(--text-xs); padding: 0 10px;">
              <option value="all" ${filterStatus === 'all' ? 'selected' : ''}>All Statuses</option>
              <option value="pending" ${filterStatus === 'pending' ? 'selected' : ''}>Pending</option>
              <option value="assigned" ${filterStatus === 'assigned' ? 'selected' : ''}>Assigned</option>
              <option value="in-progress" ${filterStatus === 'in-progress' ? 'selected' : ''}>In Progress</option>
              <option value="resolved" ${filterStatus === 'resolved' ? 'selected' : ''}>Resolved</option>
            </select>
          </div>
        </div>

        <!-- Repairs Data Table -->
        <div class="card" style="padding: 0; overflow: hidden;">
          <div class="table-container" style="border: none; border-radius: 0;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Ticket / Issue</th>
                  <th>Room</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Date Opened</th>
                  <th>Technician</th>
                  <th>Status</th>
                  ${isAdmin ? `<th style="text-align: right;">Action</th>` : ''}
                </tr>
              </thead>
              <tbody>
                ${filtered.length > 0 ? filtered.map(t => {
                  const rNum = t.roomId.replace('room-', '');
                  return `
                    <tr>
                      <td style="font-weight: 500;">
                        ${escapeHTML(t.title)}
                        ${t.isOverdue ? `<span style="font-size: 10px; color: var(--danger); font-weight: 600; margin-left: 6px;">OVERDUE</span>` : ''}
                      </td>
                      <td style="font-weight: 600;">${rNum}</td>
                      <td>${escapeHTML(t.category)}</td>
                      <td>${getBadge(t.priority === 'urgent' ? 'danger' : t.priority === 'high' ? 'warning' : 'neutral', t.priority)}</td>
                      <td style="font-size: var(--text-xs); color: var(--muted);">${t.createdAt.split(' ')[0]}</td>
                      <td style="font-size: var(--text-xs); color: var(--muted);">
                        ${t.assignee ? escapeHTML(t.assignee) : 'Unassigned'}
                      </td>
                      <td>${getBadge(t.status)}</td>
                      ${isAdmin ? `
                        <td style="text-align: right;">
                          <button class="btn btn--secondary btn--sm btn-manage-repair" data-id="${t.id}">
                            Manage
                          </button>
                        </td>
                      ` : ''}
                    </tr>
                  `;
                }).join('') : `
                  <tr>
                    <td colspan="${isAdmin ? 8 : 7}" style="padding: 32px; text-align: center; color: var(--muted);">
                      No maintenance complaints found matching your filters.
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
    container.querySelector('#filter-repair-cat')?.addEventListener('change', (e) => {
      filterCategory = e.target.value;
      render();
    });

    container.querySelector('#filter-repair-status')?.addEventListener('change', (e) => {
      filterStatus = e.target.value;
      render();
    });

    // Report Repair Modal
    container.querySelector('#btn-report-repair')?.addEventListener('click', () => {
      openReportRepairModal(() => render());
    });

    // Warden Manage Repair
    container.querySelectorAll('.btn-manage-repair').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openManageRepairModal(id, () => render());
      });
    });
  }

  render();
}

/**
 * Report a Repair Modal with Inline Validation
 */
function openReportRepairModal(onComplete) {
  const state = store.getState();
  const currentStudent = state.students.find(s => s.id === state.settings.currentStudentId) || state.students[0];
  const room = state.rooms.find(r => r.id === currentStudent.roomId);

  if (!room) {
    showToast('You must have an assigned quarters to report repairs.', 'warning');
    return;
  }

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';

  backdrop.innerHTML = `
    <div class="modal">
      <div class="modal__header">
        <h3 class="modal__title">Report Facility Issue / Repair</h3>
        <button class="icon-btn btn-modal-close" aria-label="Close dialog">${getIcon('close')}</button>
      </div>
      <form id="form-report-repair" novalidate>
        <div class="modal__body" style="display: flex; flex-direction: column; gap: 14px;">
          <div style="font-size: var(--text-xs); color: var(--muted); padding: 8px 12px; background: var(--field); border-radius: var(--radius-sm);">
            Reporting for <strong>Room ${room.block}-${room.number}</strong> &bull; Resident: ${escapeHTML(currentStudent.name)}
          </div>

          <div class="form-group" id="grp-repair-cat">
            <label class="form-label" for="repair-cat">Equipment Category</label>
            <select class="form-select" id="repair-cat" required>
              <option value="Air Conditioner">Air Conditioner (Cooling / Vibration / Frost)</option>
              <option value="Electrical">Electrical (Switches / Sparks / Lights / Geyser)</option>
              <option value="Plumbing">Plumbing (Washbasin tap / Drain leak / Flush)</option>
              <option value="Carpentry">Carpentry (Wardrobe hinge / Desk / Bed frame)</option>
              <option value="Network / Wi-Fi">Network & Wi-Fi (Ethernet port / Connectivity)</option>
            </select>
          </div>

          <div class="form-group" id="grp-repair-title">
            <label class="form-label" for="repair-title">Issue Title</label>
            <input type="text" class="form-input" id="repair-title" placeholder="e.g. Split AC not cooling and making loud rattling noise" required />
            <span class="form-error">Please provide a descriptive title (at least 5 characters).</span>
          </div>

          <div class="form-group">
            <label class="form-label" for="repair-priority">Urgency / Severity</label>
            <select class="form-select" id="repair-priority">
              <option value="low">Low - Minor nuisance, non-blocking</option>
              <option value="medium" selected>Medium - Normal maintenance ticket</option>
              <option value="high">High - Discomfort, requires fast repair</option>
              <option value="urgent">Urgent - Electrical spark / water flooding hazard</option>
            </select>
          </div>

          <div class="form-group" id="grp-repair-desc">
            <label class="form-label" for="repair-desc">Detailed Description</label>
            <textarea class="form-textarea" id="repair-desc" placeholder="Describe when the defect occurs, any error lights, or exact behavior..." required></textarea>
            <span class="form-error">Please describe the problem in detail.</span>
          </div>
        </div>
        <div class="modal__footer">
          <button type="button" class="btn btn--secondary btn-modal-close">Cancel</button>
          <button type="submit" class="btn btn--primary">Submit Repair Ticket</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(backdrop);

  const cleanup = () => backdrop.remove();
  backdrop.querySelectorAll('.btn-modal-close').forEach(b => b.addEventListener('click', cleanup));

  const form = backdrop.querySelector('#form-report-repair');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const cat = backdrop.querySelector('#repair-cat').value;
    const titleInput = backdrop.querySelector('#repair-title');
    const descInput = backdrop.querySelector('#repair-desc');
    const priority = backdrop.querySelector('#repair-priority').value;

    let valid = true;
    if (titleInput.value.trim().length < 5) {
      backdrop.querySelector('#grp-repair-title').classList.add('has-error');
      valid = false;
    } else {
      backdrop.querySelector('#grp-repair-title').classList.remove('has-error');
    }

    if (descInput.value.trim().length < 5) {
      backdrop.querySelector('#grp-repair-desc').classList.add('has-error');
      valid = false;
    } else {
      backdrop.querySelector('#grp-repair-desc').classList.remove('has-error');
    }

    if (!valid) return;

    store.createServiceRequest({
      studentId: currentStudent.id,
      roomId: room.id,
      type: 'maintenance',
      category: cat,
      title: titleInput.value.trim(),
      description: descInput.value.trim(),
      priority: priority,
      preferredSlot: 'ASAP'
    });

    showToast('Maintenance ticket opened and facilities notified.', 'success');
    cleanup();
    onComplete();
  });
}

/**
 * Manage Repair Modal for Warden
 */
function openManageRepairModal(ticketId, onComplete) {
  const state = store.getState();
  const ticket = state.serviceRequests.find(r => r.id === ticketId);
  if (!ticket) return;

  const techs = [
    "Suresh (HVAC Tech)",
    "Ramesh (Electrician)",
    "Jagdish (Carpenter)",
    "Dev (IT Admin)",
    "EcoShield Pest Services"
  ];

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';

  backdrop.innerHTML = `
    <div class="modal">
      <div class="modal__header">
        <h3 class="modal__title">Update Maintenance Ticket</h3>
        <button class="icon-btn btn-modal-close" aria-label="Close dialog">${getIcon('close')}</button>
      </div>
      <div class="modal__body" style="display: flex; flex-direction: column; gap: 14px;">
        <div>
          <div style="font-size: var(--text-sm); font-weight: 600;">${escapeHTML(ticket.title)}</div>
          <div style="font-size: var(--text-xs); color: var(--muted); margin-top: 2px;">
            Room ${ticket.roomId.replace('room-', '')} &bull; ${escapeHTML(ticket.category)}
          </div>
          <p style="font-size: var(--text-sm); color: var(--ink-secondary); margin-top: 8px;">
            ${escapeHTML(ticket.description)}
          </p>
        </div>

        <div class="form-group">
          <label class="form-label">Assign Technician</label>
          <select class="form-select" id="manage-tech">
            <option value="">Unassigned</option>
            ${techs.map(t => `
              <option value="${t}" ${ticket.assignee === t ? 'selected' : ''}>${t}</option>
            `).join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Ticket Status</label>
          <select class="form-select" id="manage-status">
            <option value="pending" ${ticket.status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="assigned" ${ticket.status === 'assigned' ? 'selected' : ''}>Assigned</option>
            <option value="in-progress" ${ticket.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
            <option value="resolved" ${ticket.status === 'resolved' ? 'selected' : ''}>Resolved</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Add Note</label>
          <input type="text" class="form-input" id="manage-note" placeholder="e.g. Capacitor replaced and tested at 220V." />
        </div>
      </div>
      <div class="modal__footer">
        <button class="btn btn--secondary btn-modal-close">Cancel</button>
        <button class="btn btn--primary" id="btn-save-repair-status">Save Changes</button>
      </div>
    </div>
  `;

  document.body.appendChild(backdrop);

  const cleanup = () => backdrop.remove();
  backdrop.querySelectorAll('.btn-modal-close').forEach(b => b.addEventListener('click', cleanup));

  backdrop.querySelector('#btn-save-repair-status').addEventListener('click', () => {
    const tech = backdrop.querySelector('#manage-tech').value;
    const newStatus = backdrop.querySelector('#manage-status').value;
    const note = backdrop.querySelector('#manage-note').value;

    store.updateServiceRequestStatus(ticket.id, newStatus, note || `Status updated to ${newStatus}`, tech);
    showToast('Ticket updated successfully.', 'success');
    cleanup();
    onComplete();
  });
}
