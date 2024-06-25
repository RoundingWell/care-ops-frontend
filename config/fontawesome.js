import _ from 'underscore';
import camelCase from 'lodash.camelcase';

import { icon, config } from '@fortawesome/fontawesome-svg-core';
import * as fasIcons from '@fortawesome/pro-solid-svg-icons';
import * as farIcons from '@fortawesome/pro-regular-svg-icons';
import * as falIcons from '@fortawesome/pro-light-svg-icons';
import * as fatIcons from '@fortawesome/pro-thin-svg-icons';

config.replacementClass = '';

function getIconHtml(lib, fonts) {
  return _.map(fonts, iconClass => {
    const iconName = camelCase(`fa-${ iconClass }`);
    if (!lib[iconName]) console.error('Missing icon:', iconName);
    return icon(lib[iconName], { symbol: true }).html;
  });
}

export default ({ fas, far, fal, fat }) => {
  return [
    ...getIconHtml(fasIcons, fas),
    ...getIconHtml(farIcons, far),
    ...getIconHtml(falIcons, fal),
    ...getIconHtml(fatIcons, fat),
  ].join('');
};
