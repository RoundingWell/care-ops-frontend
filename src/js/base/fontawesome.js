import _ from 'underscore';
import Handlebars from 'handlebars/runtime';
import { findIconDefinition, icon, config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';

config.autoAddCss = false;

function faHelper(prefix, iconName, { hash = {} }) {
  const faDefinition = findIconDefinition({ prefix, iconName });
  const faIcon = icon(faDefinition, hash);

  /* istanbul ignore next: dev safety */
  if (!faIcon || !faIcon.html) {
    throw new Error(`${ prefix }:${ iconName } fontawesome icon not loaded`);
  }
  return new Handlebars.SafeString(faIcon.html);
}

// {{far "acorn"}} -> <svg ...>
Handlebars.registerHelper({
  far: _.partial(faHelper, 'far'),
  fas: _.partial(faHelper, 'fas'),
  fal: _.partial(faHelper, 'fal'),
});
