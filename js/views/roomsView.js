import { store } from '../store.js';
import { getIcon, showToast, escapeHTML, getBadge } from '../utils.js';

export function renderRoomsView(container, router) {
  let selectedBlock = "A";
  let selectedFloor = "1";
  let filterStatus = "all";

  function render() {
    const state = store.getState();
    const blocks = ["A", "B", "C", "D"];
    const floors = ["1", "2", "3"];

    // Filter
    const filtered = state.rooms.filter(r => {
      const matchBlock = r.block === selectedBlock;
      const matchFloor = String(r.floor) === String(selectedFloor);
      const matchStatus = filterStatus === "all" ? true : r.status === filterStatus;
      return matchBlock && matchFloor && matchStatus;
    });

    // Counts for current block
    const blockRooms = state.rooms.filter(r => r.block === selectedBlock);
    const availableCount = blockRooms.filter(r => r.status === 'available').length;
    const partialCount = blockRooms.filter(r => r.status === 'partial').length;
    const fullCount = blockRooms.filter(r => r.status === 'full').length;

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: var(--section-gap);">
        
        <!-- Header -->
        <div style="display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 8px;">
          <div>
            <h1 style="font-size: var(--text-2xl); font-weight: 600;">Floor Map & Bed Allocation</h1>
            <p style="font-size: var(--text-sm); color: var(--muted); margin-top: 2px;">
              Pure bed allocation and room inspection map. Click any room tile to assign or transfer residents.
            </p>
          </div>
          <div style="display: flex; gap: 8px;">
            <a href="#/students" class="btn btn--secondary btn--sm">Resident Directory</a>
          </div>
        </div>

        <!-- Block Tabs -->
        <div style="display: flex; gap: 6px; border-bottom: 1px solid var(--border); padding-bottom: 4px;">
          ${blocks.map(b => `
            <button class="btn ${selectedBlock === b ? 'btn--secondary' : 'btn--tertiary'} btn--sm tab-block-btn" data-block="${b}" style="${selectedBlock === b ? 'background: var(--surface-hover); font-weight: 600;' : ''}">
              Block ${b} Quarters
            </button>
          `).join('')}
        </div>

        <!-- Floor Sub-Tabs & Filter -->
        <div class="card" style="padding: 12px 18px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: var(--text-xs); font-weight: 600; text-transform: uppercase; color: var(--muted);">Floor:</span>
            <div style="display: flex; gap: 4px;">
              ${floors.map(f => `
                <button class="btn ${selectedFloor === f ? 'btn--secondary' : 'btn--tertiary'} btn--sm tab-floor-btn" data-floor="${f}" style="${selectedFloor === f ? 'background: var(--surface-hover); font-weight: 600;' : ''}">
                  Floor ${f}
                </button>
              `).join('')}
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: var(--text-xs); font-weight: 600; text-transform: uppercase; color: var(--muted);">Status Filter:</span>
            <select class="form-select" id="select-room-status" style="width: auto; height: 32px; font-size: var(--text-xs); padding: 0 10px;">
              <option value="all" ${filterStatus === 'all' ? 'selected' : ''}>All Rooms (${blockRooms.length})</option>
              <option value="available" ${filterStatus === 'available' ? 'selected' : ''}>Available (${availableCount})</option>
              <option value="partial" ${filterStatus === 'partial' ? 'selected' : ''}>Partially Occupied (${partialCount})</option>
              <option value="full" ${filterStatus === 'full' ? 'selected' : ''}>Full (${fullCount})</option>
              <option value="maintenance" ${filterStatus === 'maintenance' ? 'selected' : ''}>Under Maintenance</option>
            </select>
          </div>
        </div>

        <!-- Room Tiles Grid -->
        <div>
          <div style="font-size: var(--text-xs); font-weight: 600; text-transform: uppercase; color: var(--muted); letter-spacing: 0.05em; margin-bottom: 12px;">
            Block ${selectedBlock} &bull; Floor ${selectedFloor} &bull; ${filtered.length} Quarters
          </div>

          ${filtered.length > 0 ? `
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 14px;">
              ${filtered.map(room => {
                const occ = room.occupants.length;
                return `
                  <div class="card btn-room-tile" data-room-id="${room.id}" style="padding: 16px; cursor: pointer; display: flex; flex-direction: column; justify-content: space-between; gap: 10px; transition: border-color var(--transition-fast);">
                    <div style="display: flex; justify-content: space-between; align-items: baseline;">
                      <span style="font-size: 11px; color: var(--muted);">${room.type}</span>
                      ${getBadge(room.status)}
                    </div>

                    <div style="font-size: 24px; font-weight: 600; color: var(--ink); font-variant-numeric: tabular-nums;">
                      ${room.block}-${room.number}
                    </div>

                    <div>
                      <div style="display: flex; gap: 4px; margin-bottom: 4px;">
                        ${Array.from({ length: room.capacity }).map((_, idx) => `
                          <div style="height: 4px; flex: 1; border-radius: 2px; background: ${idx < occ ? 'var(--accent-solid)' : 'var(--border)'};"></div>
                        `).join('')}
                      </div>
                      <div style="font-size: 11px; color: var(--muted);">
                        ${occ} of ${room.capacity} beds filled
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          ` : `
            <div class="card">
              <div class="empty-state">
                <div class="empty-state__title">No Rooms Found</div>
                <div class="empty-state__text">No rooms matched the selected status filter on this floor.</div>
              </div>
            </div>
          `}
        </div>

      </div>
    `;

    // Tab events
    container.querySelectorAll('.tab-block-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedBlock = btn.getAttribute('data-block');
        render();
      });
    });

    container.querySelectorAll('.tab-floor-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedFloor = btn.getAttribute('data-floor');
        render();
      });
    });

    container.querySelector('#select-room-status')?.addEventListener('change', (e) => {
      filterStatus = e.target.value;
      render();
    });

    // Room tile click -> Pure allocation modal
    container.querySelectorAll('.btn-room-tile').forEach(tile => {
      tile.addEventListener('click', () => {
        const rId = tile.getAttribute('data-room-id');
        openPureAllocationModal(rId, () => render());
      });
    });
  }

  render();
}

/**
 * Pure Allocation Modal (No Pricing, No money, Instant bed assignment)
 */
function openPureAllocationModal(roomId, onComplete) {
  const state = store.getState();
  const room = state.rooms.find(r => r.id === roomId);
  if (!room) return;

  const occupants = state.students.filter(s => room.occupants.includes(s.id));
  const unassigned = state.students.filter(s => !s.roomId);
  const isFull = room.occupants.length >= room.capacity;

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';

  backdrop.innerHTML = `
    <div class="modal" style="max-width: 480px;">
      <div class="modal__header">
        <div>
          <h3 class="modal__title">Room Allocation: ${room.block}-${room.number}</h3>
          <div style="font-size: var(--text-xs); color: var(--muted); margin-top: 2px;">
            ${room.type} Room &bull; Capacity: ${room.capacity} beds &bull; Status: ${room.status}
          </div>
        </div>
        <button class="icon-btn btn-modal-close" aria-label="Close dialog">${getIcon('close')}</button>
      </div>

      <div class="modal__body" style="display: flex; flex-direction: column; gap: 16px;">
        
        <!-- Occupants Section -->
        <div>
          <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px;">
            <label class="form-label" style="margin: 0;">Current Residents (${occupants.length}/${room.capacity})</label>
            <button class="btn btn--tertiary btn--sm" id="btn-toggle-room-maint" style="font-size: 11px; padding: 0 4px;">
              ${room.status === 'maintenance' ? 'Restore to Active' : 'Mark Maintenance'}
            </button>
          </div>

          ${occupants.length > 0 ? `
            <div style="display: flex; flex-direction: column; gap: 6px;">
              ${occupants.map(s => `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: var(--field); border-radius: var(--radius-sm); border: 1px solid var(--border);">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <img src="${s.avatar}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover;" alt="${escapeHTML(s.name)}" />
                    <div>
                      <div style="font-size: var(--text-sm); font-weight: 500;">${escapeHTML(s.name)}</div>
                      <div style="font-size: 11px; color: var(--muted);">${escapeHTML(s.rollNo)} &bull; ${escapeHTML(s.course)}</div>
                    </div>
                  </div>
                  <button class="btn btn--danger btn--sm btn-unassign" data-student-id="${s.id}" style="padding: 2px 8px; font-size: 11px;">
                    Unassign
                  </button>
                </div>
              `).join('')}
            </div>
          ` : `
            <div style="padding: 14px; background: var(--field); border-radius: var(--radius-sm); text-align: center; color: var(--muted); font-size: var(--text-xs);">
              This room is currently empty. All ${room.capacity} beds are vacant.
            </div>
          `}
        </div>

        <!-- Assignment Dropdown (Pure Allocation) -->
        <div style="border-top: 1px solid var(--border); padding-top: 14px;">
          <label class="form-label">Assign Unallocated Student</label>
          ${isFull ? `
            <div style="padding: 10px 12px; background: var(--field); border-radius: var(--radius-sm); font-size: var(--text-xs); color: var(--muted);">
              Room is at full capacity (${room.capacity}/${room.capacity}). Unassign a resident above to free a bed.
            </div>
          ` : `
            <div style="display: flex; gap: 8px;">
              <select class="form-select" id="select-unassigned" style="flex: 1;">
                <option value="">Select a student to allocate...</option>
                ${unassigned.map(s => `
                  <option value="${s.id}">${escapeHTML(s.name)} (${s.rollNo} - ${s.course})</option>
                `).join('')}
              </select>
              <button class="btn btn--primary btn--sm" id="btn-confirm-assign" style="flex-shrink: 0;">
                Assign Bed
              </button>
            </div>
            <div style="font-size: 11px; color: var(--muted); margin-top: 4px;">
              ${unassigned.length} resident(s) awaiting room allocation.
            </div>
          `}
        </div>

      </div>

      <div class="modal__footer">
        <button class="btn btn--secondary btn-modal-close">Close</button>
      </div>
    </div>
  `;

  document.body.appendChild(backdrop);

  const cleanup = () => {
    backdrop.remove();
    onComplete();
  };

  backdrop.querySelectorAll('.btn-modal-close').forEach(b => b.addEventListener('click', cleanup));

  // Toggle Maintenance
  backdrop.querySelector('#btn-toggle-room-maint')?.addEventListener('click', () => {
    store.toggleRoomMaintenance(room.id);
    showToast(`Room ${room.block}-${room.number} status updated.`, 'info');
    backdrop.remove();
    openPureAllocationModal(roomId, onComplete);
  });

  // Unassign student
  backdrop.querySelectorAll('.btn-unassign').forEach(btn => {
    btn.addEventListener('click', () => {
      const sId = btn.getAttribute('data-student-id');
      store.unassignStudent(sId);
      showToast('Student unassigned and bed freed.', 'info');
      backdrop.remove();
      openPureAllocationModal(roomId, onComplete);
    });
  });

  // Assign Student
  backdrop.querySelector('#btn-confirm-assign')?.addEventListener('click', () => {
    const sId = backdrop.querySelector('#select-unassigned').value;
    if (!sId) {
      showToast('Please select a student from the list.', 'warning');
      return;
    }

    try {
      store.assignStudentToRoom(sId, room.id);
      showToast('Student assigned to bed.', 'success');
      backdrop.remove();
      openPureAllocationModal(roomId, onComplete);
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}
