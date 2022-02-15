import $ from 'jquery';
import { extend } from 'underscore';

const auth0Config = {};
const datadogConfig = {};
const appConfig = {};
const versions = {};

function fetchConfig(success) {
  $.getJSON('/appconfig.json').then(config => {
    extend(auth0Config, config.auth0);
    extend(datadogConfig, config.datadog);
    extend(appConfig,config.app);
    extend(versions, config.versions);
    success();
  });
}

export {
  fetchConfig,
  auth0Config,
  datadogConfig,
  appConfig,
  versions,
};
