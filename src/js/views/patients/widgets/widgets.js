import { each, propertyOf, reduce, extend, isFunction, find } from 'underscore';
import Radio from 'backbone.radio';
import { View } from 'marionette';
import dayjs from 'dayjs';

import hbs from 'handlebars-inline-precompile';

import Handlebars from 'handlebars/dist/cjs/handlebars';

import patientTemplate from 'js/utils/patient-template';

import './widgets.scss';

// NOTE: widget is a view or view definition
export function buildWidget(widget, patient, widgetModel, options) {
  if (isFunction(widget)) return new widget(extend({ model: patient, slug: widgetModel.get('slug') }, options, widgetModel.get('definition')));

  return new View(extend({ model: patient }, options, widgetModel.get('definition'), widget));
}

function getKeyValue(value, keys) {
  if (keys.length) {
    return propertyOf(value)(keys);
  }

  return value;
}

function getWidgetValue({ fields, name, key, childValue }) {
  const keys = key && key.split('.') || [];

  if (childValue) {
    return getKeyValue(childValue, keys);
  }

  // NOTE: Makes `field_name` optional
  if (keys.length && !name) name = keys.shift();

  const currentField = fields.find({ name });

  if (!currentField) return;

  return getKeyValue(currentField.getValue(), keys);
}

// NOTE: These widgets are documented in ./README.md

const widgets = {
  widget: View.extend({
    className: 'widgets-value',
    initialize() {
      const slug = this.getOption('slug');
      const widgetValues = Radio.request('entities', 'get:widgetValues:model', slug, this.model.id);
      this.values = widgetValues.get('values');

      this.template = Handlebars.compile(this.template);
    },
    serializeData() {
      return this.values;
    },
  }),
  dob: {
    modelEvents: {
      'change:birth_date': 'render',
    },
    template: hbs`{{formatHTMLMessage (intlGet "patients.widgets.widgets.dob") dob=(formatDateTime dob "LONG" inputFormat="YYYY-MM-DD") age=age}}`,
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
    template: hbs`{{formatMessage (intlGet "patients.widgets.widgets.sex") sex=sex}}`,
  },
  status: View.extend({
    template: hbs`<span class="widgets__status-{{ status }}">{{formatMessage (intlGet "patients.widgets.widgets.status") status=status}}</span>`,
    initialize() {
      this.workspacePatient = this.model.getWorkspacePatient();

      this.listenTo(this.workspacePatient, 'change:status', this.render);
    },
    templateContext() {
      return {
        status: this.workspacePatient.get('status'),
      };
    },
  }),
  divider: {
    template: hbs`<div class="widgets__divider"></div>`,
  },
  workspaces: {
    modelEvents: {
      'change:_workspaces': 'render',
    },
    template: hbs`{{#each workspaces}}<div>{{ this }}</div>{{/each}}`,
    templateContext() {
      return {
        workspaces: this.model.getWorkspaces().map('name'),
      };
    },
  },
  patientIdentifiers: {
    className: 'widgets-value',
    template: hbs`{{ displayValue }}{{#unless displayValue}}{{{ defaultHtml }}}{{/unless}}`,
    templateContext() {
      const defaultHtml = this.getOption('default_html');
      const identifiersArray = this.model.get('identifiers');
      const identifierType = this.getOption('identifier_type');

      const identifier = find(identifiersArray, { type: identifierType });

      return {
        displayValue: identifier && identifier.value,
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
      this.childValue = this.getOption('childValue');
      this.template = patientTemplate(this.template, this.childValue);
      this.nestedWidgets = this.template.slugs;

      const widgetRegions = reduce(this.nestedWidgets, (regions, slug) => {
        regions[slug] = `[data-${ slug }-region]`;
        return regions;
      }, {});

      this.addRegions(widgetRegions);
    },
    serializeData() {
      return this.model;
    },
    onRender() {
      each(this.nestedWidgets, slug => {
        const widgetModel = Radio.request('widgets', 'find', slug);
        const widget = widgets[widgetModel.get('category')];

        this.showChildView(slug, buildWidget(widget, this.model, widgetModel, { tagName: 'span', childValue: this.childValue }));
      });
    },
  }),
  formWidget: View.extend({
    className: 'button-primary widgets__form-widget',
    tagName: 'button',
    attributes() {
      return {
        disabled: this.getOption('is_modal'),
      };
    },
    template: hbs`
      {{far "square-poll-horizontal"}}
      <span class="u-text--overflow">{{formName}}</span>
      <span class="widgets__form-widget-expand-icon">{{fas "up-right-and-down-left-from-center"}}</span>`,
    templateContext() {
      return {
        formName: this.getOption('form_name'),
      };
    },
    initialize({ is_modal, form_id }) {
      if (is_modal) {
        const fetchForm = Radio.request('entities', 'fetch:forms:model', form_id);
        fetchForm.then(form => {
          this.form = form;
          this.$el.prop('disabled', false);
        });
      }
    },
    triggers: {
      'click': 'click',
    },
    onClick() {
      if (this.getOption('is_modal')) {
        Radio.request('modal', 'show:form', this.model, this.getOption('form_name'), this.form, this.getOption('modal_size'));
        return;
      }
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

widgets.groups = widgets.workspaces;

export default widgets;
