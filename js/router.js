const routes = [];
let container = null;
let current = { path: '/dashboard', params: {}, render: null };
let notFoundRender = null;

function compile(path) {
  const paramNames = [];
  const pattern = path
    .split('/')
    .map((segment) => {
      if (segment.startsWith(':')) {
        paramNames.push(segment.slice(1));
        return '([^/]+)';
      }
      return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    })
    .join('/');
  return { regex: new RegExp(`^${pattern}$`), paramNames };
}

export function registerRoute(path, render) {
  routes.push({ path, render, ...compile(path) });
}

export function setNotFound(render) {
  notFoundRender = render;
}

export function navigate(path) {
  if (location.hash.slice(1) === path) {
    handleChange();
  } else {
    location.hash = path;
  }
}

function matchPath(path) {
  for (const route of routes) {
    const match = route.regex.exec(path);
    if (!match) continue;
    const params = {};
    route.paramNames.forEach((name, i) => {
      params[name] = decodeURIComponent(match[i + 1]);
    });
    return { route, params };
  }
  return null;
}

function handleChange() {
  const rawPath = location.hash.slice(1) || '/dashboard';
  const path = rawPath.split('?')[0];
  const matched = matchPath(path);

  if (!matched) {
    current = { path, params: {}, render: notFoundRender };
    if (notFoundRender && container) notFoundRender(container, {});
    return;
  }

  current = { path, params: matched.params, render: matched.route.render };
  if (container) matched.route.render(container, matched.params);
}

// Re-invokes the currently active view's render with fresh state — this is
// what makes the whole app "dynamic": any store mutation calls this.
export function rerenderCurrent() {
  if (current.render && container) {
    current.render(container, current.params);
  }
}

export function getCurrentPath() {
  return current.path;
}

export function initRouter(rootEl) {
  container = rootEl;
  window.addEventListener('hashchange', handleChange);
  handleChange();
}
