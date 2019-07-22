import _ from 'underscore';
import Handlebars from 'handlebars/runtime';
import Radio from 'backbone.radio';
import hbs from 'handlebars-inline-precompile';
import { Component } from 'marionette.toolkit';

import 'sass/modules/buttons.scss';

import Datepicker from 'js/components/datepicker';
import Droplist from 'js/components/droplist';
import Selectlist from 'js/components/selectlist';

const StatusIcons = {
  needs_attention: 'exclamation-circle',
  open: 'dot-circle',
  pending: 'adjust',
  done: 'check-circle',
};

const StateTemplate = hbs`<span class="action--{{ statusClass }}">{{fas statusIcon}}{{#unless isCompact}} {{ name }}{{/unless}}</span>`;

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
  viewOptions() {
    const isCompact = this.getOption('isCompact');

    return {
      className: 'button--white',
      template: StateTemplate,
      templateContext() {
        const status = this.model.get('status');

        return {
          statusClass: _.dasherize(status),
          statusIcon: StatusIcons[status],
          isCompact,
        };
      },
    };
  },
  picklistOptions: {
    headingText: 'Update Action State',
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
  picklistOptions: {
    headingText: 'Update Action Owner',
    noResultsText: 'No Results',
  },
  viewOptions() {
    if (this.getOption('isCompact')) {
      return {
        className: 'w-30 inl-bl',
        buttonTemplate: hbs`<button class="button--white w-100">{{far "user-circle"}} {{ short }}{{ first_name }} {{ lastInitial }}</button>`,
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
      className: 'w-50 inl-bl',
      buttonTemplate: hbs`<button class="button--white w-100 inl-bl">{{far "user-circle"}} {{ name }}{{ first_name }} {{ last_name }}</button>`,
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
      headingText: 'Roles',
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
    const dateFormat = this.getOption('isCompact') ? 'SHORT' : 'LONG';
    return {
      model: this.model,
      tagName: 'button',
      className: 'button--white',
      triggers: {
        'click': 'click',
      },
      template: hbs`
        <span class="u-margin--r-ser">{{far "calendar-alt"}}</span>
        {{formatMoment due_date dateFormat inputFormat="YYYY-MM-DD" defaultHtml="&mdash;"}}
      `,
      templateContext: {
        dateFormat,
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

export {
  StateComponent,
  OwnerComponent,
  DueComponent,
};
