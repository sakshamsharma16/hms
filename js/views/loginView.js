import { store } from '../store.js';
import { getIcon, showToast, escapeHTML, getFloorPlanMotif, getBlockFloorGrid, getBadge } from '../utils.js';

export function renderLoginView(container, router) {
  const state = store.getState();

  container.innerHTML = `
    <div style="min-height: calc(100vh - 80px); display: flex; align-items: center; justify-content: center; padding: 24px;">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 48px; max-width: 960px; width: 100%; align-items: center;">
        
        <!-- Left: Authentication & Role Selection -->
        <div style="display: flex; flex-direction: column; gap: 24px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
              <div style="width: 24px; height: 24px; border-radius: var(--radius-sm); background: var(--accent-solid); color: #FFFFFF; display: flex; align-items: center; justify-content: center;">
                ${getIcon('logo')}
              </div>
              <span style="font-size: var(--text-sm); font-weight: 600; letter-spacing: -0.02em;">HostelHub</span>
            </div>
            <h1 style="font-size: var(--text-3xl); font-weight: 600; line-height: var(--leading-tight); color: var(--ink);">
              Campus Residence &amp; Facility Operations
            </h1>
            <p style="font-size: var(--text-sm); color: var(--muted); margin-top: 8px; line-height: var(--leading-body);">
              Pure bed allocations, daily housekeeping rosters, facility reservations, and real-time catering schedules.
            </p>
          </div>

          <!-- Role Selector -->
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <label class="form-label" style="font-size: var(--text-xs); text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted);">
              Select Session Mode
            </label>

            <!-- Student Card -->
            <div class="card btn-select-role" data-role="student" style="padding: 14px 16px; cursor: pointer; border-color: ${state.settings.activeRole === 'student' ? 'var(--accent)' : 'var(--border)'}; background: ${state.settings.activeRole === 'student' ? 'var(--accent-soft)' : 'var(--surface)'};">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--field); display: flex; align-items: center; justify-content: center; color: var(--ink);">
                    ${getIcon('user')}
                  </div>
                  <div>
                    <div style="font-size: var(--text-sm); font-weight: 600; color: var(--ink);">Resident Student</div>
                    <div style="font-size: var(--text-xs); color: var(--muted);">Aarav Sharma &bull; Block B, Room 201</div>
                  </div>
                </div>
                ${state.settings.activeRole === 'student' ? getBadge('accent', 'Selected') : ''}
              </div>
            </div>

            <!-- Warden Card -->
            <div class="card btn-select-role" data-role="admin" style="padding: 14px 16px; cursor: pointer; border-color: ${state.settings.activeRole === 'admin' ? 'var(--accent)' : 'var(--border)'}; background: ${state.settings.activeRole === 'admin' ? 'var(--accent-soft)' : 'var(--surface)'};">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--field); display: flex; align-items: center; justify-content: center; color: var(--ink);">
                    ${getIcon('dashboard')}
                  </div>
                  <div>
                    <div style="font-size: var(--text-sm); font-weight: 600; color: var(--ink);">Hostel Warden &amp; Staff</div>
                    <div style="font-size: var(--text-xs); color: var(--muted);">Administration &bull; All 4 Blocks</div>
                  </div>
                </div>
                ${state.settings.activeRole === 'admin' ? getBadge('accent', 'Selected') : ''}
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div style="display: flex; gap: 10px; margin-top: 6px;">
            <button id="btn-enter-portal" class="btn btn--primary" style="flex: 1; height: 42px;">
              <span>Enter Portal</span>
              ${getIcon('chevronRight', 'icon-sm')}
            </button>
            <button id="btn-demo-reset-login" class="btn btn--secondary" title="Reset all demo records" style="height: 42px;">
              ${getIcon('refresh')}
              <span>Reset Data</span>
            </button>
          </div>
        </div>

        <!-- Right: Restrained Architectural Line Illustration & Room Preview -->
        <div class="card" style="padding: 28px; display: flex; flex-direction: column; gap: 20px; background: var(--surface);">
          <div style="display: flex; align-items: baseline; justify-content: space-between; border-bottom: 1px solid var(--border); padding-bottom: 12px;">
            <div style="font-size: var(--text-xs); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted);">
              Architectural Standard
            </div>
            ${getBadge('success', 'Verified Spec')}
          </div>

          <!-- Floor-Plan Line Motif Display -->
          <div style="display: flex; justify-content: center; padding: 12px 0;">
            ${getFloorPlanMotif('floor-plan-motif')}
          </div>

          <!-- Room Device Preview -->
          <div style="padding: 16px; background: var(--field); border-radius: var(--radius-md); border: 1px solid var(--border);">
            <div style="display: flex; justify-content: space-between; align-items: baseline;">
              <span style="font-size: var(--text-xs); color: var(--muted);">Standard Double Quarters</span>
              <span style="font-size: var(--text-xs); font-weight: 600;">2/2 Beds Filled</span>
            </div>
            <div style="font-size: 36px; font-weight: 600; letter-spacing: var(--tracking-hero); color: var(--ink); font-variant-numeric: tabular-nums; margin-top: 4px;">
              B-201
            </div>
            <div style="font-size: var(--text-xs); color: var(--muted); margin-top: 2px;">
              Block B &bull; Floor 2 &bull; East Wing Campus Quadrangle
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; font-size: var(--text-xs); color: var(--muted); padding-top: 8px;">
            <span>60 Rooms &bull; 4 Blocks</span>
            <span>No payment / Pure allocation</span>
          </div>
        </div>

      </div>
    </div>
  `;

  // Select Student Role
  container.querySelectorAll('.btn-select-role').forEach(card => {
    card.addEventListener('click', () => {
      const role = card.getAttribute('data-role');
      store.setRole(role);
      showToast(`Selected ${role === 'admin' ? 'Warden' : 'Resident Student'} mode.`, 'info');
      renderLoginView(container, router);
    });
  });

  // Enter Portal
  container.querySelector('#btn-enter-portal')?.addEventListener('click', () => {
    router.navigate('#/dashboard');
  });

  // Reset Demo Data
  container.querySelector('#btn-demo-reset-login')?.addEventListener('click', () => {
    store.reset();
    showToast('Demo environment reset to initial seeds.', 'success');
    renderLoginView(container, router);
  });
}
