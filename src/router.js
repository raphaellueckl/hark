class Router {
  constructor() {
    this._error = undefined;

    window.onhashchange = ({ newURL }) => {
      const fragment =
        newURL.indexOf("#") === -1
          ? "/"
          : newURL.substring(newURL.indexOf("#") + 1);
      this.navigate(fragment);
    };
    // If the user routes to a specific URL from the beginning, it should load the appropriate page.
    setTimeout(() => {
      const fragment =
        window.location.href.indexOf("#") === -1
          ? "/"
          : window.location.href.substring(
              window.location.href.indexOf("#") + 1
            );
      this.navigate(fragment);
    });
  }

  routes = [];

  defineError = cb => {
    this._error = cb;
  };

  add = (path, cb) => {
    this.routes.push({ path, cb });
    return this;
  };

  remove = path => {
    for (let i = 0; i < this.routes.length; i += 1) {
      if (this.routes[i].path === path) {
        this.routes.slice(i, 1);
        return this;
      }
    }
    return this;
  };

  navigate = (routingUrl = "") => {
    window.history.pushState(null, null, "/#" + routingUrl);
    const routes = this.routes.filter(r => r.path === routingUrl);
    if (routes && routes[0]) routes[0].cb();
    else this._error();
  };
}

export default Router;
