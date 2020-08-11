import _ from 'underscore';
import anime from 'animejs';
import moment from 'moment';
import Radio from 'backbone.radio';

import hbs from 'handlebars-inline-precompile';
import { View, CollectionView } from 'marionette';

import ModelRender from 'js/behaviors/model-render';
import fieldsTemplate from 'js/utils/fields-template';

import './patient-sidebar.scss';
import 'sass/domain/engagement-status.scss';

const sidebarWidgets = {
  dob: {
    template: hbs`{{formatHTMLMessage (intlGet "patients.patient.sidebar.sidebarViews.sidebarWidgets.dob") dob=(formatMoment dob "LONG" inputFormat="YYYY-MM-DD") age=age}}`,
    templateContext() {
      const dob = this.model.get('birth_date');

      const age = moment().diff(moment(dob, 'YYYY-MM-DD'), 'years');

      return { dob, age };
    },
  },
  sex: {
    template: hbs`{{formatMessage (intlGet "patients.patient.sidebar.sidebarViews.sidebarWidgets.sex") sex=sex}}`,
  },
  divider: {
    template: hbs`<div class="patient-sidebar__divider"></div>`,
  },
  groups: {
    behaviors: [
      {
        behaviorClass: ModelRender,
        changeAttributes: ['_groups'],
      },
    ],
    template: hbs`{{#each groups}}<div>{{ this.name }}</div>{{/each}}`,
    templateContext() {
      return {
        groups: _.map(this.model.getGroups().models, 'attributes'),
      };
    },
  },
  engagement: View.extend({
    modelEvents: {
      'change:engagement': 'render',
      'status:notAvailable': 'onStatusNotAvailable',
    },
    getTemplate() {
      if (this.isNotAvailable) return hbs`<span class="patient-sidebar__no-engagement">{{ @intl.patients.patient.sidebar.sidebarViews.sidebarWidgets.engagement.notAvailable }}</span>`;

      if (!this.model.get('engagement')) return hbs`<span class="js-loading">{{ @intl.patients.patient.sidebar.sidebarViews.sidebarWidgets.engagement.loading }}</span>`;

      return hbs`<span class="engagement-status__icon {{ engagement.status }} u-margin--r-4">{{fas "circle"}}</span>{{formatMessage (intlGet "patients.patient.sidebar.sidebarViews.sidebarWidgets.engagement.status") status=engagement.status}}`;
    },
    ui: {
      loading: '.js-loading',
    },
    triggers: {
      'click': 'click',
    },
    onRender() {
      if (!this.model.get('engagement')) {
        anime({
          targets: this.ui.loading[0],
          opacity: 0.5,
          loop: true,
          easing: 'easeInOutSine',
          duration: 400,
          direction: 'alternate',
        });
      }
    },
    onClick() {
      if (this.isNotAvailable || !this.model.get('engagement')) return;

      Radio.request('sidebar', 'start', 'engagement', { patient: this.model });
    },
    onStatusNotAvailable(isNotAvailable) {
      this.isNotAvailable = isNotAvailable;
      this.render();
    },
  }),
  optionsWidget: {
    template: hbs`<span {{#unless displayValue}}class="is-empty"{{/unless}}>{{ displayValue }}</span>`,
    templateContext() {
      const fields = this.model.getFields();
      const currentField = fields.find({ name: this.getOption('field_name') });
      const fieldOptions = this.getOption('display_options');
      let displayValue;

      if (!currentField) {
        return;
      }

      if (this.getOption('key')) {
        displayValue = fieldOptions[_.propertyOf(currentField.get('value'))(this.getOption('key').split('.'))];
      } else {
        displayValue = fieldOptions[currentField.get('value')];
      }

      return {
        displayValue,
      };
    },
  },
  templateWidget: View.extend({
    initialize() {
      const fields = this.model.getFields();

      this.currentField = fields.find({ name: this.getOption('field_name') });
    },
    getTemplate() {
      if (!this.currentField) return hbs`<span class="is-empty"></span>`;

      const template = fieldsTemplate(this.getOption('template'));

      return template;
    },
    templateContext() {
      if (!this.currentField) return;

      return this.currentField.get('value');
    },
  }),
};

const widgetView = View.extend({
  className: 'patient-sidebar__section',
  template: hbs`{{#if display_name}}<div class="patient-sidebar__heading">{{ display_name }}</div>{{/if}}<div class="patient-sidebar__item" data-content-region></div>`,
  regions: {
    content: '[data-content-region]',
  },
  onRender() {
    const widget = this.getWidget();

    this.showChildView('content', widget);
  },
  getWidget() {
    const widget = this.getOption('widget');
    const model = this.getOption('patient');

    if (_.isFunction(widget)) return new widget(_.extend({ model }, this.model.get('widget_config')));

    return _.extend({ model }, this.model.get('widget_config'), widget);
  },
});

const SidebarView = CollectionView.extend({
  className: 'patient-sidebar flex-region',
  template: hbs`
    <h1 class="patient-sidebar__name">{{ first_name }} {{ last_name }}</h1>
    <div data-sections-region></div>
  `,
  childViewContainer: '[data-sections-region]',
  childView: widgetView,
  childViewOptions(model) {
    const widget = sidebarWidgets[model.get('widget_type')];

    return {
      widget,
      model,
      patient: this.model,
    };
  },
  viewFilter({ model }) {
    return model.get('widget_type');
  },
});

export {
  SidebarView,
};
