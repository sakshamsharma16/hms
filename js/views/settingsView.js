import { store } from '../store.js';
import { getIcon, showToast, escapeHTML, showConfirmDialog } from '../utils.js';

export function renderSettingsView(container, router) {
  function render() {
    const state = store.getState();
    const currentTheme = state.settings.theme; // 'light' | 'dark' | 'system'
    const currentDensity = state.settings.density || 'comfortable';
    const isMaintenance = state.settings.maintenanceMode;

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: var(--section-gap); max-width: 760px;">
        
        <!-- Header -->
        <div>
          <h1 style="font-size: var(--text-2xl); font-weight: 600;">System Settings & Preferences</h1>
          <p style="font-size: var(--text-sm); color: var(--muted); margin-top: 2px;">
            Configure interface appearance, density modes, campus broadcast notices, and test account sessions.
          </p>
        </div>

        <!-- 1. Appearance & Theme -->
        <div class="card">
          <div class="card__header">
            <div>
              <h3 class="card__title">Interface Appearance & Theme</h3>
              <p class="card__subtitle">Choose between clean Light Slate, deep Slate-950 Dark mode, or System</p>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 16px;">
            <div>
              <label class="form-label">Color Theme</label>
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 6px;">
                <button class="btn ${currentTheme === 'light' ? 'btn--secondary' : 'btn--tertiary'} btn-theme-opt" data-theme="light" style="${currentTheme === 'light' ? 'border-color: var(--accent); font-weight: 600;' : ''}">
                  ${getIcon('sun')}
                  <span>Light Slate</span>
                </button>
                <button class="btn ${currentTheme === 'dark' ? 'btn--secondary' : 'btn--tertiary'} btn-theme-opt" data-theme="dark" style="${currentTheme === 'dark' ? 'border-color: var(--accent); font-weight: 600;' : ''}">
                  ${getIcon('moon')}
                  <span>Dark Slate</span>
                </button>
                <button class="btn ${currentTheme === 'system' ? 'btn--secondary' : 'btn--tertiary'} btn-theme-opt" data-theme="system" style="${currentTheme === 'system' ? 'border-color: var(--accent); font-weight: 600;' : ''}">
                  ${getIcon('settings')}
                  <span>System Auto</span>
                </button>
              </div>
            </div>

            <!-- Density Toggle -->
            <div style="border-top: 1px solid var(--border); padding-top: 14px;">
              <label class="form-label">Information Density</label>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 6px;">
                <button class="btn ${currentDensity === 'comfortable' ? 'btn--secondary' : 'btn--tertiary'} btn-density-opt" data-density="comfortable" style="${currentDensity === 'comfortable' ? 'border-color: var(--accent); font-weight: 600;' : ''}">
                  <span>Comfortable (Airy, Student Default)</span>
                </button>
                <button class="btn ${currentDensity === 'compact' ? 'btn--secondary' : 'btn--tertiary'} btn-density-opt" data-density="compact" style="${currentDensity === 'compact' ? 'border-color: var(--accent); font-weight: 600;' : ''}">
                  <span>Compact (Information-Dense, Warden)</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. Site-Wide Campus Notice Banner -->
        <div class="card">
          <div class="card__header">
            <div>
              <h3 class="card__title">Campus Maintenance Broadcast</h3>
              <p class="card__subtitle">Publish an operational alert banner across all resident and staff interfaces</p>
            </div>
            <span style="font-size: var(--text-xs); font-weight: 600; color: ${isMaintenance ? 'var(--warning)' : 'var(--muted)'};">
              ${isMaintenance ? '● BROADCAST ACTIVE' : 'DISABLED'}
            </span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div class="form-group" style="margin: 0;">
              <label class="form-label" for="txt-maint-banner">Notice Banner Text</label>
              <input type="text" class="form-input" id="txt-maint-banner" value="${escapeHTML(state.settings.maintenanceBannerText)}" />
            </div>

            <div style="display: flex; justify-content: flex-end;">
              <button class="btn ${isMaintenance ? 'btn--secondary' : 'btn--primary'} btn--sm" id="btn-toggle-maint-broadcast">
                ${isMaintenance ? 'Disable Banner' : 'Activate Broadcast'}
              </button>
            </div>
          </div>
        </div>

        <!-- 3. Active Role & Session Switcher -->
        <div class="card">
          <div class="card__header">
            <div>
              <h3 class="card__title">Active Session & Role</h3>
              <p class="card__subtitle">Switch test user role between Resident Student and Warden Office</p>
            </div>
          </div>

          <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px;">
            <div>
              <div style="font-size: var(--text-sm); font-weight: 600;">
                Current Role: <span style="color: var(--accent);">${state.settings.activeRole === 'admin' ? 'Warden Office / Administration' : 'Resident Student (Aarav Sharma)'}</span>
              </div>
              <div style="font-size: var(--text-xs); color: var(--muted); margin-top: 2px;">
                Changes navigation menu structure, permissions, and overview layout.
              </div>
            </div>

            <div style="display: flex; gap: 8px;">
              <button class="btn ${state.settings.activeRole === 'student' ? 'btn--secondary' : 'btn--tertiary'} btn--sm btn-switch-session" data-role="student" style="${state.settings.activeRole === 'student' ? 'border-color: var(--accent); font-weight: 600;' : ''}">
                Resident Student
              </button>
              <button class="btn ${state.settings.activeRole === 'admin' ? 'btn--secondary' : 'btn--tertiary'} btn--sm btn-switch-session" data-role="admin" style="${state.settings.activeRole === 'admin' ? 'border-color: var(--accent); font-weight: 600;' : ''}">
                Warden Desk
              </button>
            </div>
          </div>
        </div>

        <!-- 4. Reset Demo Data (With Accessible Confirmation Dialog) -->
        <div class="card" style="border-color: rgba(239, 68, 68, 0.25);">
          <div class="card__header">
            <div>
              <h3 class="card__title" style="color: var(--danger);">Reset Demo Environment</h3>
              <p class="card__subtitle">Restore all 40 student records, 60 rooms, weekly mess menu, and facilities to original seeds</p>
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end;">
            <button class="btn btn--danger btn--sm" id="btn-reset-demo-data">
              ${getIcon('refresh')}
              <span>Reset All Demo Data</span>
            </button>
          </div>
        </div>

      </div>
    `;

    // Theme selector
    container.querySelectorAll('.btn-theme-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        const theme = btn.getAttribute('data-theme');
        store.setTheme(theme);
        applyTheme(theme);
        showToast(`Theme updated to ${theme}.`, 'info');
        render();
      });
    });

    // Density selector
    container.querySelectorAll('.btn-density-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        const density = btn.getAttribute('data-density');
        store.setDensity(density);
        document.documentElement.setAttribute('data-density', density);
        showToast(`Density set to ${density}.`, 'info');
        render();
      });
    });

    // Maintenance toggle
    container.querySelector('#btn-toggle-maint-broadcast')?.addEventListener('click', () => {
      const bannerText = container.querySelector('#txt-maint-banner').value;
      store.toggleMaintenanceMode(bannerText);
      showToast('Maintenance banner updated.', 'info');
      render();
    });

    // Role switcher
    container.querySelectorAll('.btn-switch-session').forEach(btn => {
      btn.addEventListener('click', () => {
        const role = btn.getAttribute('data-role');
        store.setRole(role);
        showToast(`Switched to ${role === 'admin' ? 'Warden Office' : 'Resident Student'}.`, 'success');
        router.navigate('#/dashboard');
      });
    });

    // Reset Demo Data with Custom Confirmation Dialog (NO native window.confirm)
    container.querySelector('#btn-reset-demo-data')?.addEventListener('click', async () => {
      const confirmed = await showConfirmDialog({
        title: "Reset All Demo Data?",
        message: "This will completely restore all 40 student profiles, 60 rooms, housekeeping logs, and facilities to original seed state. Any custom bookings will be reset.",
        confirmText: "Yes, Reset Demo Data",
        isDanger: true
      });

      if (confirmed) {
        store.reset();
        showToast('Demo records reset to default seeds.', 'success');
        render();
      }
    });
  }

  render();
}

function applyTheme(theme) {
  if (theme === 'system') {
    const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  } else {
    document.documentElement.setAttribute('data-theme', theme);
  }
}
