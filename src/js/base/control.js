const fetchers = [];

function registerFetcher(baseUrl, fetcher) {
  fetchers[baseUrl] = fetcher;

  return fetcher;
}

function getFetcher(baseUrl) {
  return fetchers[baseUrl];
}

function getActiveFetcher(baseUrl, { abort } = {}) {
  const fetcher = getFetcher(baseUrl);

  /* istanbul ignore if: async safety */
  if (fetcher && fetcher.readyState !== 'DONE') {
    if (abort !== false) {
      fetcher.abort();
      return false;
    }

    return fetcher;
  }

  return false;
}

export {
  registerFetcher,
  getFetcher,
  getActiveFetcher,
};
