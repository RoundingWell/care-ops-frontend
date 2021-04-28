import { bind, each, extend, isFunction, map, propertyOf, reduce } from 'underscore';
import Backbone from 'backbone';
import { View, CollectionView } from 'marionette';
import anime from 'animejs';
import dayjs from 'dayjs';
import Radio from 'backbone.radio';
import parsePhoneNumber from 'libphonenumber-js/min';
import hbs from 'handlebars-inline-precompile';

import intl from 'js/i18n';

import 'sass/modules/widgets.scss';

import patientTemplate from 'js/utils/patient-template';

import Optionlist from 'js/components/optionlist';

import './patient-sidebar.scss';
import 'sass/domain/engagement-status.scss';

const i18n = intl.patients.patient.sidebar.sidebarViews;

// NOTE: widget is a view or view definition
function buildWidget(widget, patient, widgetModel, options) {
  if (isFunction(widget)) return new widget(extend({ model: patient }, options, widgetModel.get('definition')));

  return new View(extend({ model: patient }, options, widgetModel.get('definition'), widget));
}

function getKeyValue(value, key) {
  if (key) {
    return propertyOf(value)(key.split('.'));
  }

  return value;
}

function getWidgetValue({ fields, name, key, childValue }) {
  if (childValue) {
    return getKeyValue(childValue, key);
  }

  const currentField = fields.find({ name });

  if (!currentField) return;

  return getKeyValue(currentField.get('value'), key);
}

// NOTE: These widgets are documented in ./README.md
const sidebarWidgets = {
  dob: {
    modelEvents: {
      'change:birth_date': 'render',
    },
    template: hbs`{{formatHTMLMessage (intlGet "patients.patient.sidebar.sidebarViews.sidebarWidgets.dob") dob=(formatDateTime dob "LONG" inputFormat="YYYY-MM-DD") age=age}}`,
    templateContext() {
      const dob = this.model.get('birth_date');

      const age = dayjs().diff(dayjs(dob, 'YYYY-MM-DD'), 'years');

      return { dob, age };
    },
  },
  sex: {
    modelEvents: {
      'change:sex': 'render',
    },
    template: hbs`{{formatMessage (intlGet "patients.patient.sidebar.sidebarViews.sidebarWidgets.sex") sex=sex}}`,
  },
  status: {
    modelEvents: {
      'change:status': 'render',
    },
    template: hbs`<span class="patient-sidebar__status-{{ status }}">{{formatMessage (intlGet "patients.patient.sidebar.sidebarViews.sidebarWidgets.status") status=status}}</span>`,
  },
  divider: {
    template: hbs`<div class="patient-sidebar__divider"></div>`,
  },
  groups: {
    modelEvents: {
      'change:_groups': 'render',
    },
    template: hbs`{{#each groups}}<div>{{ this.name }}</div>{{/each}}`,
    templateContext() {
      return {
        groups: map(this.model.getGroups().models, 'attributes'),
      };
    },
  },
  engagement: View.extend({
    modelEvents: {
      'change:_patient_engagement': 'render',
      'status:notAvailable': 'onStatusNotAvailable',
    },
    getTemplate() {
      if (this.isNotAvailable) return hbs`<span class="patient-sidebar__no-engagement">{{ @intl.patients.patient.sidebar.sidebarViews.sidebarWidgets.engagement.notAvailable }}</span>`;

      if (!this.model.get('_patient_engagement')) return hbs`<span class="js-loading">{{ @intl.patients.patient.sidebar.sidebarViews.sidebarWidgets.engagement.loading }}</span>`;

      return hbs`<span class="engagement-status__icon {{ _patient_engagement.engagement.status }} u-margin--r-4">{{fas "circle"}}</span>{{formatMessage (intlGet "patients.patient.sidebar.sidebarViews.sidebarWidgets.engagement.status") status=_patient_engagement.engagement.status}}`;
    },
    ui: {
      loading: '.js-loading',
    },
    triggers: {
      'click': 'click',
    },
    initialize() {
      const patient = this.model;
      Radio.request('entities', 'fetch:patient:engagementStatus', patient.id)
        .fail(() => {
          patient.trigger('status:notAvailable', true);
        });
    },
    onRender() {
      if (!this.model.get('_patient_engagement')) {
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
      if (this.isNotAvailable || !this.model.get('_patient_engagement')) return;

      Radio.request('sidebar', 'start', 'engagement', { patient: this.model });
    },
    onStatusNotAvailable(isNotAvailable) {
      this.isNotAvailable = isNotAvailable;
      this.render();
    },
  }),
  optionsWidget: {
    className: 'widgets-value',
    template: hbs`{{ displayValue }}{{#unless displayValue}}{{{ defaultHtml }}}{{/unless}}`,
    templateContext() {
      const defaultHtml = this.getOption('default_html');
      const value = getWidgetValue({
        fields: this.model.getFields(),
        name: this.getOption('field_name'),
        key: this.getOption('key'),
        childValue: this.getOption('childValue'),
      });
      const displayOptions = this.getOption('display_options');

      return {
        displayValue: displayOptions[value] || value,
        defaultHtml,
      };
    },
  },
  phoneWidget: {
    className: 'widgets-value',
    template: hbs`{{ displayValue }}{{#unless displayValue}}{{{ defaultHtml }}}{{/unless}}`,
    templateContext() {
      const defaultHtml = this.getOption('default_html');
      const value = getWidgetValue({
        fields: this.model.getFields(),
        name: this.getOption('field_name'),
        key: this.getOption('key'),
        childValue: this.getOption('childValue'),
      });
      if (!value) return { defaultHtml };

      const phone = parsePhoneNumber(value, 'US');

      return {
        displayValue: phone ? phone.formatNational() : null,
        defaultHtml,
      };
    },
  },
  fieldWidget: {
    className: 'widgets-value',
    template: hbs`{{ displayValue }}{{#unless displayValue}}{{{ defaultHtml }}}{{/unless}}`,
    templateContext() {
      const defaultHtml = this.getOption('default_html');
      const displayValue = getWidgetValue({
        fields: this.model.getFields(),
        name: this.getOption('field_name'),
        key: this.getOption('key'),
        childValue: this.getOption('childValue'),
      });
      return {
        displayValue,
        defaultHtml,
      };
    },
  },
  templateWidget: View.extend({
    className: 'widgets-value',
    initialize() {
      this.template = patientTemplate(this.template, this.getOption('childValue'));
      this.nestedWidgets = this.template.widgetNames;

      const widgetRegions = reduce(this.nestedWidgets, (regions, widgetName) => {
        regions[widgetName] = `[data-${ widgetName }-region]`;
        return regions;
      }, {});

      this.addRegions(widgetRegions);
    },
    serializeData() {
      return this.model;
    },
    onRender() {
      each(this.nestedWidgets, widgetName => {
        const widgetModel = Radio.request('entities', 'widgets:model', widgetName);
        const widget = sidebarWidgets[widgetModel.get('widget_type')];

        this.showChildView(widgetName, buildWidget(widget, this.model, widgetModel, { tagName: 'span' }));
      });
    },
  }),
  arrayWidget: CollectionView.extend({
    className: 'widgets-value',
    childWidget: {
      widget_type: 'fieldWidget',
      definition: {},
    },
    initialize(options) {
      const arrayValue = getWidgetValue({
        fields: this.model.getFields(),
        name: this.getOption('field_name'),
        key: this.getOption('key'),
        childValue: this.getOption('childValue'),
      });

      each(arrayValue, childValue => {
        const widgetModel = Radio.request('entities', 'widgets:model', options.child_widget || this.childWidget);
        const widget = sidebarWidgets[widgetModel.get('widget_type')];

        this.addChildView(buildWidget(widget, this.model, widgetModel, { childValue }));
      });
    },
    template: hbs`{{ defaultHtml }}`,
    templateContext() {
      const defaultHtml = this.getOption('default_html');

      return { defaultHtml };
    },
  }),
  formWidget: View.extend({
    className: 'button-primary patient-sidebar__form-widget',
    tagName: 'button',
    template: hbs`{{far "poll-h"}} {{formName}} {{far "expand-alt"}}`,
    templateContext() {
      return {
        formName: this.getOption('form_name'),
      };
    },
    triggers: {
      'click': 'click',
    },
    onClick() {
      Radio.trigger('event-router', 'form:patient', this.model.id, this.getOption('form_id'));
    },
  }),
  dateTimeWidget: {
    template: hbs`{{formatDateTime dateTime format inputFormat=inputFormat defaultHtml=defaultHtml}}`,
    templateContext() {
      const dateTime = getWidgetValue({
        fields: this.model.getFields(),
        name: this.getOption('field_name'),
        key: this.getOption('key'),
        childValue: this.getOption('childValue'),
      });

      return {
        format: this.getOption('format') || 'TIME_OR_DAY',
        inputFormat: this.getOption('input_format'),
        dateTime,
        defaultHtml: this.getOption('default_html'),
      };
    },
  },
};

const WidgetView = View.extend({
  className: 'patient-sidebar__section',
  template: hbs`{{#if definition.display_name}}<div class="patient-sidebar__heading">{{ definition.display_name }}</div>{{/if}}<div class="patient-sidebar__item" data-content-region></div>`,
  regions: {
    content: '[data-content-region]',
  },
  onRender() {
    const widget = this.getOption('widget');
    const patient = this.getOption('patient');

    this.showChildView('content', buildWidget(widget, patient, this.model));
  },
});

const NameView = View.extend({
  tagName: 'h1',
  className: 'patient-sidebar__name',
  template: hbs`{{ first_name }} {{ last_name }}`,
  modelEvents: {
    'change': 'render',
  },
});

const WidgetCollectionView = CollectionView.extend({
  childView: WidgetView,
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
  viewComparator: false,
});

const SidebarView = View.extend({
  className: 'patient-sidebar flex-region',
  template: hbs`
    <div data-name-region></div>
    <button class="button--icon patient-sidebar__menu js-menu">{{far "ellipsis-h"}}</button>
    <div data-widgets-region></div>
  `,
  regions: {
    name: '[data-name-region]',
    widgets: '[data-widgets-region]',
  },
  onRender() {
    this.showChildView('name', new NameView({
      model: this.model,
    }));

    this.showChildView('widgets', new WidgetCollectionView({
      model: this.model,
      collection: this.collection,
    }));
  },
  triggers: {
    'click @ui.menu': 'click:menu',
  },
  ui: {
    menu: '.js-menu',
  },
  onClickMenu() {
    const canEdit = this.model.canEdit();

    const menuOptions = new Backbone.Collection([
      {
        onSelect: bind(this.triggerMethod, this, canEdit ? 'click:patientEdit' : 'click:patientView'),
      },
    ]);

    const optionlist = new Optionlist({
      ui: this.ui.menu,
      uiView: this,
      headingText: i18n.menuOptions.headingText,
      itemTemplate: hbs`{{ text }}`,
      itemTemplateContext: {
        text: canEdit ? i18n.menuOptions.edit : i18n.menuOptions.view,
      },
      lists: [{ collection: menuOptions }],
      align: 'right',
      popWidth: 248,
    });

    optionlist.show();
  },
});

export {
  SidebarView,
};
