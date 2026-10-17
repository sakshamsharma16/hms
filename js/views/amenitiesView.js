import { store } from '../store.js';
import { getIcon, showToast, escapeHTML, getBadge, showConfirmDialog } from '../utils.js';

export function renderAmenitiesView(container, router) {
  let selectedDate = new Date().toISOString().split('T')[0];

  function render() {
    const state = store.getState();
    const isAdmin = state.settings.activeRole === 'admin';
    const currentStudent = state.students.find(s => s.id === state.settings.currentStudentId) || state.students[0];

    // Find student's active bookings
    const myBookings = [];
    state.amenities.forEach(a => {
      a.bookings
        .filter(b => b.studentId === currentStudent.id && b.status === 'confirmed')
        .forEach(b => {
          myBookings.push({ ...b, amenityName: a.name, amenityId: a.id });
        });
    });

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: var(--section-gap);">
        
        <!-- Header -->
        <div style="display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 8px;">
          <div>
            <h1 style="font-size: var(--text-2xl); font-weight: 600;">Campus Amenities & Sports Facilities</h1>
            <p style="font-size: var(--text-sm); color: var(--muted); margin-top: 2px;">
              Reserve training slots at the fitness center, study pods, pool, and visitor parking.
            </p>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: var(--text-xs); color: var(--muted); font-weight: 600;">Date:</span>
            <input type="date" class="form-input" id="amenity-date-picker" value="${selectedDate}" style="width: auto; height: 32px; font-size: var(--text-xs); padding: 0 8px;" />
          </div>
        </div>

        <!-- Student Active Reservations -->
        ${!isAdmin && myBookings.length > 0 ? `
          <div class="card" style="padding: 16px 20px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
              <h3 style="font-size: var(--text-base); font-weight: 600;">My Active Reservations</h3>
              <span style="font-size: var(--text-xs); color: var(--muted);">${myBookings.length} booking(s)</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${myBookings.map(b => `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: var(--field); border-radius: var(--radius-sm); font-size: var(--text-sm);">
                  <div>
                    <span style="font-weight: 600; color: var(--ink);">${escapeHTML(b.amenityName)}</span>
                    <span style="color: var(--muted); margin-left: 8px;">&bull; Slot: ${escapeHTML(b.slot)} (${b.date})</span>
                  </div>
                  <button class="btn btn--danger btn--sm btn-cancel-booking" data-amenity-id="${b.amenityId}" data-booking-id="${b.id}">
                    Cancel Reservation
                  </button>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Facilities Cards Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: var(--gap);">
          ${state.amenities.map(facility => {
            const isMaint = facility.status === 'maintenance';
            const slotBookings = facility.bookings.filter(b => b.date === selectedDate && b.status === 'confirmed');
            const occ = isMaint ? 0 : Math.min(facility.capacity, slotBookings.length || facility.currentOccupancy);
            const pct = Math.round((occ / facility.capacity) * 100);
            const isFull = occ >= facility.capacity;

            return `
              <div class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                  <div class="card__header" style="margin-bottom: 8px;">
                    <div>
                      <h3 class="card__title" style="font-size: var(--text-base);">${escapeHTML(facility.name)}</h3>
                      <div class="card__subtitle">${escapeHTML(facility.location)} &bull; ${facility.hours}</div>
                    </div>
                    ${getBadge(isMaint ? 'maintenance' : isFull ? 'danger' : 'success', isMaint ? 'Maintenance' : isFull ? 'Full' : 'Open')}
                  </div>

                  <!-- Capacity bar -->
                  <div style="margin: 12px 0;">
                    <div style="display: flex; justify-content: space-between; font-size: var(--text-xs); color: var(--muted);">
                      <span>Occupancy</span>
                      <span>${occ} of ${facility.capacity} slots filled (${pct}%)</span>
                    </div>
                    <div class="capacity-bar">
                      <div class="capacity-bar__fill ${isFull ? 'capacity-bar__fill--full' : ''}" style="width: ${isMaint ? 0 : pct}%;"></div>
                    </div>
                  </div>

                  <!-- Available Slots -->
                  <div style="margin-top: 14px;">
                    <span style="font-size: var(--text-xs); font-weight: 600; text-transform: uppercase; color: var(--muted);">Operating Slots:</span>
                    <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px;">
                      ${facility.slots.map(s => {
                        const countInSlot = slotBookings.filter(b => b.slot === s).length;
                        const slotFull = countInSlot >= Math.ceil(facility.capacity / facility.slots.length);
                        return `
                          <span style="font-size: 11px; padding: 3px 8px; border-radius: var(--radius-sm); background: var(--field); border: 1px solid var(--border); color: ${slotFull ? 'var(--muted)' : 'var(--ink)'};">
                            ${s} ${slotFull ? '(Full)' : ''}
                          </span>
                        `;
                      }).join('')}
                    </div>
                  </div>
                </div>

                <!-- Action Button -->
                <div style="margin-top: 20px; padding-top: 14px; border-top: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between;">
                  ${isAdmin ? `
                    <button class="btn btn--secondary btn--sm btn-toggle-facility" data-id="${facility.id}">
                      ${isMaint ? 'Mark Operational' : 'Set Under Maintenance'}
                    </button>
                    <span style="font-size: var(--text-xs); color: var(--muted);">${facility.bookings.length} reservations</span>
                  ` : `
                    <button class="btn ${isMaint || isFull ? 'btn--secondary' : 'btn--primary'} btn--sm btn-book-slot" data-id="${facility.id}" ${isMaint || isFull ? 'disabled style="opacity: 0.6; cursor: not-allowed;"' : ''}>
                      ${isMaint ? 'Facility Closed' : isFull ? 'Fully Booked' : 'Reserve a Slot'}
                    </button>
                    <span style="font-size: var(--text-xs); color: var(--muted);">Max 1 booking / day</span>
                  `}
                </div>
              </div>
            `;
          }).join('')}
        </div>

      </div>
    `;

    // Date picker event
    container.querySelector('#amenity-date-picker')?.addEventListener('change', (e) => {
      selectedDate = e.target.value;
      render();
    });

    // Book slot click
    container.querySelectorAll('.btn-book-slot').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openAmenityBookingModal(id, selectedDate, currentStudent, () => render());
      });
    });

    // Cancel reservation click
    container.querySelectorAll('.btn-cancel-booking').forEach(btn => {
      btn.addEventListener('click', async () => {
        const aId = btn.getAttribute('data-amenity-id');
        const bId = btn.getAttribute('data-booking-id');
        const confirmed = await showConfirmDialog({
          title: "Cancel Amenity Reservation",
          message: "Are you sure you want to cancel this booking? This will immediately free the slot for other residents.",
          confirmText: "Cancel Reservation",
          isDanger: true
        });

        if (confirmed) {
          store.cancelAmenityBooking(aId, bId);
          showToast('Reservation cancelled.', 'info');
          render();
        }
      });
    });

    // Warden toggle facility
    container.querySelectorAll('.btn-toggle-facility').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        store.toggleAmenityStatus(id);
        showToast('Facility status updated.', 'info');
        render();
      });
    });
  }

  render();
}

/**
 * Amenity Booking Dialog
 */
function openAmenityBookingModal(amenityId, date, student, onComplete) {
  const state = store.getState();
  const facility = state.amenities.find(a => a.id === amenityId);
  if (!facility) return;

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';

  backdrop.innerHTML = `
    <div class="modal">
      <div class="modal__header">
        <h3 class="modal__title">Reserve Slot: ${escapeHTML(facility.name)}</h3>
        <button class="icon-btn btn-modal-close" aria-label="Close dialog">${getIcon('close')}</button>
      </div>
      <form id="form-amenity-book">
        <div class="modal__body" style="display: flex; flex-direction: column; gap: 14px;">
          <div style="font-size: var(--text-xs); color: var(--muted); padding: 8px 12px; background: var(--field); border-radius: var(--radius-sm);">
            ${escapeHTML(facility.location)} &bull; Operating hours: ${facility.hours}
          </div>

          <div class="form-group">
            <label class="form-label">Reservation Date</label>
            <input type="date" class="form-input" id="book-date" value="${date}" required />
          </div>

          <div class="form-group">
            <label class="form-label">Available Time Slot</label>
            <select class="form-select" id="book-slot" required>
              ${facility.slots.map(s => `
                <option value="${s}">${s}</option>
              `).join('')}
            </select>
          </div>

          <div style="font-size: var(--text-xs); color: var(--muted); line-height: var(--leading-body);">
            Please arrive promptly at your selected slot. Unclaimed reservations are released after 15 minutes.
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

  backdrop.querySelector('#form-amenity-book').addEventListener('submit', (e) => {
    e.preventDefault();
    const d = backdrop.querySelector('#book-date').value;
    const slot = backdrop.querySelector('#book-slot').value;

    try {
      store.bookAmenity(facility.id, student.id, slot, d);
      showToast(`Reservation confirmed for ${facility.name} (${slot})!`, 'success');
      cleanup();
      onComplete();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}
