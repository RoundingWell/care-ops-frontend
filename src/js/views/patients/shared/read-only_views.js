import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';

import './patient-readonly.scss';

const ReadOnlyStateView = View.extend({
  tagName: 'span',
  className: 'patient-readonly patient-readonly__status',
  template: hbs`<span class="action--{{ stateOptions.color }}">{{fa stateOptions.iconType stateOptions.icon}}</span>{{~ remove_whitespace ~}}`,
  templateContext() {
    const stateOptions = this.model.getState().get('options');

    return {
      stateOptions,
    };
  },
});

const ReadOnlyOwnerView = View.extend({
  tagName: 'span',
  className: 'patient-readonly patient-readonly__owner',
  template: hbs`{{far "circle-user" classes="u-margin--r-8"}}<span>{{ owner }}</span>`,
  templateContext() {
    return {
      owner: this.model.getOwner().get('name'),
    };
  },
});

const ReadOnlyDueDateView = View.extend({
  tagName: 'span',
  className: 'patient-readonly',
  template: hbs`
    <span{{#if isOverdue}} class="is-overdue"{{/if}}>
      {{far "calendar-days"}}{{#if due_date}}<span class="u-margin--l-8">{{formatDateTime due_date "SHORT" inputFormat="YYYY-MM-DD"}}</span>{{/if}}
    </span>
  `,
  templateContext() {
    return {
      isOverdue: this.model.isOverdue(),
    };
  },
});

const ReadOnlyDueTimeView = View.extend({
  tagName: 'span',
  className: 'patient-readonly patient-readonly__time',
  template: hbs`{{far "clock"}}{{#if due_time}}<span class="u-margin--l-8">{{formatDateTime due_time "LT" inputFormat="HH:mm:ss"}}</span>{{/if}}`,
});

export {
  ReadOnlyStateView,
  ReadOnlyOwnerView,
  ReadOnlyDueDateView,
  ReadOnlyDueTimeView,
};
