import { extend } from 'underscore';

const kindeConfig = {};
const datadogConfig = {};
const appConfig = {};
const versions = {};

function fetchConfig(success) {
  fetch(`/appconfig.json?${ new URLSearchParams({ _: _NOW_ }) }`)
    .then(response => response.json())
    .then(config => {
      extend(kindeConfig, config.kinde);
      extend(datadogConfig, config.datadog);
      extend(appConfig, config.app);
      extend(versions, config.versions);
      success();
    });
}

export {
  fetchConfig,
  kindeConfig,
  datadogConfig,
  appConfig,
  versions,
};
