import _ from 'underscore';
import moment from 'moment';
import Handlebars from 'handlebars/runtime';
import Backbone from 'backbone';
import Radio from 'backbone.radio';
import hbs from 'handlebars-inline-precompile';
import { Component } from 'marionette.toolkit';

import 'sass/modules/buttons.scss';
import 'sass/modules/table-list.scss';

import intl from 'js/i18n';

import Datepicker from 'js/components/datepicker';
import Droplist from 'js/components/droplist';
import Selectlist from 'js/components/selectlist';

import 'sass/domain/action-state.scss';
import './actions.scss';

const StatusIcons = {
  needs_attention: 'exclamation-circle',
  open: 'dot-circle',
  pending: 'adjust',
  done: 'check-circle',
};

const StateTemplate = hbs`<span class="action--{{ statusClass }}">{{fas statusIcon}}{{#unless isCompact}}{{ name }}{{/unless}}</span>`;

const StateComponent = Droplist.extend({
  isCompact: false,
  initialize({ model }) {
    this.model = model;
    const currentOrg = Radio.request('auth', 'currentOrg');
    this.collection = currentOrg.getStates();
    this.listenTo(model, 'change:_state', () => {
      this.setSelected();
      this.show();
    });
    this.setSelected();
  },
  setSelected() {
    this.setState({ selected: this.collection.get(this.model.get('_state')) }, { silent: true });
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

    return {
      className: isCompact ? 'button-secondary--compact is-icon-only' : 'button-secondary w-100',
      template: StateTemplate,
      templateContext() {
        const status = this.model.get('status');

        return {
          isDisabled: this.getOption('isDisabled'),
          statusClass: _.dasherize(status),
          statusIcon: StatusIcons[status],
          isCompact,
        };
      },
    };
  },
  picklistOptions: {
    headingText: intl.patients.actions.actionsViews.stateComponent.headingText,
    getItemFormat(model) {
      const status = model.get('status');

      return new Handlebars.SafeString(StateTemplate({
        statusClass: _.dasherize(status),
        statusIcon: StatusIcons[status],
        name: model.get('name'),
      }));
    },
  },
});

const OwnerComponent = Selectlist.extend({
  isCompact: false,
  popWidth() {
    const isCompact = this.getOption('isCompact');

    return isCompact ? null : this.getView().$el.outerWidth();
  },
  picklistOptions: intl.patients.actions.actionsViews.ownerComponent,
  viewOptions() {
    if (this.getOption('isCompact')) {
      return {
        className: 'actions__owner',
        buttonTemplate: hbs`<button class="button-secondary--compact w-100"{{#if isDisabled}} disabled{{/if}}>{{far "user-circle"}}{{ short }}{{ first_name }} {{ lastInitial }}</button>`,
        templateContext() {
          return {
            isDisabled: this.getOption('state').isDisabled,
            lastInitial() {
              return this.last_name && `${ this.last_name[0] }.`;
            },
          };
        },
      };
    }
    return {
      modelEvents: {
        'change:_role change:_clinician': 'render',
      },
      className: 'w-100 inl-bl',
      buttonTemplate: hbs`<button class="button-secondary w-100"{{#if isDisabled}} disabled{{/if}}>{{far "user-circle"}}{{ name }}{{ first_name }} {{ last_name }}</button>`,
    };
  },
  initialize({ model }) {
    this.model = model;
    const currentOrg = Radio.request('auth', 'currentOrg');
    const roles = currentOrg.getRoles();
    const currentUser = Radio.request('auth', 'currentUser');
    const groups = currentUser.getGroups();

    this.lists = groups.map(group => {
      return {
        collection: group.getClinicians(),
        headingText: group.get('name'),
        getItemFormat(clinician) {
          return `${ clinician.get('first_name') } ${ clinician.get('last_name') }`;
        },
      };
    });

    this.lists.push({
      attr: 'name',
      collection: roles,
      headingText: intl.patients.actions.actionsViews.ownerComponent.rolesHeadingText,
    });

    this.listenTo(model, 'change:_role change:_clinician', (action, id) => {
      if (!id) return;
      this.setSelected();
      this.show();
    });

    this.setSelected();
  },
  setSelected() {
    this.setState({ selected: this.model.getOwner() }, { silent: true });
  },
  onChangeSelected(selected) {
    this.triggerMethod('change:owner', selected);
  },
});

const DueComponent = Component.extend({
  isCompact: false,
  viewOptions() {
    const isCompact = this.getOption('isCompact');
    return {
      model: this.model,
      tagName: 'button',
      attributes() {
        return {
          disabled: this.getOption('state').isDisabled,
        };
      },
      className() {
        const dueDate = this.model.get('due_date');

        if (isCompact && dueDate) {
          return 'button-secondary--compact actions__due';
        }

        if (isCompact && !dueDate) {
          return 'button-secondary--compact actions__due is-icon-only';
        }

        return 'button-secondary w-100 actions__due';
      },
      triggers: {
        'click': 'click',
      },
      template: hbs`
        <span{{#if isOverdue}} class="is-overdue"{{/if}}>
          {{far "calendar-alt"}}{{formatMoment due_date dateFormat inputFormat="YYYY-MM-DD" defaultHtml=defaultText}}
        </span>
      `,
      templateContext: {
        defaultText: isCompact ? '' : intl.patients.actions.actionsViews.dueComponent.defaultText,
        dateFormat: isCompact ? 'SHORT' : 'LONG',
        isOverdue() {
          if (!this.due_date) return;
          return moment(this.due_date).isBefore(moment(), 'day');
        },
      },
    };
  },
  viewEvents: {
    'click': 'onClick',
  },
  initialize({ model }) {
    this.model = model;
    this.listenTo(model, 'change:due_date', this.show);
  },
  onClick() {
    this.getView().$el.blur();

    const datepicker = new Datepicker({
      uiView: this.getView(),
      state: { selectedDate: this.model.get('due_date') },
    });

    this.listenTo(datepicker, 'change:selectedDate', date => {
      this.triggerMethod('change:due', date);
      datepicker.destroy();
    });

    datepicker.show();
  },
});

const durations = _.map(_.range(100), function(duration) {
  return { duration };
});

const DurationComponent = Selectlist.extend({
  viewOptions: {
    className: 'w-100 inl-bl',
    buttonTemplate: hbs`
      <button class="button-secondary w-100" {{#if isDisabled}} disabled{{/if}}>{{far "stopwatch"}}
      {{~#if duration}}{{ duration }} {{ @intl.patients.actions.actionsViews.durationComponent.unitLabel }}{{else}}{{ @intl.patients.actions.actionsViews.durationComponent.defaultText }}{{/if~}}
      </button>
    `,
  },
  picklistOptions: {
    getItemFormat(item) {
      const duration = item.get('duration');

      if (duration) {
        return `${ item.get('duration') } ${ intl.patients.actions.actionsViews.durationComponent.unitLabel }`;
      }

      // 0 min
      return intl.patients.actions.actionsViews.durationComponent.clear;
    },
  },
  initialize({ model }) {
    this.collection = new Backbone.Collection(durations);
    const selected = this.collection.find({ duration: model.get('duration') });

    this.setState({ selected });
  },
  popWidth() {
    return this.getView().$el.outerWidth();
  },
  onChangeSelected(selected) {
    this.triggerMethod('change:duration', selected.get('duration'));
  },
});

export {
  StateComponent,
  OwnerComponent,
  DueComponent,
  DurationComponent,
};
