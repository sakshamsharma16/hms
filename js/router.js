// Hash-based client-side router with role guards and smooth transitions
export class Router {
  constructor(routes, defaultRoute = '#/dashboard') {
    this.routes = routes;
    this.defaultRoute = defaultRoute;
    this.currentRoute = null;
    this.beforeHooks = [];
    this.afterHooks = [];

    window.addEventListener('hashchange', () => this.handleRouting());
    window.addEventListener('DOMContentLoaded', () => this.handleRouting());
  }

  beforeEach(hook) {
    this.beforeHooks.push(hook);
  }

  afterEach(hook) {
    this.afterHooks.push(hook);
  }

  navigate(path) {
    window.location.hash = path;
  }

  async handleRouting() {
    const hash = window.location.hash || this.defaultRoute;
    const [path, queryStr] = hash.split('?');
    const params = new URLSearchParams(queryStr || '');

    // Execute before hooks (e.g. auth / role checking)
    for (const hook of this.beforeHooks) {
      const allowed = await hook(path);
      if (allowed === false) return;
      if (typeof allowed === 'string') {
        this.navigate(allowed);
        return;
      }
    }

    const matchedHandler = this.routes[path] || this.routes[this.defaultRoute];
    if (matchedHandler) {
      this.currentRoute = path;
      
      const contentEl = document.getElementById('main-content');
      if (contentEl) {
        // If document.startViewTransition is supported, use it for silky smooth page shifts
        if (document.startViewTransition) {
          document.startViewTransition(async () => {
            contentEl.innerHTML = '';
            await matchedHandler(contentEl, params);
            contentEl.className = 'content-area page-enter';
          });
        } else {
          contentEl.className = 'content-area';
          contentEl.innerHTML = '';
          await matchedHandler(contentEl, params);
          contentEl.className = 'content-area page-enter';
        }
      }

      for (const hook of this.afterHooks) {
        hook(path);
      }
    }
  }
}
