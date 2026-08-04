const _s = (h) => {
  if (!h) return "{}";
  if (h instanceof Headers) {
    const o = {};
    h.forEach((v, k) => {
      o[k] = v;
    });
    return JSON.stringify(o);
  }
  return JSON.stringify(h);
};

(function () {
  if (window._x) return;
  window._x = true;

  const B = window.__BRIDGE_NAME__;

  const n1 = XMLHttpRequest.prototype.open;
  const n2 = XMLHttpRequest.prototype.setRequestHeader;
  const n3 = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
    this._m = method;
    this._u = url;
    return n1.call(this, method, url, async, user, password);
  };

  XMLHttpRequest.prototype.setRequestHeader = function (header, value) {
    if (!this._h) this._h = {};
    this._h[header] = value;
    return n2.call(this, header, value);
  };

  XMLHttpRequest.prototype.send = function (body) {
    const url = this._u || "";
    if (url.indexOf("fetch-ocr.php") !== -1 && !this._r) {
      this._r = true;
      try {
        B.onFetch(url, body ? String(body) : "", JSON.stringify(this._h || {}));
      } catch (e) { /* do nothing */ }

      const x = this;
      x.addEventListener("readystatechange", function () {
        if (x.readyState === 4 && !x._d) {
          x._d = true;
          try {
            B.onOcrResponse(url, x.responseText || "");
          } catch (e) { /* do nothing */ }
        }
      });
    }
    return n3.call(this, body);
  };

  const n4 = window.fetch;
  if (typeof n4 === "function") {
    window.fetch = function (input, options) {
      const url = typeof input === "string" ? input : (input && input.url) || "";
      if (url.indexOf("fetch-ocr.php") !== -1) {
        const body = options && options.body ? String(options.body) : "";
        try {
          B.onFetch(url, body, _s(options ? options.headers : null));
        } catch (e) { /* do nothing */ }
      }
      return n4.apply(this, arguments);
    };
    try {
      Object.defineProperty(window.fetch, "name", { value: "fetch" });
    } catch (e) { /* do nothing */ }
  }
})();
