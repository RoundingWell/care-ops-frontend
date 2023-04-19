//  Similar to https://github.com/akre54/Backbone.Fetch
import { isObject, isArray, defaults, extend, map, flatten, reduce, first, rest } from 'underscore';
import Radio from 'backbone.radio';

import { getToken } from 'js/auth';

function getValue(value) {
  return encodeURIComponent(value ?? '');
}

function getKey(key) {
  // Builds key[subkey] or key[subkey1][subkey2]
  if (isArray(key)) {
    const firstKey = encodeURIComponent(first(key));

    return reduce(rest(key), (str, k) => `${ str }[${ encodeURIComponent(k) }]`, firstKey);
  }

  return encodeURIComponent(key);
}

function buildParams(value, key) {
  if (isArray(value)) {
    // Builds key=value1,value2,value3
    return `${ getKey(key) }=${ value.map(getValue).join() }`;
  }

  if (isObject(value)) {
    // Builds key[subkey]=value or key[subkey1][subkey2]=value
    return flatten(map(value, (val, name) => buildParams(val, flatten([key, name])))).join('&');
  }

  return `${ getKey(key) }=${ getValue(value) }`;
}

function serializeParams(obj) {
  return map(obj, buildParams).join('&');
}

// Makes data object into `/url?param1=value1&param2=value2` string
function getUrl(url, data) {
  if (!isObject(data)) return url;

  const params = serializeParams(data);
  if (!params) return url;

  return `${ url }?${ params }`;
}

export function getData(response, dataType) {
  if (dataType === 'json' && response.status !== 204) return response.json();
  return response.text();
}

export function handleJSON(response) {
  if (!response.ok) return Promise.reject(response);

  return getData(response, 'json');
}

export default async(url, opts) => {
  const token = await getToken();

  const options = extend({}, opts);

  if (!options.method || options.method === 'GET') {
    url = getUrl(url, options.data);
  } else if (options.data) {
    options.body = options.data;
  }

  defaults(options, {
    dataType: 'json',
    headers: defaults(options.headers, {
      'Accept': 'application/vnd.api+json',
      'Authorization': `Bearer ${ token }`,
      'Content-Type': 'application/vnd.api+json',
    }),
  });

  // Attach preferred workspace to request
  const currentWorkspace = Radio.request('bootstrap', 'currentWorkspace');
  if (currentWorkspace) options.headers.Workspace = currentWorkspace.id;

  return fetch(url, options)
    .then(response => {
      if (!response.ok) {
        if (response.status === 401) {
          Radio.request('auth', 'logout');
          return Promise.reject(response);
        }

        // FIXME: Should be >= 500, but missing Cypress stubs cause wide failures
        if (response.status === 500) {
          Radio.trigger('event-router', 'error');
          return Promise.reject(response);
        }
      }

      return response;
    });
};
