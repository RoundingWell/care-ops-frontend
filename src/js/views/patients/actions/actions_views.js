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
  new: 'dot-circle',
  needs_attention: 'exclamation-circle',
  open: 'dot-circle',
  pending: 'adjust',
  done: 'check-circle',
};

const StateTemplate = hbs`<span class="action--{{ statusClass }}">{{fas statusIcon}}{{#unless isCompact}}{{ name }}{{/unless}}</span>`;

const StateComponent = Droplist.extend({
  isCompact: false,
  initialize({ model }) {
    const currentOrg = Radio.request('auth', 'currentOrg');
    this.collection = currentOrg.getStates();
    this.setState({ selected: this.collection.get(model.get('_state')) });
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
      className: isCompact ? 'button--icon' : 'button--icon-label w-100',
      template: StateTemplate,
      templateContext() {
        const status = (this.model && this.model.get('status')) || 'new';

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
        buttonTemplate: hbs`<button class="button--icon-label table-list__button w-100"{{#if isDisabled}} disabled{{/if}}>{{far "user-circle"}}{{ short }}{{ first_name }} {{ lastInitial }}</button>`,
        templateContext() {
          return {
            isDisabled: this.getOption('isDisabled'),
            lastInitial() {
              return this.last_name && `${ this.last_name[0] }.`;
            },
          };
        },
      };
    }
    return {
      className: 'w-100 inl-bl',
      buttonTemplate: hbs`<button class="button--icon-label w-100"{{#if isDisabled}} disabled{{/if}}>{{far "user-circle"}}{{ name }}{{ first_name }} {{ last_name }}</button>`,
    };
  },
  initialize({ model }) {
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

    this.setState({ selected: model.getOwner() });
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
      className: isCompact ? 'button--icon-label table-list__button actions__due' : 'button--icon-label w-100 actions__due',
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
      <button class="button--icon-label w-100" {{#if isDisabled}} disabled{{/if}}>{{far "stopwatch"}}
      {{~#if duration}}{{ duration }}{{else}}{{ @intl.patients.actions.actionsViews.durationComponent.defaultText }}{{/if~}}
      </button>
    `,
  },
  picklistOptions: {
    attr: 'duration',
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
