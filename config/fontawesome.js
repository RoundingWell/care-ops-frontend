const _ = require('underscore');
const camelCase = require('lodash.camelcase');

const { icon, config } = require('@fortawesome/fontawesome-svg-core');
const fasIcons = require('@fortawesome/pro-solid-svg-icons');
const farIcons = require('@fortawesome/pro-regular-svg-icons');
const falIcons = require('@fortawesome/pro-light-svg-icons');

config.replacementClass = '';

function getIconHtml(lib, fonts) {
  return _.map(fonts, iconClass => {
    const iconName = camelCase(`fa-${ iconClass }`);
    if (!lib[iconName]) console.error('Missing icon:', iconName);
    return icon(lib[iconName], { symbol: true }).html;
  });
}

module.exports = ({ fas, far, fal }) => {
  return [
    ...getIconHtml(fasIcons, fas),
    ...getIconHtml(farIcons, far),
    ...getIconHtml(falIcons, fal),
  ].join('');
};
