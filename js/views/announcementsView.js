import { store } from '../store.js';
import { getIcon, showToast, escapeHTML, formatDate, getBadge, showConfirmDialog } from '../utils.js';

export function renderAnnouncementsView(container, router) {
  let selectedCategory = 'all';

  function render() {
    const state = store.getState();
    const isAdmin = state.settings.activeRole === 'admin';
    const currentStudentId = state.settings.currentStudentId;

    const categories = ['all', 'General', 'Events', 'Maintenance', 'Dining', 'Facilities'];

    // Filter
    const filtered = state.announcements.filter(a => {
      return selectedCategory === 'all' ? true : a.category.toLowerCase() === selectedCategory.toLowerCase();
    });

    // Pinned first, then by date descending
    const sorted = [...filtered].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: var(--section-gap);">
        
        <!-- Header -->
        <div style="display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 8px;">
          <div>
            <h1 style="font-size: var(--text-2xl); font-weight: 600;">Campus Bulletins & Notices</h1>
            <p style="font-size: var(--text-sm); color: var(--muted); margin-top: 2px;">
              Stay informed on facility upgrades, campus events, and administrative directives.
            </p>
          </div>
          ${isAdmin ? `
            <div>
              <button class="btn btn--primary" id="btn-create-bulletin">
                ${getIcon('plus')}
                <span>Publish Bulletin</span>
              </button>
            </div>
          ` : ''}
        </div>

        <!-- Category Tabs -->
        <div style="display: flex; gap: 6px; overflow-x: auto; padding-bottom: 4px; border-bottom: 1px solid var(--border);">
          ${categories.map(c => `
            <button class="btn ${selectedCategory === c ? 'btn--secondary' : 'btn--tertiary'} btn--sm tab-cat-btn" data-cat="${c}" style="${selectedCategory === c ? 'background: var(--surface-hover); font-weight: 600;' : ''}">
              ${c === 'all' ? 'All Bulletins' : c}
            </button>
          `).join('')}
        </div>

        <!-- Stream of Bulletins -->
        <div style="display: flex; flex-direction: column; gap: 14px;">
          ${sorted.length > 0 ? sorted.map(ann => {
            const isRead = !isAdmin ? ann.readBy.includes(currentStudentId) : true;
            return `
              <div class="card" style="padding: 20px 24px;">
                <div style="display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 8px; margin-bottom: 8px;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    ${ann.pinned ? getBadge('accent', 'Pinned') : ''}
                    <span style="font-size: var(--text-xs); font-weight: 600; text-transform: uppercase; color: var(--muted);">${escapeHTML(ann.category)}</span>
                    ${!isRead ? `<span style="width: 6px; height: 6px; border-radius: 50%; background: var(--accent); display: inline-block;" title="Unread notice"></span>` : ''}
                  </div>
                  <div style="display: flex; align-items: center; gap: 10px; font-size: var(--text-xs); color: var(--muted);">
                    <span>${formatDate(ann.createdAt)}</span>
                    ${isAdmin ? `
                      <button class="btn btn--tertiary btn--sm btn-delete-bulletin" data-id="${ann.id}" style="color: var(--danger); padding: 0 4px;">
                        ${getIcon('trash')}
                      </button>
                    ` : `
                      ${!isRead ? `
                        <button class="btn btn--tertiary btn--sm btn-mark-read" data-id="${ann.id}" style="color: var(--accent); padding: 0 4px;">
                          Mark as read
                        </button>
                      ` : ''}
                    `}
                  </div>
                </div>

                <h3 style="font-size: var(--text-base); font-weight: 600; color: var(--ink); margin-bottom: 6px;">
                  ${escapeHTML(ann.title)}
                </h3>

                <p style="font-size: var(--text-sm); color: var(--ink-secondary); line-height: var(--leading-body); margin: 0;">
                  ${escapeHTML(ann.body)}
                </p>
              </div>
            `;
          }).join('') : `
            <div class="card">
              <div class="empty-state">
                <div class="empty-state__title">No Bulletins Found</div>
                <div class="empty-state__text">There are currently no announcements in this category.</div>
              </div>
            </div>
          `}
        </div>

      </div>
    `;

    // Category click
    container.querySelectorAll('.tab-cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedCategory = btn.getAttribute('data-cat');
        render();
      });
    });

    // Student Mark Read
    container.querySelectorAll('.btn-mark-read').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        store.markAnnouncementRead(id, currentStudentId);
        showToast('Marked as read.', 'info');
        render();
      });
    });

    // Warden Delete with custom in-app confirm dialog (NO native confirm)
    container.querySelectorAll('.btn-delete-bulletin').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const confirmed = await showConfirmDialog({
          title: "Delete Announcement",
          message: "Are you sure you want to delete this bulletin? It will be removed from all student feeds.",
          confirmText: "Delete Bulletin",
          isDanger: true
        });

        if (confirmed) {
          store.deleteAnnouncement(id);
          showToast('Announcement removed.', 'info');
          render();
        }
      });
    });

    // Warden Create Bulletin
    container.querySelector('#btn-create-bulletin')?.addEventListener('click', () => {
      openCreateBulletinModal(() => render());
    });
  }

  render();
}

/**
 * Warden Create Bulletin Modal
 */
function openCreateBulletinModal(onComplete) {
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';

  backdrop.innerHTML = `
    <div class="modal">
      <div class="modal__header">
        <h3 class="modal__title">Publish Campus Bulletin</h3>
        <button class="icon-btn btn-modal-close" aria-label="Close dialog">${getIcon('close')}</button>
      </div>
      <form id="form-publish-bulletin">
        <div class="modal__body" style="display: flex; flex-direction: column; gap: 14px;">
          <div class="form-group">
            <label class="form-label" for="bulletin-cat">Category</label>
            <select class="form-select" id="bulletin-cat" required>
              <option value="General">General Notice</option>
              <option value="Events">Campus Events</option>
              <option value="Maintenance">Scheduled Maintenance</option>
              <option value="Dining">Dining & Mess</option>
              <option value="Facilities">Sports & Facilities</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="bulletin-title">Headline</label>
            <input type="text" class="form-input" id="bulletin-title" placeholder="e.g. Wi-Fi Core Router Upgrades Tonight" required />
          </div>

          <div class="form-group">
            <label class="form-label" for="bulletin-body">Content Body</label>
            <textarea class="form-textarea" id="bulletin-body" style="min-height: 120px;" placeholder="Full details of the notice..." required></textarea>
          </div>

          <div style="display: flex; align-items: center; gap: 8px;">
            <input type="checkbox" id="bulletin-pin" style="cursor: pointer;" />
            <label for="bulletin-pin" style="font-size: var(--text-sm); color: var(--ink); cursor: pointer; user-select: none;">
              Pin bulletin to top of feed
            </label>
          </div>
        </div>
        <div class="modal__footer">
          <button type="button" class="btn btn--secondary btn-modal-close">Cancel</button>
          <button type="submit" class="btn btn--primary">Publish Notice</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(backdrop);

  const cleanup = () => backdrop.remove();
  backdrop.querySelectorAll('.btn-modal-close').forEach(b => b.addEventListener('click', cleanup));

  backdrop.querySelector('#form-publish-bulletin').addEventListener('submit', (e) => {
    e.preventDefault();
    const cat = backdrop.querySelector('#bulletin-cat').value;
    const title = backdrop.querySelector('#bulletin-title').value.trim();
    const body = backdrop.querySelector('#bulletin-body').value.trim();
    const pinned = backdrop.querySelector('#bulletin-pin').checked;

    if (!title || !body) return;

    store.createAnnouncement({ category: cat, title, body, pinned });
    showToast('Bulletin published successfully.', 'success');
    cleanup();
    onComplete();
  });
}
