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

import 'sass/domain/action-state.scss';
import './actions.scss';

const i18n = intl.patients.actions.actionsViews;

const StatusIcons = {
  queued: 'exclamation-circle',
  started: 'dot-circle',
  done: 'check-circle',
};

const StateTemplate = hbs`<span class="action--{{ statusClass }}">{{fas statusIcon}}{{#unless isCompact}}{{ name }}{{/unless}}</span>`;

const StateComponent = Droplist.extend({
  isCompact: false,
  initialize({ model }) {
    const currentOrg = Radio.request('bootstrap', 'currentOrg');
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
    headingText: i18n.stateComponent.headingText,
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

const OwnerItemTemplate = hbs`<a{{#if isSelected}} class="is-selected"{{/if}}>{{matchText name query}} <span class="actions__role">{{matchText short query}}</span></a>`;

const OwnerComponent = Droplist.extend({
  isCompact: false,
  popWidth() {
    const isCompact = this.getOption('isCompact');

    return isCompact ? null : this.getView().$el.outerWidth();
  },
  picklistOptions: _.extend({
    isSelectlist: true,
  }, i18n.ownerComponent),
  viewOptions() {
    if (this.getOption('isCompact')) {
      return {
        className: 'actions__owner button-secondary--compact w-100',
        template: hbs`{{far "user-circle"}}{{ short }}{{ first_name }} {{ lastInitial }}`,
        templateContext() {
          return {
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
      className: 'button-secondary w-100',
      template: hbs`{{far "user-circle"}}{{ name }}{{ first_name }} {{ last_name }}`,
    };
  },
  initialize({ model }) {
    const currentOrg = Radio.request('bootstrap', 'currentOrg');
    const roles = currentOrg.getRoles();
    const currentUser = Radio.request('bootstrap', 'currentUser');
    const groups = currentUser.getGroups();

    this.lists = groups.map(group => {
      return {
        collection: group.getClinicians(),
        headingText: group.get('name'),
        itemTemplate: OwnerItemTemplate,
        itemTemplateContext() {
          return {
            name: `${ this.model.get('first_name') } ${ this.model.get('last_name') }`,
            short: this.model.getRole().get('short'),
          };
        },
        getItemSearchText() {
          return this.$el.text();
        },
      };
    });

    this.lists.push({
      collection: roles,
      itemTemplate: OwnerItemTemplate,
      headingText: i18n.ownerComponent.rolesHeadingText,
      getItemSearchText() {
        return this.$el.text();
      },
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
        defaultText: isCompact ? '' : i18n.dueComponent.defaultText,
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
    this.listenTo(model, 'change:due_date', () => {
      this.show();
    });
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

const DurationComponent = Droplist.extend({
  getTemplate() {
    if (!this.getState('selected').get('duration')) {
      return hbs`{{far "stopwatch"}}{{ @intl.patients.actions.actionsViews.durationComponent.defaultText }}`;
    }
    return hbs`{{far "stopwatch"}}{{ duration }} {{ @intl.patients.actions.actionsViews.durationComponent.unitLabel }}`;
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
      const duration = item.get('duration');

      if (duration) {
        return `${ item.get('duration') } ${ i18n.durationComponent.unitLabel }`;
      }

      // 0 min
      return i18n.durationComponent.clear;
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
