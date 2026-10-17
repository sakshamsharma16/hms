// Safe HTML escaping utility to prevent XSS
export function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Format relative date/time
export function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr.replace(' ', 'T'));
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return dateStr;
  }
}

// Format short date only
export function formatShortDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr.replace(' ', 'T'));
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    return dateStr;
  }
}

// Animated count-up numbers for KPI metrics
export function animateCountUp(element, target, duration = 600, suffix = '') {
  if (!element) return;
  const start = 0;
  const startTime = performance.now();
  const numTarget = parseFloat(target) || 0;

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(start + (numTarget - start) * ease);

    element.textContent = `${current}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = `${target}${suffix}`;
    }
  }

  requestAnimationFrame(update);
}

// Current Meal Calculator based on Clock (returns meal name & status)
export function getCurrentMealInfo() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const timeVal = hours * 60 + minutes;

  if (timeVal >= 450 && timeVal <= 570) {
    return { current: "breakfast", label: "Breakfast", status: "now_serving", next: "Lunch at 12:30 PM", time: "07:30 - 09:30" };
  } else if (timeVal > 570 && timeVal < 750) {
    return { current: "lunch", label: "Lunch", status: "upcoming", next: "Lunch at 12:30 PM", time: "12:30 - 14:30" };
  } else if (timeVal >= 750 && timeVal <= 870) {
    return { current: "lunch", label: "Lunch", status: "now_serving", next: "Snacks at 16:30", time: "12:30 - 14:30" };
  } else if (timeVal > 870 && timeVal < 990) {
    return { current: "snacks", label: "Evening Snacks", status: "upcoming", next: "Snacks at 16:30", time: "16:30 - 18:00" };
  } else if (timeVal >= 990 && timeVal <= 1080) {
    return { current: "snacks", label: "Evening Snacks", status: "now_serving", next: "Dinner at 19:30", time: "16:30 - 18:00" };
  } else if (timeVal > 1080 && timeVal < 1170) {
    return { current: "dinner", label: "Dinner", status: "upcoming", next: "Dinner at 19:30", time: "19:30 - 21:30" };
  } else if (timeVal >= 1170 && timeVal <= 1290) {
    return { current: "dinner", label: "Dinner", status: "now_serving", next: "Breakfast tomorrow at 07:30", time: "19:30 - 21:30" };
  } else {
    return { current: "breakfast", label: "Breakfast", status: "upcoming", next: "Breakfast at 07:30", time: "07:30 - 09:30" };
  }
}

// Consistent Status Badge Generator (Dot + Text, Never color alone)
export function getBadge(status, customLabel = null) {
  const norm = (status || '').toLowerCase().trim();
  let badgeClass = 'neutral';
  let label = customLabel || status || 'Unknown';

  if (['available', 'resolved', 'completed', 'active', 'open', 'confirmed'].includes(norm)) {
    badgeClass = 'success';
  } else if (['pending', 'in-progress', 'assigned', 'upcoming', 'due'].includes(norm)) {
    badgeClass = norm === 'pending' || norm === 'due' ? 'warning' : 'accent';
  } else if (['full', 'urgent', 'danger', 'overdue', 'maintenance', 'cancelled'].includes(norm)) {
    badgeClass = norm === 'maintenance' ? 'neutral' : 'danger';
  }

  // Format label to sentence case
  const formattedLabel = label.charAt(0).toUpperCase() + label.slice(1).replace('-', ' ');

  return `<span class="badge badge--${badgeClass}"><span class="badge__dot"></span><span>${escapeHTML(formattedLabel)}</span></span>`;
}

// SIGNATURE DEVICE: Floor-Plan Line Motif SVG (Single stroke style 1.5px, round caps, no fills)
export function getFloorPlanMotif(className = 'floor-plan-motif') {
  return `
    <svg class="${className}" viewBox="0 0 140 90" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <!-- Outer perimeter room walls -->
      <path d="M10 10 H130 V80 H35" />
      <path d="M10 80 H20" />
      <!-- Door opening swing arc -->
      <path d="M20 80 A15 15 0 0 1 35 80" stroke-dasharray="2 3" />
      <line x1="20" y1="80" x2="35" y2="65" />
      <!-- Bed 1 outline with pillow -->
      <rect x="85" y="16" width="40" height="26" rx="2" />
      <rect x="110" y="20" width="12" height="18" rx="1" />
      <!-- Bed 2 outline with pillow -->
      <rect x="85" y="48" width="40" height="26" rx="2" />
      <rect x="110" y="52" width="12" height="18" rx="1" />
      <!-- Study desk & chair -->
      <rect x="16" y="16" width="36" height="18" rx="2" />
      <path d="M28 38 C28 34, 40 34, 40 38" />
      <!-- Wardrobe closet -->
      <rect x="16" y="44" width="24" height="28" rx="1" />
      <line x1="28" y1="44" x2="28" y2="72" />
      <!-- Window double line -->
      <line x1="130" y1="30" x2="130" y2="60" stroke-width="2" />
      <line x1="133" y1="32" x2="133" y2="58" stroke-width="1" />
    </svg>
  `;
}

// SIGNATURE DEVICE: Spatial Block/Floor Grid Matrix
export function getBlockFloorGrid(block = 'A', floor = 1, currentRoomNum = '101') {
  const blocks = ['A', 'B', 'C', 'D'];
  const floors = [3, 2, 1]; // Top to bottom

  return `
    <div class="floor-matrix" title="Block ${block}, Floor ${floor} Quarters" aria-label="Location index">
      ${blocks.map(b => {
        const isCurrentBlock = b === block;
        return `
          <div style="display: flex; flex-direction: column; gap: 3px; align-items: center;">
            <span style="font-size: 8px; font-weight: 600; color: var(--muted);">${b}</span>
            ${floors.map(f => {
              const isActive = isCurrentBlock && String(f) === String(floor);
              return `<div class="floor-matrix__cell ${isActive ? 'active' : ''}">${f}</div>`;
            }).join('')}
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// SVG Icons Sprite / Helper (1.5px / 1.75px restrained stroke)
export function getIcon(name, className = "icon") {
  const icons = {
    dashboard: `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>`,
    myroom: `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
    rooms: `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>`,
    students: `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    servicedesk: `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
    mess: `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" x2="6" y1="1" y2="4"/><line x1="10" x2="10" y1="1" y2="4"/><line x1="14" x2="14" y1="1" y2="4"/></svg>`,
    announcements: `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>`,
    settings: `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
    
    // New Zen Slate Nav items
    housekeeping: `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="m15 4-2 2"/><path d="m17 2 5 5"/><path d="m19 6-1.5 1.5"/><path d="M13 8 4 17l4 4 9-9-4-4Z"/><path d="m3 21 3-3"/></svg>`,
    maintenance: `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
    amenities: `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/></svg>`,
    reports: `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>`,
    
    // UI controls
    bell: `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>`,
    search: `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
    plus: `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>`,
    check: `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`,
    close: `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
    trash: `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`,
    edit: `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>`,
    chevronDown: `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`,
    chevronRight: `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`,
    user: `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    filter: `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>`,
    cleaning: `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="m15 4-2 2"/><path d="m17 2 5 5"/><path d="m19 6-1.5 1.5"/><path d="M13 8 4 17l4 4 9-9-4-4Z"/><path d="m3 21 3-3"/></svg>`,
    wrench: `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
    sun: `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`,
    moon: `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,
    refresh: `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>`,
    alertTriangle: `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>`,
    clock: `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    calendar: `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>`,
    logo: `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
    logout: `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>`,
    star: `<svg class="${className}" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    starOutline: `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
  };
  return icons[name] || '';
}

// Toast notification helper (Restrained, dot indicator, no loud colors)
export function showToast(message, type = 'info', duration = 3000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast--${type} toast--enter`;

  toast.innerHTML = `
    <span class="toast-dot"></span>
    <span style="flex: 1;">${escapeHTML(message)}</span>
  `;

  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove('toast--enter');
    toast.classList.add('toast--visible');
  });

  setTimeout(() => {
    toast.classList.remove('toast--visible');
    toast.classList.add('toast--exit');
    setTimeout(() => toast.remove(), 200);
  }, duration);
}

// In-App Accessible Confirmation Dialog (Replaces native browser window.confirm / alert)
export function showConfirmDialog({ title, message, confirmText = 'Confirm', cancelText = 'Cancel', isDanger = false }) {
  return new Promise((resolve) => {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');

    backdrop.innerHTML = `
      <div class="modal" style="max-width: 420px;">
        <div class="modal__header">
          <h3 class="modal__title">${escapeHTML(title)}</h3>
          <button class="icon-btn btn-modal-close" aria-label="Close dialog">
            ${getIcon('close')}
          </button>
        </div>
        <div class="modal__body">
          <p style="font-size: var(--text-sm); line-height: var(--leading-body); color: var(--ink-secondary); margin: 0;">
            ${escapeHTML(message)}
          </p>
        </div>
        <div class="modal__footer">
          <button class="btn btn--secondary btn-modal-cancel">${escapeHTML(cancelText)}</button>
          <button class="btn ${isDanger ? 'btn--danger' : 'btn--primary'} btn-modal-confirm">${escapeHTML(confirmText)}</button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);

    const cleanup = (result) => {
      document.removeEventListener('keydown', handleKey);
      backdrop.remove();
      resolve(result);
    };

    const handleKey = (e) => {
      if (e.key === 'Escape') {
        cleanup(false);
      }
    };

    document.addEventListener('keydown', handleKey);

    const confirmBtn = backdrop.querySelector('.btn-modal-confirm');
    confirmBtn.focus();

    backdrop.querySelector('.btn-modal-close').addEventListener('click', () => cleanup(false));
    backdrop.querySelector('.btn-modal-cancel').addEventListener('click', () => cleanup(false));
    confirmBtn.addEventListener('click', () => cleanup(true));
  });
}
