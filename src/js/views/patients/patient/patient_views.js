import { View } from 'marionette';

import hbs from 'handlebars-inline-precompile';

import PreloadRegion from 'js/regions/preload_region';

import './patient.scss';

const LayoutView = View.extend({
  className: 'patient-frame',
  template: hbs`
    <div class="patient__content">
        <div data-context-trail-region></div>
        <div data-content-region></div>
    </div>
    <div class="patient__sidebar" data-sidebar-region></div>
  `,
  regions: {
    contextTrail: '[data-context-trail-region]',
    sidebar: '[data-sidebar-region]',
    content: {
      el: '[data-content-region]',
      regionClass: PreloadRegion,
    },
  },
});

export {
  LayoutView,
};
