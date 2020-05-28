import Radio from 'backbone.radio';
import hbs from 'handlebars-inline-precompile';

import { View } from 'marionette';

import PreloadRegion from 'js/regions/preload_region';

import './report.scss';

const ContextTrailView = View.extend({
  className: 'report__context-trail',
  template: hbs`
    <a class="js-back report__context-link">
      {{fas "chevron-left"}}{{ @intl.admin.report.reportViews.contextTrailView.contextBackBtn }}
    </a>
    {{fas "chevron-right"}}{{ name }}
  `,
  triggers: {
    'click .js-back': 'click:back',
  },
  onClickBack() {
    Radio.trigger('event-router', 'reports:all');
  },
});

const LayoutView = View.extend({
  className: 'report__frame',
  template: hbs`
  <div class="report__layout">
    <div data-context-trail-region></div>
    <div class="report__iframe" data-report-region>
      <iframe src=""></iframe>
    </div>
  </div>
  `,
  regions: {
    contextTrail: {
      el: '[data-context-trail-region]',
      replaceElement: true,
    },
    report: {
      el: '[data-report-region]',
      regionClass: PreloadRegion,
    },
  },
});

export {
  LayoutView,
  ContextTrailView,
};
