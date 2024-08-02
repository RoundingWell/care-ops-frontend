import _ from 'underscore';
import camelCase from 'lodash.camelcase';
import { URL } from 'url';
import fs from 'fs-extra';

import { icon, config } from '@fortawesome/fontawesome-svg-core';
import * as fasIcons from '@fortawesome/pro-solid-svg-icons';
import * as farIcons from '@fortawesome/pro-regular-svg-icons';
import * as falIcons from '@fortawesome/pro-light-svg-icons';
import * as fatIcons from '@fortawesome/pro-thin-svg-icons';

const { pathname } = new URL('../package.json', import.meta.url);

const { fontawesome } = fs.readJsonSync(pathname);

config.replacementClass = '';

function getIconHtml(lib, fonts) {
  return _.map(fonts, iconClass => {
    const iconName = camelCase(`fa-${ iconClass }`);
    if (!lib[iconName]) console.error('Missing icon:', iconName);
    return icon(lib[iconName], { symbol: true }).html;
  });
}

export default ({ fas, far, fal, fat } = fontawesome) => {
  return [
    ...getIconHtml(fasIcons, fas),
    ...getIconHtml(farIcons, far),
    ...getIconHtml(falIcons, fal),
    ...getIconHtml(fatIcons, fat),
  ].join('');
};
