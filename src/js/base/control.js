const xhrs = [];

function registerXhr(baseUrl, xhr) {
  xhrs[baseUrl] = xhr;

  return xhr;
}

function getXhr(baseUrl) {
  return xhrs[baseUrl];
}

function getActiveXhr(baseUrl, options = {}) {
  const xhr = getXhr(baseUrl);

  /* istanbul ignore if: async safety */
  if (xhr && xhr.readyState !== 4 && !options.async) {
    // Aborts if forced or if there's a success callback and not explicitly false
    if (options.abort || (options.success && options.abort !== false)) {
      xhr.abort();
      return false;
    }

    return xhr;
  }

  return false;
}

export {
  registerXhr,
  getXhr,
  getActiveXhr,
};
