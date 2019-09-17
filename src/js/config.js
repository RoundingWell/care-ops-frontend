import $ from 'jquery';

function fetchConfig(success) {
  $.getJSON('/config.json').then(config => {
    localStorage.setItem('config', JSON.stringify(config));
    success(config);
  });
}

export {
  fetchConfig,
};
