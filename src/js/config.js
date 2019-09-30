import $ from 'jquery';

function fetchConfig(success, configVersion) {
  $.getJSON('/config.json').then(config => {
    localStorage.setItem(`config${ configVersion }`, JSON.stringify(config));
    success(config);
  });
}

export {
  fetchConfig,
};
