import _ from 'underscore';
import moment from 'moment';
import Handlebars from 'handlebars/runtime';
import Backbone from 'backbone';
import Radio from 'backbone.radio';
import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';
import { Component } from 'marionette.toolkit';

import 'sass/modules/buttons.scss';
import 'sass/modules/table-list.scss';

import intl from 'js/i18n';

import Datepicker from 'js/components/datepicker';
import Droplist from 'js/components/droplist';

import 'sass/domain/action-state.scss';
import './actions.scss';

const i18n = intl.patients.actions.actionsViews;

import { PatientStatusIcons } from 'js/static';

const StateTemplate = hbs`<span class="action--{{ statusClass }}">{{fas statusIcon}}{{#unless isCompact}}{{ name }}{{/unless}}</span>`;

let statesCollection;

function getStates() {
  if (statesCollection) return statesCollection;
  const currentOrg = Radio.request('bootstrap', 'currentOrg');
  statesCollection = currentOrg.getStates();
  return statesCollection;
}

let rolesCollection;

function getRoles() {
  if (rolesCollection) return rolesCollection;
  const currentOrg = Radio.request('bootstrap', 'currentOrg');
  rolesCollection = currentOrg.getActiveRoles();
  return rolesCollection;
}

const StateComponent = Droplist.extend({
  isCompact: false,
  initialize({ stateId }) {
    this.collection = getStates();
    this.setState({ selected: this.collection.get(stateId) });
  },
  onChangeSelected(selected) {
    this.triggerMethod('change:state', selected);
  },
  popWidth() {
    const isCompact = this.getOption('isCompact');

    return isCompact ? null : this.getView().$el.outerWidth();
  },
  viewOptions() {
    const isCompact = this.getOption('isCompact');
    const status = this.getState('selected').get('status');

    return {
      className: isCompact ? 'button-secondary--compact is-icon-only' : 'button-secondary w-100',
      template: StateTemplate,
      templateContext: {
        statusClass: status,
        statusIcon: PatientStatusIcons[status],
        isCompact,
      },
    };
  },
  picklistOptions: {
    headingText: i18n.stateComponent.headingText,
    getItemFormat(model) {
      const status = model.get('status');

      return new Handlebars.SafeString(StateTemplate({
        statusClass: status,
        statusIcon: PatientStatusIcons[status],
        name: model.get('name'),
      }));
    },
  },
});

const FlowStateComponent = StateComponent.extend({
  onPicklistSelect({ model }) {
    // Selected done
    if (model.get('status') === 'done') {
      this.shouldSelectDone(model);
      return;
    }

    this.setSelectedStatus(model);
  },
  shouldSelectDone(model) {
    const flow = this.getOption('flow');

    if (flow.isAllDone()) {
      this.setSelectedStatus(model);
      return;
    }

    // We must hide the droplist before showing the modal
    this.popRegion.empty();

    const modal = Radio.request('modal', 'show:small', {
      bodyText: i18n.doneModal.bodyText,
      headingText: i18n.doneModal.headingText,
      submitText: i18n.doneModal.submitText,
      buttonClass: 'button--green',
      onSubmit: () => {
        this.setSelectedStatus(model);
        modal.destroy();
      },
    });
  },
  setSelectedStatus(model) {
    this.setState('selected', model);
    this.popRegion.empty();
  },
});

const OwnerItemTemplate = hbs`<a{{#if isSelected}} class="is-selected"{{/if}}>{{matchText name query}} <span class="actions__role">{{matchText short query}}</span></a>`;
const OwnerButtonTemplate = hbs`{{far "user-circle"}}{{ name }}`;
const OwnerShortButtonTemplate = hbs`{{far "user-circle"}}{{ short }}`;

// Caching for single renders
let groupCache = {};

function getGroupClinicians(group) {
  if (groupCache[group.id]) return groupCache[group.id];
  groupCache[group.id] = group.getActiveClinicians();
  return groupCache[group.id];
}

const OwnerComponent = Droplist.extend({
  isCompact: false,
  popWidth() {
    const isCompact = this.getOption('isCompact');

    return isCompact ? null : this.getView().$el.outerWidth();
  },
  picklistOptions: {
    itemTemplate: OwnerItemTemplate,
    itemTemplateContext() {
      const isRole = this.model.type === 'roles';
      return {
        short: !isRole && this.model.getRole().get('short'),
      };
    },
    getItemSearchText() {
      return this.$el.text();
    },
    isSelectlist: true,
    headingText: i18n.ownerComponent.headingText,
    placeholderText: i18n.ownerComponent.placeholderText,
  },
  viewOptions() {
    const isCompact = this.getOption('isCompact');
    const selected = this.getState('selected');
    const isRole = selected.type === 'roles';

    return {
      className: isCompact ? 'actions__owner button-secondary--compact w-100' : 'button-secondary w-100',
      template: (isCompact && isRole) ? OwnerShortButtonTemplate : OwnerButtonTemplate,
    };
  },

  initialize({ owner, groups }) {
    this.lists = groups.map(group => {
      return {
        collection: getGroupClinicians(group),
        headingText: group.get('name'),
      };
    });

    this.lists.push({
      collection: getRoles(),
      headingText: i18n.ownerComponent.rolesHeadingText,
    });

    this.setState({ selected: owner });
  },
  onDestroy() {
    // NOTE: overzealously clearing the cache
    groupCache = {};
  },
  onChangeSelected(selected) {
    this.triggerMethod('change:owner', selected);
  },
});

const DueDayTemplate = hbs`
  <span{{#if isOverdue}} class="is-overdue"{{/if}}>
    {{far "calendar-alt"}}{{formatMoment date dateFormat inputFormat="YYYY-MM-DD" defaultHtml=defaultText}}
  </span>
`;

const DueDayComponent = Component.extend({
  viewEvents: {
    'click': 'onClick',
  },
  onClick() {
    this.toggleState('isActive');
  },
  stateEvents: {
    'change:isDisabled': 'onChangeIsDisabled',
    'change:isActive': 'onChangeIsActive',
    'change:selected': 'onChangeStateSelected',
  },
  isCompact: false,
  onChangeIsDisabled() {
    this.show();
  },
  onChangeIsActive(state, isActive) {
    const view = this.getView();
    view.$el.toggleClass('is-active', isActive);

    if (!isActive) return;

    // blur off the button so enter won't trigger select repeatedly
    view.$el.blur();

    this.showDatepicker();
  },
  onChangeStateSelected(state, selected) {
    this.show();
    this.triggerMethod('change:due', selected);
  },
  viewOptions() {
    const isCompact = this.getOption('isCompact');
    const selected = this.getState('selected');
    return {
      tagName: 'button',
      attributes: {
        disabled: this.getState('isDisabled'),
      },
      className() {
        if (isCompact && selected) {
          return 'button-secondary--compact actions__due';
        }

        if (isCompact && !selected) {
          return 'button-secondary--compact actions__due is-icon-only';
        }

        return 'button-secondary w-100 actions__due';
      },
      triggers: {
        'click': 'click',
      },
      template: DueDayTemplate,
      templateContext: {
        defaultText: isCompact ? '' : i18n.dueDayComponent.defaultText,
        dateFormat: isCompact ? 'SHORT' : 'LONG',
        date: selected,
        isOverdue: selected ? moment(selected).isBefore(moment(), 'day') : false,
      },
    };
  },
  initialize({ date }) {
    this.setState({ selected: date });
  },
  showDatepicker() {
    const datepicker = new Datepicker({
      uiView: this.getView(),
      state: { selectedDate: this.getState('selected') },
    });

    this.listenTo(datepicker, {
      'change:selectedDate'(date) {
        this.setState('selected', date);
        datepicker.destroy();
      },
      'destroy': this.onDatepickerDestroy,
    });

    datepicker.show();
  },
  onDatepickerDestroy() {
    this.toggleState('isActive', false);
  },
});

// Every 15 mins for 24 hours starting at 7am
const start = moment({ hour: 6, minute: 45, second: 0 });

const times = _.times(96, function() {
  return { id: start.add(15, 'minutes').format('HH:mm:ss') };
});

times.unshift({ id: 0 });

const NoTimeCompactTemplate = hbs`{{far "clock"}}`;

const TimeTemplate = hbs`{{far "clock"}} {{formatMoment id "LT" inputFormat="HH:mm:ss" defaultHtml=(intlGet "patients.actions.actionsViews.dueTimeComponent.placeholderText")}}`;

const DueTimeComponent = Droplist.extend({
  collection: new Backbone.Collection(times),
  align: 'right',
  popWidth: 192,
  isCompact: false,
  isSelectlist: true,
  getClassName(time, isCompact) {
    if (!time && isCompact) {
      return 'button-secondary--compact actions__time is-icon-only';
    }
    if (isCompact) {
      return 'button-secondary--compact actions__time ';
    }

    return 'button-secondary actions__time w-100';
  },
  getTemplate(time, isCompact) {
    if (!time && isCompact) {
      return NoTimeCompactTemplate;
    }

    return TimeTemplate;
  },
  viewOptions() {
    const isCompact = this.getOption('isCompact');
    const time = this.getState('selected').id;

    return {
      className: this.getClassName(time, isCompact),
      template: this.getTemplate(time, isCompact),
    };
  },
  picklistOptions: {
    headingText: i18n.dueTimeComponent.headingText,
    placeholderText: i18n.dueTimeComponent.placeholderText,
    isSelectlist: true,
    getItemFormat(item) {
      const time = item.id;

      if (!time) {
        return i18n.dueTimeComponent.clear;
      }

      return moment(time, 'HH:mm:ss').format('LT');
    },
  },
  initialize({ time }) {
    const selected = this.collection.get(time || 0);

    this.setState({ selected });
  },
  onChangeSelected(selected) {
    this.triggerMethod('change:due_time', selected.id || null);
  },
});

const durations = _.map(_.range(100), function(duration) {
  return { id: duration };
});

const NoDurationTemplate = hbs`{{far "stopwatch"}}{{ @intl.patients.actions.actionsViews.durationComponent.defaultText }}`;

const DurationTemplate = hbs`{{far "stopwatch"}}{{ id }} {{ @intl.patients.actions.actionsViews.durationComponent.unitLabel }}`;

const DurationComponent = Droplist.extend({
  collection: new Backbone.Collection(durations),
  getTemplate() {
    if (!this.getState('selected').id) {
      return NoDurationTemplate;
    }
    return DurationTemplate;
  },
  viewOptions() {
    return {
      className: 'button-secondary w-100',
      template: this.getTemplate(),
    };
  },
  picklistOptions: {
    headingText: i18n.durationComponent.headingText,
    placeholderText: i18n.durationComponent.placeholderText,
    isSelectlist: true,
    getItemFormat(item) {
      const duration = item.id;

      if (duration) {
        return `${ duration } ${ i18n.durationComponent.unitLabel }`;
      }

      // 0 min
      return i18n.durationComponent.clear;
    },
  },
  initialize({ duration }) {
    const selected = this.collection.get(duration || 0);

    this.setState({ selected });
  },
  popWidth() {
    return this.getView().$el.outerWidth();
  },
  onChangeSelected(selected) {
    this.triggerMethod('change:duration', selected.id);
  },
});

const AttachmentButton = View.extend({
  className: 'button-secondary--compact is-icon-only',
  tagName: 'button',
  template: hbs`{{far "link"}}`,
  triggers: {
    'click': 'click',
  },
  onClick() {
    Radio.trigger('event-router', 'form:patientAction', this.model.id, this.model.getForm().id);
  },
});

export {
  StateComponent,
  FlowStateComponent,
  OwnerComponent,
  DueDayComponent,
  DueTimeComponent,
  DurationComponent,
  AttachmentButton,
};
