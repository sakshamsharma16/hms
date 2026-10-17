import { store } from '../store.js';
import { getIcon, showToast, escapeHTML, formatDate, getBadge } from '../utils.js';

export function renderServiceDeskView(container, router) {
  let filterType = 'all'; // all | cleaning | maintenance
  let searchQuery = '';

  function render() {
    const state = store.getState();
    const isAdmin = state.settings.activeRole === 'admin';
    const currentStudent = state.students.find(s => s.id === state.settings.currentStudentId) || state.students[0];

    const columns = [
      { key: 'pending', title: 'Pending' },
      { key: 'assigned', title: 'Assigned' },
      { key: 'in-progress', title: 'In Progress' },
      { key: 'resolved', title: 'Resolved' }
    ];

    const relevantRequests = isAdmin 
      ? state.serviceRequests 
      : state.serviceRequests.filter(r => r.studentId === currentStudent.id);

    // Filter by type & search
    const filtered = relevantRequests.filter(req => {
      const matchType = filterType === 'all' ? true : req.type === filterType;
      const matchSearch = searchQuery ? (
        req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.roomId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (req.assignee && req.assignee.toLowerCase().includes(searchQuery.toLowerCase()))
      ) : true;
      return matchType && matchSearch;
    });

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: var(--section-gap);">
        
        <!-- Header -->
        <div style="display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 8px;">
          <div>
            <h1 style="font-size: var(--text-2xl); font-weight: 600;">Service Desk & Dispatcher</h1>
            <p style="font-size: var(--text-sm); color: var(--muted); margin-top: 2px;">
              ${isAdmin ? 'Unified operations board for housekeeping assignments and facility repairs.' : 'Real-time workflow tracker for your room maintenance complaints and cleaning.'}
            </p>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn ${filterType === 'all' ? 'btn--secondary' : 'btn--tertiary'} btn--sm filter-type-btn" data-type="all" style="${filterType === 'all' ? 'background: var(--surface-hover); font-weight: 600;' : ''}">
              All (${relevantRequests.length})
            </button>
            <button class="btn ${filterType === 'cleaning' ? 'btn--secondary' : 'btn--tertiary'} btn--sm filter-type-btn" data-type="cleaning" style="${filterType === 'cleaning' ? 'background: var(--surface-hover); font-weight: 600;' : ''}">
              Housekeeping
            </button>
            <button class="btn ${filterType === 'maintenance' ? 'btn--secondary' : 'btn--tertiary'} btn--sm filter-type-btn" data-type="maintenance" style="${filterType === 'maintenance' ? 'background: var(--surface-hover); font-weight: 600;' : ''}">
              Maintenance
            </button>
          </div>
        </div>

        <!-- Search Bar -->
        <div class="card" style="padding: 10px 14px;">
          <div class="search-field">
            ${getIcon('search')}
            <input type="text" class="form-input" id="search-desk" placeholder="Search by ticket title, equipment category, room number, or staff assignee..." value="${escapeHTML(searchQuery)}" style="border: none; background: transparent; height: 32px;" />
          </div>
        </div>

        <!-- Student Linear View or Warden Kanban Grid -->
        ${!isAdmin ? `
          <!-- Student Ticket Tracker -->
          <div style="display: flex; flex-direction: column; gap: 14px;">
            ${filtered.length > 0 ? filtered.map(req => {
              const statusOrder = ['pending', 'assigned', 'in-progress', 'resolved'];
              const currentStepIdx = statusOrder.indexOf(req.status);

              return `
                <div class="card" style="padding: 18px 20px;">
                  <div style="display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 8px; margin-bottom: 8px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span style="font-size: var(--text-xs); font-weight: 600; text-transform: uppercase; color: var(--muted);">
                        ${req.type} &bull; Room ${req.roomId.replace('room-', '')}
                      </span>
                      ${getBadge(req.status)}
                    </div>
                    <span style="font-size: var(--text-xs); color: var(--muted);">${req.createdAt}</span>
                  </div>

                  <h3 style="font-size: var(--text-base); font-weight: 600; margin-bottom: 4px;">${escapeHTML(req.title)}</h3>
                  <p style="font-size: var(--text-sm); color: var(--ink-secondary);">${escapeHTML(req.description)}</p>

                  <!-- Linear Stepper -->
                  <div class="stepper-line" style="margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--border);">
                    ${statusOrder.map((step, idx) => {
                      const isCompleted = idx < currentStepIdx;
                      const isActive = idx === currentStepIdx;
                      return `
                        <div class="stepper-step ${isCompleted ? 'completed' : isActive ? 'active' : ''}">
                          <span>${isCompleted ? '✓' : idx + 1}.</span>
                          <span style="text-transform: capitalize;">${step.replace('-', ' ')}</span>
                        </div>
                        ${idx < statusOrder.length - 1 ? `<span class="stepper-arrow">&rarr;</span>` : ''}
                      `;
                    }).join('')}
                  </div>

                  ${req.assignee ? `
                    <div style="font-size: var(--text-xs); color: var(--muted); margin-top: 8px;">
                      Technician assigned: <strong style="color: var(--ink);">${escapeHTML(req.assignee)}</strong>
                    </div>
                  ` : ''}
                </div>
              `;
            }).join('') : `
              <div class="card">
                <div class="empty-state">
                  <div class="empty-state__title">No Active Service Tickets</div>
                  <div class="empty-state__text">You do not have any open housekeeping or maintenance complaints.</div>
                </div>
              </div>
            `}
          </div>
        ` : `
          <!-- Warden Kanban Board -->
          <div class="kanban-grid">
            ${columns.map(col => {
              const colItems = filtered.filter(r => r.status === col.key);
              return `
                <div class="kanban-column" data-status="${col.key}">
                  <div class="kanban-col-header">
                    <span>${col.title}</span>
                    <span class="badge badge--neutral">${colItems.length}</span>
                  </div>

                  <div class="kanban-cards-area" data-drop-col="${col.key}">
                    ${colItems.map(item => `
                      <div class="kanban-item" draggable="true" data-ticket-id="${item.id}">
                        <div style="display: flex; align-items: center; justify-content: space-between;">
                          <span style="font-size: 11px; font-weight: 600; color: var(--muted); text-transform: uppercase;">
                            ${item.type} &bull; Room ${item.roomId.replace('room-', '')}
                          </span>
                          ${item.isOverdue ? `<span style="font-size: 10px; color: var(--danger); font-weight: 600;">OVERDUE</span>` : ''}
                        </div>

                        <div style="font-size: var(--text-sm); font-weight: 500; color: var(--ink); line-height: 1.3;">
                          ${escapeHTML(item.title)}
                        </div>

                        <div style="font-size: var(--text-xs); color: var(--muted); margin-top: 2px;">
                          ${escapeHTML(item.category)} &bull; ${escapeHTML(item.preferredSlot)}
                        </div>

                        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; font-size: 11px;">
                          <span style="color: var(--muted);">${item.assignee ? escapeHTML(item.assignee.split(' ')[0]) : 'Unassigned'}</span>
                          <button class="btn btn--tertiary btn--sm btn-card-manage" data-id="${item.id}" style="padding: 2px 6px; font-size: 11px; color: var(--accent);">
                            Dispatch
                          </button>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}

      </div>
    `;

    // Filter Buttons
    container.querySelectorAll('.filter-type-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        filterType = btn.getAttribute('data-type');
        render();
      });
    });

    // Search Input
    const searchInput = container.querySelector('#search-desk');
    searchInput?.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      render();
      const updated = container.querySelector('#search-desk');
      if (updated) {
        updated.focus();
        updated.setSelectionRange(searchQuery.length, searchQuery.length);
      }
    });

    // Dispatch button
    container.querySelectorAll('.btn-card-manage').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        openDispatchModal(id, () => render());
      });
    });

    // HTML5 Drag and Drop for Warden Kanban
    if (isAdmin) {
      setupKanbanDragDrop(render);
    }
  }

  function setupKanbanDragDrop(rerender) {
    let draggedId = null;

    container.querySelectorAll('.kanban-item').forEach(card => {
      card.addEventListener('dragstart', (e) => {
        draggedId = card.getAttribute('data-ticket-id');
        card.classList.add('dragging');
        e.dataTransfer.setData('text/plain', draggedId);
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
      });
    });

    container.querySelectorAll('.kanban-cards-area').forEach(dropzone => {
      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.style.background = 'var(--surface-hover)';
        dropzone.style.borderRadius = 'var(--radius-sm)';
      });

      dropzone.addEventListener('dragleave', () => {
        dropzone.style.background = 'transparent';
      });

      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.style.background = 'transparent';
        const targetStatus = dropzone.getAttribute('data-drop-col');
        const id = e.dataTransfer.getData('text/plain') || draggedId;

        if (id && targetStatus) {
          const req = store.getState().serviceRequests.find(r => r.id === id);
          if (req && req.status !== targetStatus) {
            store.updateServiceRequestStatus(id, targetStatus, `Ticket transitioned to ${targetStatus}`);
            showToast(`Ticket status updated to ${targetStatus}`, 'success');
            rerender();
          }
        }
      });
    });
  }

  render();
}

/**
 * Warden Ticket Dispatch & Notes Modal
 */
function openDispatchModal(ticketId, onComplete) {
  const state = store.getState();
  const ticket = state.serviceRequests.find(r => r.id === ticketId);
  if (!ticket) return;

  const staff = [
    "Suresh (HVAC Tech)",
    "Ramesh (Electrician)",
    "Sunita (Housekeeping)",
    "Manoj (Housekeeping)",
    "Jagdish (Carpenter)",
    "Dev (IT Admin)",
    "EcoShield Pest Services"
  ];

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';

  backdrop.innerHTML = `
    <div class="modal">
      <div class="modal__header">
        <h3 class="modal__title">Dispatch & Track Ticket</h3>
        <button class="icon-btn btn-modal-close" aria-label="Close dialog">${getIcon('close')}</button>
      </div>
      <div class="modal__body" style="display: flex; flex-direction: column; gap: 14px;">
        <div>
          <div style="font-size: var(--text-sm); font-weight: 600;">${escapeHTML(ticket.title)}</div>
          <div style="font-size: var(--text-xs); color: var(--muted); margin-top: 2px;">
            Room ${ticket.roomId.replace('room-', '')} &bull; ${escapeHTML(ticket.category)}
          </div>
          <p style="font-size: var(--text-sm); color: var(--ink-secondary); margin-top: 6px;">
            ${escapeHTML(ticket.description)}
          </p>
        </div>

        <div class="form-group">
          <label class="form-label">Assign Technician / Cleaner</label>
          <select class="form-select" id="dispatch-staff">
            <option value="">Unassigned</option>
            ${staff.map(s => `
              <option value="${s}" ${ticket.assignee === s ? 'selected' : ''}>${s}</option>
            `).join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Workflow Stage</label>
          <select class="form-select" id="dispatch-stage">
            <option value="pending" ${ticket.status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="assigned" ${ticket.status === 'assigned' ? 'selected' : ''}>Assigned</option>
            <option value="in-progress" ${ticket.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
            <option value="resolved" ${ticket.status === 'resolved' ? 'selected' : ''}>Resolved</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Update Activity Note</label>
          <input type="text" class="form-input" id="dispatch-note" placeholder="e.g. Parts replaced; testing verified." />
        </div>
      </div>
      <div class="modal__footer">
        <button class="btn btn--secondary btn-modal-close">Cancel</button>
        <button class="btn btn--primary" id="btn-save-dispatch">Save Changes</button>
      </div>
    </div>
  `;

  document.body.appendChild(backdrop);

  const cleanup = () => backdrop.remove();
  backdrop.querySelectorAll('.btn-modal-close').forEach(b => b.addEventListener('click', cleanup));

  backdrop.querySelector('#btn-save-dispatch').addEventListener('click', () => {
    const assignedStaff = backdrop.querySelector('#dispatch-staff').value;
    const stage = backdrop.querySelector('#dispatch-stage').value;
    const note = backdrop.querySelector('#dispatch-note').value;

    store.updateServiceRequestStatus(ticket.id, stage, note || `Staff assigned: ${assignedStaff || 'None'}`, assignedStaff);
    showToast('Dispatch updated.', 'success');
    cleanup();
    onComplete();
  });
}
