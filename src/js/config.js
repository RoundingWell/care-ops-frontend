import { extend } from 'underscore';

const auth0Config = {};
const kindeConfig = {};
const datadogConfig = {};
const appConfig = {};
const versions = {};

function fetchConfig(success) {
  fetch(`/appconfig.json?${ new URLSearchParams({ _: _NOW_ }) }`)
    .then(response => response.json())
    .then(config => {
      extend(auth0Config, config.auth0);
      extend(kindeConfig, config.kinde);
      extend(datadogConfig, config.datadog);
      extend(appConfig, config.app);
      extend(versions, config.versions);
      success();
    });
}

export {
  auth0Config,
  fetchConfig,
  kindeConfig,
  datadogConfig,
  appConfig,
  versions,
};
