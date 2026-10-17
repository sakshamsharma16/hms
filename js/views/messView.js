import { store } from '../store.js';
import { getIcon, showToast, escapeHTML, getCurrentMealInfo, getBadge } from '../utils.js';

export function renderMessView(container, router) {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const todayIdx = new Date().getDay();
  const todayName = days[(todayIdx + 6) % 7];
  let selectedDay = todayName;

  function render() {
    const state = store.getState();
    const isAdmin = state.settings.activeRole === 'admin';
    const dayMenu = state.messMenu.find(m => m.day.toLowerCase() === selectedDay.toLowerCase()) || state.messMenu[0];
    const liveMeal = getCurrentMealInfo();

    const mealTypes = [
      { key: 'breakfast', label: 'Breakfast', timing: dayMenu.timings.breakfast },
      { key: 'lunch', label: 'Lunch', timing: dayMenu.timings.lunch },
      { key: 'snacks', label: 'Evening Snacks', timing: dayMenu.timings.snacks },
      { key: 'dinner', label: 'Dinner', timing: dayMenu.timings.dinner }
    ];

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: var(--section-gap);">
        
        <!-- Header -->
        <div style="display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 8px;">
          <div>
            <h1 style="font-size: var(--text-2xl); font-weight: 600;">Mess & Dining Hall Schedule</h1>
            <p style="font-size: var(--text-sm); color: var(--muted); margin-top: 2px;">
              Weekly rotating catering schedule with real-time serving indicator and student meal ratings.
            </p>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            ${getBadge(liveMeal.status === 'now_serving' ? 'active' : 'upcoming', liveMeal.status === 'now_serving' ? `${liveMeal.label} Now Serving` : liveMeal.next)}
          </div>
        </div>

        <!-- Day Selector Tabs -->
        <div style="display: flex; gap: 6px; overflow-x: auto; padding-bottom: 4px; border-bottom: 1px solid var(--border);">
          ${days.map(d => {
            const isToday = d.toLowerCase() === todayName.toLowerCase();
            const isSelected = d.toLowerCase() === selectedDay.toLowerCase();
            return `
              <button class="btn ${isSelected ? 'btn--secondary' : 'btn--tertiary'} btn--sm tab-day-btn" data-day="${d}" style="${isSelected ? 'background: var(--surface-hover); font-weight: 600;' : ''}">
                <span>${d}</span>
                ${isToday ? `<span style="font-size: 10px; color: var(--accent); margin-left: 4px;">(Today)</span>` : ''}
              </button>
            `;
          }).join('')}
        </div>

        <!-- Meals Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: var(--gap);">
          ${mealTypes.map(meal => {
            const isNowServing = (selectedDay.toLowerCase() === todayName.toLowerCase()) && (liveMeal.current === meal.key) && (liveMeal.status === 'now_serving');
            const items = dayMenu.meals[meal.key] || [];
            const ratingInfo = store.getMealAverageRating(selectedDay, meal.key);

            const currentStudentId = state.settings.currentStudentId;
            const myRatingObj = state.mealRatings.find(
              r => r.day.toLowerCase() === selectedDay.toLowerCase() && r.meal.toLowerCase() === meal.key.toLowerCase() && r.studentId === currentStudentId
            );
            const myRating = myRatingObj ? myRatingObj.rating : 0;

            return `
              <div class="card" style="display: flex; flex-direction: column; justify-content: space-between; ${isNowServing ? 'border-color: var(--accent);' : ''}">
                <div>
                  <div class="card__header" style="margin-bottom: 10px;">
                    <div>
                      <h3 class="card__title" style="font-size: var(--text-base);">${meal.label}</h3>
                      <div class="card__subtitle" style="font-size: var(--text-xs);">${meal.timing}</div>
                    </div>
                    ${isNowServing ? getBadge('active', 'Now Serving') : ''}
                  </div>

                  <!-- Dish items list -->
                  <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 12px; min-height: 120px;">
                    ${items.map(dish => `
                      <div style="display: flex; align-items: baseline; gap: 8px; font-size: var(--text-sm); color: var(--ink);">
                        <span style="color: var(--muted); font-size: 10px;">&bull;</span>
                        <span>${escapeHTML(dish)}</span>
                      </div>
                    `).join('')}
                  </div>
                </div>

                <!-- Star Rating & Warden Edit Section -->
                <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between;">
                  <div>
                    <div style="display: flex; align-items: center; gap: 4px;">
                      <div class="star-rating" data-day="${selectedDay}" data-meal="${meal.key}" style="display: flex; gap: 3px; color: var(--warning);">
                        ${[1, 2, 3, 4, 5].map(starNum => `
                          <span class="star-btn" data-star="${starNum}" title="Rate ${starNum} stars" style="cursor: pointer; display: inline-flex;">
                            ${getIcon(starNum <= (myRating || Math.round(parseFloat(ratingInfo.avg))) ? 'star' : 'starOutline', 'icon-sm')}
                          </span>
                        `).join('')}
                      </div>
                      <span style="font-size: var(--text-xs); font-weight: 600; margin-left: 4px; font-variant-numeric: tabular-nums;">${ratingInfo.avg}</span>
                    </div>
                    <div style="font-size: 11px; color: var(--muted); margin-top: 2px;">
                      ${ratingInfo.count} rating(s) ${myRating ? '(Rated by you)' : ''}
                    </div>
                  </div>

                  ${isAdmin ? `
                    <button class="btn btn--secondary btn--sm btn-edit-menu" data-day="${selectedDay}" data-meal="${meal.key}">
                      Edit
                    </button>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>

      </div>
    `;

    // Day switch event
    container.querySelectorAll('.tab-day-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedDay = btn.getAttribute('data-day');
        render();
      });
    });

    // Star rating event
    container.querySelectorAll('.star-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const parent = btn.closest('.star-rating');
        const day = parent.getAttribute('data-day');
        const meal = parent.getAttribute('data-meal');
        const val = parseInt(btn.getAttribute('data-star'));

        store.rateMeal(day, meal, val, state.settings.currentStudentId);
        showToast(`Rated ${val} stars for ${meal}.`, 'success');
        render();
      });
    });

    // Warden Edit Menu
    container.querySelectorAll('.btn-edit-menu').forEach(btn => {
      btn.addEventListener('click', () => {
        const day = btn.getAttribute('data-day');
        const meal = btn.getAttribute('data-meal');
        openEditMenuDialog(day, meal, () => render());
      });
    });
  }

  render();
}

/**
 * Warden Edit Menu Dialog
 */
function openEditMenuDialog(day, meal, onComplete) {
  const state = store.getState();
  const dayMenu = state.messMenu.find(m => m.day.toLowerCase() === day.toLowerCase());
  const currentDishes = (dayMenu && dayMenu.meals[meal]) ? dayMenu.meals[meal].join('\n') : '';

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';

  backdrop.innerHTML = `
    <div class="modal">
      <div class="modal__header">
        <h3 class="modal__title">Edit ${meal.toUpperCase()} (${day})</h3>
        <button class="icon-btn btn-modal-close" aria-label="Close dialog">${getIcon('close')}</button>
      </div>
      <div class="modal__body" style="display: flex; flex-direction: column; gap: 14px;">
        <p style="font-size: var(--text-sm); color: var(--muted); margin: 0;">
          Enter menu items (one per line). These will immediately reflect across all student accounts.
        </p>

        <div class="form-group">
          <label class="form-label" for="txt-menu-dishes">Dishes List</label>
          <textarea class="form-textarea" id="txt-menu-dishes" style="min-height: 140px; font-family: inherit;">${escapeHTML(currentDishes)}</textarea>
        </div>
      </div>
      <div class="modal__footer">
        <button class="btn btn--secondary btn-modal-close">Cancel</button>
        <button class="btn btn--primary" id="btn-save-dishes">Save Menu</button>
      </div>
    </div>
  `;

  document.body.appendChild(backdrop);

  const cleanup = () => backdrop.remove();
  backdrop.querySelectorAll('.btn-modal-close').forEach(b => b.addEventListener('click', cleanup));

  backdrop.querySelector('#btn-save-dishes').addEventListener('click', () => {
    const text = backdrop.querySelector('#txt-menu-dishes').value;
    const items = text.split('\n').map(s => s.trim()).filter(s => s.length > 0);
    store.updateMessMenu(day, meal, items);
    showToast(`${day} ${meal} menu saved!`, 'success');
    cleanup();
    onComplete();
  });
}
