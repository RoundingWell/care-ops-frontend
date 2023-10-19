import { extend, isError } from 'underscore';
import Backbone from 'backbone';
import baseFetch, { getData } from 'js/base/fetch';

Backbone.ajax = options => {
  let isAborting = false;
  const controller = new AbortController();

  options = extend({
    method: options.type,
    signal: controller.signal,
  }, options);

  const fetcher = baseFetch(options.url, options)
    .then(response => {
      const promise = getData(response, options.dataType);

      if (response.ok) return promise;

      const error = new Error(response.statusText || response.status || 'Unknown Error');
      return promise.then(responseData => {
        error.response = response;
        error.responseData = responseData;
        if (options.error) options.error(error);
        else throw error;
        return Promise.reject(error);
      });
    })
    .then(responseData => {
      fetcher.readyState = 'DONE';
      if (options.success) options.success(responseData);
      return responseData;
    })
    .catch(error => {
      if (!isAborting) throw isError(error) ? error : new Error(error);
    });

  // Store and maintain the readyState/abort on the fetch chain
  fetcher.readyState = 'LOADING';
  fetcher.abort = () => {
    isAborting = true;
    controller.abort();
  };

  const fetchThen = fetcher.then;

  fetcher.then = function() {
    const fetched = fetchThen.apply(this, arguments);
    fetched.abort = fetcher.abort;
    fetched.readyState = fetcher.readyState;
    return fetched;
  };

  return fetcher;
};

