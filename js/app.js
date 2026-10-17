import { store } from './store.js';
import { Router } from './router.js';
import { getIcon, showToast, escapeHTML } from './utils.js';

// Views
import { renderLoginView } from './views/loginView.js';
import { renderDashboardView } from './views/dashboardView.js';
import { renderRoomsView } from './views/roomsView.js';
import { renderMyRoomView } from './views/myRoomView.js';
import { renderHousekeepingView } from './views/housekeepingView.js';
import { renderMaintenanceView } from './views/maintenanceView.js';
import { renderServiceDeskView } from './views/serviceDeskView.js';
import { renderAmenitiesView } from './views/amenitiesView.js';
import { renderStudentsView } from './views/studentsView.js';
import { renderMessView } from './views/messView.js';
import { renderAnnouncementsView } from './views/announcementsView.js';
import { renderReportsView } from './views/reportsView.js';
import { renderSettingsView } from './views/settingsView.js';

// Map all defined routes
const routes = {
  '#/login': (container) => renderLoginView(container, router),
  '#/dashboard': (container) => renderDashboardView(container, router),
  '#/myroom': (container, params) => renderMyRoomView(container, router, params),
  '#/housekeeping': (container) => renderHousekeepingView(container, router),
  '#/maintenance': (container) => renderMaintenanceView(container, router),
  '#/servicedesk': (container) => renderServiceDeskView(container, router),
  '#/amenities': (container) => renderAmenitiesView(container, router),
  '#/rooms': (container) => renderRoomsView(container, router),
  '#/students': (container) => renderStudentsView(container, router),
  '#/mess': (container) => renderMessView(container, router),
  '#/announcements': (container) => renderAnnouncementsView(container, router),
  '#/reports': (container) => renderReportsView(container, router),
  '#/settings': (container) => renderSettingsView(container, router)
};

export const router = new Router(routes, '#/dashboard');

/**
 * Shell Controller: Controls Zen Slate Sidebar, Topbar, Maintenance Banner, Theme & Density
 */
class AppShell {
  constructor() {
    this.sidebarEl = document.getElementById('sidebar');
    this.topbarEl = document.getElementById('topbar');
    this.bannerEl = document.getElementById('maintenance-banner-container');
    this.bottomBarEl = document.getElementById('bottom-tab-bar');

    // Subscribe to store changes
    store.subscribe(() => {
      this.updateThemeAndDensity();
      this.renderMaintenanceBanner();
      this.renderSidebar();
      this.renderTopbar();
      this.renderBottomBar();
    });

    // Listen to OS theme changes if 'system' theme is chosen
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (store.getState().settings.theme === 'system') {
          this.updateThemeAndDensity();
        }
      });
    }

    // Initial render
    this.updateThemeAndDensity();
    this.renderMaintenanceBanner();
    this.renderSidebar();
    this.renderTopbar();
    this.renderBottomBar();

    // After route updates
    router.afterEach((path) => {
      this.updateActiveNav(path);
      this.updateBreadcrumbs(path);
      // Close mobile drawer on route navigate
      if (this.sidebarEl) {
        this.sidebarEl.classList.remove('open');
      }
    });
  }

  updateThemeAndDensity() {
    const state = store.getState();
    const theme = state.settings.theme;
    if (theme === 'system') {
      const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }

    // Density
    const density = state.settings.density || (state.settings.activeRole === 'admin' ? 'compact' : 'comfortable');
    document.documentElement.setAttribute('data-density', density);
  }

  renderMaintenanceBanner() {
    const state = store.getState();
    if (!this.bannerEl) return;

    if (state.settings.maintenanceMode) {
      this.bannerEl.innerHTML = `
        <div class="maintenance-banner">
          ${getIcon('alertTriangle')}
          <span>${escapeHTML(state.settings.maintenanceBannerText)}</span>
        </div>
      `;
      this.bannerEl.style.display = 'block';
    } else {
      this.bannerEl.innerHTML = '';
      this.bannerEl.style.display = 'none';
    }
  }

  renderSidebar() {
    if (!this.sidebarEl) return;
    const state = store.getState();
    const isAdmin = state.settings.activeRole === 'admin';
    const currentStudent = state.students.find(s => s.id === state.settings.currentStudentId) || state.students[0];
    const currentHash = window.location.hash || '#/dashboard';

    // On login screen, hide sidebar & topbar
    if (currentHash === '#/login') {
      this.sidebarEl.style.display = 'none';
      if (this.topbarEl) this.topbarEl.style.display = 'none';
      const main = document.querySelector('.main-wrapper');
      if (main) main.style.marginLeft = '0';
      return;
    } else {
      this.sidebarEl.style.display = 'flex';
      if (this.topbarEl) this.topbarEl.style.display = 'flex';
      const main = document.querySelector('.main-wrapper');
      if (main && window.innerWidth >= 1200) {
        main.style.marginLeft = 'var(--sidebar-w)';
      }
    }

    // Role-tailored navigation items per design specification
    const navItems = isAdmin ? [
      { section: 'Operations' },
      { label: 'Overview', path: '#/dashboard', icon: 'dashboard' },
      { label: 'Residents & Rooms', path: '#/rooms', icon: 'rooms' },
      { label: 'Student Directory', path: '#/students', icon: 'students' },
      { section: 'Services & Facilities' },
      { label: 'Housekeeping Roster', path: '#/housekeeping', icon: 'housekeeping' },
      { label: 'Maintenance', path: '#/maintenance', icon: 'maintenance' },
      { label: 'Service Requests', path: '#/servicedesk', icon: 'servicedesk' },
      { label: 'Amenities & Facilities', path: '#/amenities', icon: 'amenities' },
      { section: 'Campus Life' },
      { label: 'Mess Management', path: '#/mess', icon: 'mess' },
      { label: 'Announcements', path: '#/announcements', icon: 'announcements' },
      { section: 'Audits' },
      { label: 'Reports', path: '#/reports', icon: 'reports' },
      { label: 'Settings', path: '#/settings', icon: 'settings' }
    ] : [
      { section: 'Residence' },
      { label: 'Overview', path: '#/dashboard', icon: 'dashboard' },
      { label: 'My Room', path: '#/myroom', icon: 'myroom' },
      { section: 'Services' },
      { label: 'Housekeeping', path: '#/housekeeping', icon: 'housekeeping' },
      { label: 'Maintenance', path: '#/maintenance', icon: 'maintenance' },
      { label: 'Service Requests', path: '#/servicedesk', icon: 'servicedesk' },
      { label: 'Amenities', path: '#/amenities', icon: 'amenities' },
      { section: 'Campus Life' },
      { label: 'Mess & Dining', path: '#/mess', icon: 'mess' },
      { label: 'Announcements', path: '#/announcements', icon: 'announcements' },
      { section: 'Account' },
      { label: 'Settings', path: '#/settings', icon: 'settings' }
    ];

    this.sidebarEl.innerHTML = `
      <div class="sidebar__header">
        <a href="#/dashboard" class="sidebar__logo-link">
          <div class="sidebar__logo-mark">
            ${getIcon('logo')}
          </div>
          <span>HostelHub</span>
        </a>
        <span class="sidebar__role-tag">${isAdmin ? 'Warden' : 'Student'}</span>
      </div>

      <nav class="sidebar__nav" id="sidebar-nav">
        ${navItems.map(item => {
          if (item.section) {
            return `<div class="sidebar__section-title">${item.section}</div>`;
          }
          const isActive = currentHash.startsWith(item.path);
          return `
            <a href="${item.path}" class="nav-item ${isActive ? 'active' : ''}" data-path="${item.path}">
              ${getIcon(item.icon)}
              <span>${item.label}</span>
            </a>
          `;
        }).join('')}
      </nav>

      <div class="sidebar__footer">
        <div class="sidebar__profile-block">
          <div class="sidebar__profile-info">
            <img class="sidebar__profile-avatar" src="${isAdmin ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80' : currentStudent.avatar}" alt="Avatar" />
            <div class="sidebar__profile-text">
              <div class="sidebar__profile-name">${isAdmin ? 'Warden Office' : escapeHTML(currentStudent.name)}</div>
              <div class="sidebar__profile-role">${isAdmin ? 'Administration' : `Room ${currentStudent.roomId ? currentStudent.roomId.replace('room-', '') : 'Unassigned'}`}</div>
            </div>
          </div>
          <button class="icon-btn" id="btn-sidebar-role-switch" title="Switch role to ${isAdmin ? 'Student' : 'Warden'}" style="width: 26px; height: 26px;">
            ${getIcon('refresh', 'icon-sm')}
          </button>
        </div>
      </div>
    `;

    // Role switcher shortcut
    this.sidebarEl.querySelector('#btn-sidebar-role-switch')?.addEventListener('click', () => {
      const nextRole = isAdmin ? 'student' : 'admin';
      store.setRole(nextRole);
      showToast(`Switched active session to ${nextRole === 'admin' ? 'Warden' : 'Student'}.`, 'info');
      router.navigate('#/dashboard');
    });
  }

  renderTopbar() {
    if (!this.topbarEl) return;
    const state = store.getState();
    const isAdmin = state.settings.activeRole === 'admin';
    const currentStudent = state.students.find(s => s.id === state.settings.currentStudentId) || state.students[0];
    const currentHash = window.location.hash || '#/dashboard';

    if (currentHash === '#/login') {
      this.topbarEl.style.display = 'none';
      return;
    } else {
      this.topbarEl.style.display = 'flex';
    }

    const unreadCount = !isAdmin 
      ? state.announcements.filter(a => !a.readBy.includes(currentStudent.id)).length
      : state.serviceRequests.filter(r => r.status === 'pending').length;

    this.topbarEl.innerHTML = `
      <div class="topbar__left">
        <button class="icon-btn" id="btn-toggle-mobile-sidebar" aria-label="Toggle navigation drawer" style="display: none;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><line x1="3" x2="21" y1="6" y2="6"/><line x1="3" x2="21" y1="12" y2="12"/><line x1="3" x2="21" y1="18" y2="18"/></svg>
        </button>
        <div class="topbar__breadcrumb" id="topbar-breadcrumbs">
          <span>HostelHub</span>
          <span class="topbar__breadcrumb-sep">/</span>
          <span class="topbar__breadcrumb-active" id="current-page-label">Overview</span>
        </div>
      </div>

      <div class="topbar__right">
        <!-- Quick Theme Toggle -->
        <button class="icon-btn" id="btn-quick-theme" title="Toggle color theme" aria-label="Toggle color theme">
          ${getIcon(state.settings.theme === 'dark' ? 'sun' : 'moon')}
        </button>

        <!-- Notification Trigger -->
        <button class="icon-btn" id="btn-topbar-bell" title="${unreadCount} Notifications" aria-label="${unreadCount} Notifications">
          ${getIcon('bell')}
          ${unreadCount > 0 ? `<span class="notification-dot"></span>` : ''}
        </button>

        <!-- Compact User Pill -->
        <a href="#/settings" class="btn btn--tertiary btn--sm" style="display: flex; align-items: center; gap: 8px; padding: 2px 8px; font-size: var(--text-xs); color: var(--ink);">
          <img src="${isAdmin ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80' : currentStudent.avatar}" style="width: 22px; height: 22px; border-radius: 50%; object-fit: cover;" alt="User" />
          <span>${isAdmin ? 'Warden' : escapeHTML(currentStudent.name.split(' ')[0])}</span>
        </a>
      </div>
    `;

    // Mobile Hamburger
    const mobileBtn = this.topbarEl.querySelector('#btn-toggle-mobile-sidebar');
    if (mobileBtn) {
      if (window.innerWidth < 768) {
        mobileBtn.style.display = 'inline-flex';
      }
      mobileBtn.addEventListener('click', () => {
        this.sidebarEl.classList.toggle('open');
      });
    }

    // Theme toggle
    this.topbarEl.querySelector('#btn-quick-theme')?.addEventListener('click', () => {
      const nextTheme = state.settings.theme === 'dark' ? 'light' : 'dark';
      store.setTheme(nextTheme);
      showToast(`Theme switched to ${nextTheme}.`, 'info');
    });

    // Bell click
    this.topbarEl.querySelector('#btn-topbar-bell')?.addEventListener('click', () => {
      router.navigate(isAdmin ? '#/servicedesk' : '#/announcements');
    });
  }

  renderBottomBar() {
    if (!this.bottomBarEl) return;
    const state = store.getState();
    const isAdmin = state.settings.activeRole === 'admin';
    const currentHash = window.location.hash || '#/dashboard';

    if (currentHash === '#/login') {
      this.bottomBarEl.style.display = 'none';
      return;
    }

    const items = isAdmin ? [
      { label: 'Overview', path: '#/dashboard', icon: 'dashboard' },
      { label: 'Rooms', path: '#/rooms', icon: 'rooms' },
      { label: 'Tickets', path: '#/servicedesk', icon: 'servicedesk' },
      { label: 'Mess', path: '#/mess', icon: 'mess' },
      { label: 'Settings', path: '#/settings', icon: 'settings' }
    ] : [
      { label: 'Overview', path: '#/dashboard', icon: 'dashboard' },
      { label: 'My Room', path: '#/myroom', icon: 'myroom' },
      { label: 'Housekeeping', path: '#/housekeeping', icon: 'housekeeping' },
      { label: 'Amenities', path: '#/amenities', icon: 'amenities' },
      { label: 'Settings', path: '#/settings', icon: 'settings' }
    ];

    this.bottomBarEl.innerHTML = items.map(item => `
      <a href="${item.path}" class="bottom-tab-item ${currentHash.startsWith(item.path) ? 'active' : ''}">
        ${getIcon(item.icon)}
        <span>${item.label}</span>
      </a>
    `).join('');
  }

  updateActiveNav(path) {
    document.querySelectorAll('.nav-item').forEach(el => {
      const p = el.getAttribute('data-path');
      if (path.startsWith(p)) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    document.querySelectorAll('.bottom-tab-item').forEach(el => {
      const href = el.getAttribute('href');
      if (path.startsWith(href)) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });
  }

  updateBreadcrumbs(path) {
    const labelEl = document.getElementById('current-page-label');
    if (!labelEl) return;

    const map = {
      '#/login': 'Entrance Portal',
      '#/dashboard': 'Overview',
      '#/myroom': 'My Room Quarters',
      '#/housekeeping': 'Housekeeping Roster',
      '#/maintenance': 'Maintenance & Repairs',
      '#/servicedesk': 'Service Desk',
      '#/amenities': 'Campus Amenities',
      '#/rooms': 'Floor Map & Allocation',
      '#/students': 'Resident Directory',
      '#/mess': 'Mess & Dining Hall',
      '#/announcements': 'Campus Bulletins',
      '#/reports': 'Operational Reports',
      '#/settings': 'System Settings'
    };

    labelEl.textContent = map[path] || 'Overview';
  }
}

// Global dismiss for mobile drawer when clicking content area
document.addEventListener('click', (e) => {
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('btn-toggle-mobile-sidebar');
  if (sidebar && sidebar.classList.contains('open') && window.innerWidth < 768) {
    if (!sidebar.contains(e.target) && !toggleBtn?.contains(e.target)) {
      sidebar.classList.remove('open');
    }
  }
});

// Bootstrap application on load
window.addEventListener('DOMContentLoaded', () => {
  new AppShell();
});
