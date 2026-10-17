import { store } from '../store.js';
import { getIcon, showToast, escapeHTML, getBadge, showConfirmDialog } from '../utils.js';

export function renderStudentsView(container, router) {
  let searchQuery = '';
  let selectedCourse = 'all';
  let currentPage = 1;
  const itemsPerPage = 8;

  function render() {
    const state = store.getState();
    const courses = ["all", "B.Tech CS", "B.Tech AI&DS", "B.Tech ECE", "B.Arch", "BBA", "B.Sc Data Science", "MBA Tech"];

    // Filter
    const filtered = state.students.filter(student => {
      const matchCourse = selectedCourse === 'all' ? true : student.course === selectedCourse;
      const matchSearch = searchQuery ? (
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase())
      ) : true;
      return matchCourse && matchSearch;
    });

    const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
    const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: var(--section-gap);">
        
        <!-- Header -->
        <div style="display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 8px;">
          <div>
            <h1 style="font-size: var(--text-2xl); font-weight: 600;">Resident Directory & Records</h1>
            <p style="font-size: var(--text-sm); color: var(--muted); margin-top: 2px;">
              Manage campus student enrollment profiles, allocated quarters, and contact records.
            </p>
          </div>
          <button class="btn btn--primary" id="btn-add-resident">
            ${getIcon('plus')}
            <span>Add Resident</span>
          </button>
        </div>

        <!-- Filter Row -->
        <div class="card" style="padding: 12px 18px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px;">
          <div class="search-field" style="max-width: 320px; width: 100%;">
            ${getIcon('search')}
            <input type="text" class="form-input" id="search-student-input" placeholder="Search by name, roll no, or email..." value="${escapeHTML(searchQuery)}" style="height: 32px; font-size: var(--text-xs);" />
          </div>

          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: var(--text-xs); font-weight: 600; text-transform: uppercase; color: var(--muted);">Course:</span>
            <select class="form-select" id="select-course" style="width: auto; height: 32px; font-size: var(--text-xs); padding: 0 10px;">
              ${courses.map(c => `
                <option value="${c}" ${selectedCourse === c ? 'selected' : ''}>${c === 'all' ? 'All Courses' : c}</option>
              `).join('')}
            </select>
          </div>
        </div>

        <!-- Residents Table -->
        <div class="card" style="padding: 0; overflow: hidden;">
          <div class="table-container" style="border: none; border-radius: 0;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Resident</th>
                  <th>Roll Number</th>
                  <th>Course & Year</th>
                  <th>Assigned Room</th>
                  <th>Contact</th>
                  <th style="text-align: right;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${paginated.length > 0 ? paginated.map(student => {
                  const room = state.rooms.find(r => r.id === student.roomId);
                  return `
                    <tr>
                      <td>
                        <div style="display: flex; align-items: center; gap: 8px;">
                          <img src="${student.avatar}" style="width: 26px; height: 26px; border-radius: 50%; object-fit: cover;" alt="${escapeHTML(student.name)}" />
                          <div>
                            <div style="font-weight: 500; color: var(--ink);">${escapeHTML(student.name)}</div>
                            <div style="font-size: 11px; color: var(--muted);">${escapeHTML(student.email)}</div>
                          </div>
                        </div>
                      </td>
                      <td style="font-weight: 500;">${escapeHTML(student.rollNo)}</td>
                      <td>
                        <div>${escapeHTML(student.course)}</div>
                        <div style="font-size: 11px; color: var(--muted);">Year ${student.year}</div>
                      </td>
                      <td>
                        ${room ? `
                          <span style="font-weight: 600; color: var(--ink);">${room.block}-${room.number}</span>
                        ` : `
                          <span style="color: var(--muted); font-size: var(--text-xs);">Unallocated</span>
                        `}
                      </td>
                      <td style="font-size: var(--text-xs); color: var(--muted);">${escapeHTML(student.phone)}</td>
                      <td style="text-align: right;">
                        <div style="display: flex; justify-content: flex-end; gap: 4px;">
                          <button class="btn btn--secondary btn--sm btn-view-profile" data-id="${student.id}" style="padding: 2px 8px; font-size: 11px;">
                            Profile
                          </button>
                          <button class="btn btn--tertiary btn--sm btn-delete-student" data-id="${student.id}" style="color: var(--danger); padding: 2px 6px;">
                            ${getIcon('trash')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('') : `
                  <tr>
                    <td colspan="6" style="padding: 32px; text-align: center; color: var(--muted);">
                      No residents found matching the search criteria.
                    </td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>

          <!-- Pagination Bar -->
          <div style="padding: 10px 16px; border-top: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; font-size: var(--text-xs); color: var(--muted);">
            <div>
              Showing ${(currentPage - 1) * itemsPerPage + 1} to ${Math.min(currentPage * itemsPerPage, filtered.length)} of ${filtered.length} residents
            </div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <button class="btn btn--secondary btn--sm" id="btn-page-prev" ${currentPage === 1 ? 'disabled style="opacity: 0.5;"' : ''}>Prev</button>
              <span style="font-weight: 500;">${currentPage} / ${totalPages}</span>
              <button class="btn btn--secondary btn--sm" id="btn-page-next" ${currentPage >= totalPages ? 'disabled style="opacity: 0.5;"' : ''}>Next</button>
            </div>
          </div>
        </div>

      </div>
    `;

    // Search input
    const searchInp = container.querySelector('#search-student-input');
    searchInp?.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      currentPage = 1;
      render();
      const updated = container.querySelector('#search-student-input');
      if (updated) {
        updated.focus();
        updated.setSelectionRange(searchQuery.length, searchQuery.length);
      }
    });

    // Course select
    container.querySelector('#select-course')?.addEventListener('change', (e) => {
      selectedCourse = e.target.value;
      currentPage = 1;
      render();
    });

    // Pagination
    container.querySelector('#btn-page-prev')?.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        render();
      }
    });

    container.querySelector('#btn-page-next')?.addEventListener('click', () => {
      if (currentPage < totalPages) {
        currentPage++;
        render();
      }
    });

    // Add resident button
    container.querySelector('#btn-add-resident')?.addEventListener('click', () => {
      openAddResidentModal(() => render());
    });

    // Profile drawer
    container.querySelectorAll('.btn-view-profile').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openResidentDrawer(id, () => render());
      });
    });

    // Delete resident with custom confirmation dialog (NO native confirm)
    container.querySelectorAll('.btn-delete-student').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const confirmed = await showConfirmDialog({
          title: "Remove Student Record",
          message: "Are you sure you want to delete this resident's profile? Any allocated bed in their room will be immediately released.",
          confirmText: "Delete Record",
          isDanger: true
        });

        if (confirmed) {
          store.deleteStudent(id);
          showToast('Resident profile deleted and bed freed.', 'info');
          render();
        }
      });
    });
  }

  render();
}

/**
 * Add Resident Modal
 */
function openAddResidentModal(onComplete) {
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';

  backdrop.innerHTML = `
    <div class="modal">
      <div class="modal__header">
        <h3 class="modal__title">Enroll Student Resident</h3>
        <button class="icon-btn btn-modal-close" aria-label="Close dialog">${getIcon('close')}</button>
      </div>
      <form id="form-enroll-resident">
        <div class="modal__body" style="display: flex; flex-direction: column; gap: 14px;">
          <div class="form-group">
            <label class="form-label" for="res-name">Full Name</label>
            <input type="text" class="form-input" id="res-name" placeholder="e.g. Rahul Sharma" required />
          </div>

          <div class="form-group">
            <label class="form-label" for="res-roll">Roll Number</label>
            <input type="text" class="form-input" id="res-roll" placeholder="e.g. 23BCSE199" required />
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div class="form-group">
              <label class="form-label" for="res-course">Course</label>
              <select class="form-select" id="res-course" required>
                <option value="B.Tech CS">B.Tech CS</option>
                <option value="B.Tech AI&DS">B.Tech AI&DS</option>
                <option value="B.Tech ECE">B.Tech ECE</option>
                <option value="B.Arch">B.Arch</option>
                <option value="BBA">BBA</option>
                <option value="B.Sc Data Science">B.Sc Data Science</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="res-year">Academic Year</label>
              <select class="form-select" id="res-year">
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="res-email">Email Address</label>
            <input type="email" class="form-input" id="res-email" placeholder="student@hostelhub.edu" required />
          </div>

          <div class="form-group">
            <label class="form-label" for="res-phone">Emergency Contact Phone</label>
            <input type="tel" class="form-input" id="res-phone" placeholder="+91 9876543210" required />
          </div>
        </div>
        <div class="modal__footer">
          <button type="button" class="btn btn--secondary btn-modal-close">Cancel</button>
          <button type="submit" class="btn btn--primary">Save Resident</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(backdrop);

  const cleanup = () => backdrop.remove();
  backdrop.querySelectorAll('.btn-modal-close').forEach(b => b.addEventListener('click', cleanup));

  backdrop.querySelector('#form-enroll-resident').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = backdrop.querySelector('#res-name').value.trim();
    const rollNo = backdrop.querySelector('#res-roll').value.trim();
    const course = backdrop.querySelector('#res-course').value;
    const year = backdrop.querySelector('#res-year').value;
    const email = backdrop.querySelector('#res-email').value.trim();
    const phone = backdrop.querySelector('#res-phone').value.trim();

    if (!name || !rollNo) return;

    store.createStudent({ name, rollNo, course, year, email, phone });
    showToast('Resident registered successfully.', 'success');
    cleanup();
    onComplete();
  });
}

/**
 * Resident Profile Drawer
 */
function openResidentDrawer(studentId, onComplete) {
  const state = store.getState();
  const student = state.students.find(s => s.id === studentId);
  if (!student) return;

  const room = state.rooms.find(r => r.id === student.roomId);
  const requests = state.serviceRequests.filter(r => r.studentId === student.id);

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';

  backdrop.innerHTML = `
    <div class="modal">
      <div class="modal__header">
        <h3 class="modal__title">Resident Details</h3>
        <button class="icon-btn btn-modal-close" aria-label="Close dialog">${getIcon('close')}</button>
      </div>
      <div class="modal__body" style="display: flex; flex-direction: column; gap: 16px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <img src="${student.avatar}" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover;" alt="${escapeHTML(student.name)}" />
          <div>
            <div style="font-size: var(--text-base); font-weight: 600;">${escapeHTML(student.name)}</div>
            <div style="font-size: var(--text-xs); color: var(--muted);">${escapeHTML(student.rollNo)} &bull; ${escapeHTML(student.course)} (Year ${student.year})</div>
            <div style="font-size: var(--text-xs); color: var(--muted);">${escapeHTML(student.email)} &bull; ${escapeHTML(student.phone)}</div>
          </div>
        </div>

        <div style="padding: 12px; background: var(--field); border-radius: var(--radius-sm); border: 1px solid var(--border);">
          <div style="font-size: var(--text-xs); font-weight: 600; text-transform: uppercase; color: var(--muted); margin-bottom: 4px;">Quarters Allocation</div>
          <div style="font-size: var(--text-sm);">
            ${room ? `Room ${room.block}-${room.number} (Floor ${room.floor}, ${room.type} Room)` : 'Currently unallocated'}
          </div>
        </div>

        <div>
          <div style="font-size: var(--text-xs); font-weight: 600; text-transform: uppercase; color: var(--muted); margin-bottom: 8px;">
            Service & Complaint History (${requests.length})
          </div>
          <div style="display: flex; flex-direction: column; gap: 6px; max-height: 180px; overflow-y: auto;">
            ${requests.length > 0 ? requests.map(r => `
              <div style="padding: 8px 10px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: var(--text-xs); display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-weight: 500;">${escapeHTML(r.title)}</div>
                  <div style="color: var(--muted); font-size: 11px;">${r.category} &bull; ${r.createdAt.split(' ')[0]}</div>
                </div>
                ${getBadge(r.status)}
              </div>
            `).join('') : `
              <div style="font-size: var(--text-xs); color: var(--muted);">No complaints or requests filed.</div>
            `}
          </div>
        </div>
      </div>
      <div class="modal__footer">
        <button class="btn btn--secondary btn-modal-close">Close</button>
      </div>
    </div>
  `;

  document.body.appendChild(backdrop);

  const cleanup = () => backdrop.remove();
  backdrop.querySelectorAll('.btn-modal-close').forEach(b => b.addEventListener('click', cleanup));
}
