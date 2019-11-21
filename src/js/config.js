import $ from 'jquery';

function fetchConfig(success, configVersion) {
  $.getJSON('/config.json').then(config => {
    config.configVersion = configVersion;
    localStorage.setItem(`config${ configVersion }`, JSON.stringify(config));
    success(config);
  });
}

export {
  fetchConfig,
};
