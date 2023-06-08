import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';

import './patient-readonly.scss';

const ReadOnlyStateView = View.extend({
  tagName: 'span',
  className() {
    if (this.getOption('isCompact')) return 'patient-readonly--compact patient-readonly__status';
    return 'patient-readonly w-100';
  },
  template: hbs`<span class="action--{{ stateOptions.color }}">{{fa stateOptions.iconType stateOptions.icon}}{{#unless isCompact}}<span class="u-margin--l-8">{{ stateName }}</span>{{/unless}}</span>{{~ remove_whitespace ~}}`,
  templateContext() {
    const state = this.model.getState();
    const isCompact = this.getOption('isCompact');

    return {
      isCompact,
      stateOptions: state.get('options'),
      stateName: state.get('name'),
    };
  },
});

const ReadOnlyOwnerView = View.extend({
  tagName: 'span',
  className() {
    if (this.getOption('isCompact')) return 'patient-readonly--compact patient-readonly__owner';
    return 'patient-readonly patient-readonly__owner w-100';
  },
  template: hbs`{{far "circle-user" classes="u-margin--r-8"}}<span>{{ owner }}</span>`,
  templateContext() {
    return {
      owner: this.model.getOwner().get('name'),
    };
  },
});

const ReadOnlyDueDateView = View.extend({
  tagName: 'span',
  className() {
    if (this.getOption('isCompact')) return 'patient-readonly--compact';
    return 'patient-readonly w-100';
  },
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
  className() {
    if (this.getOption('isCompact')) return 'patient-readonly--compact patient-readonly__time';
    return 'patient-readonly patient-readonly__time w-100';
  },
  template: hbs`{{far "clock"}}{{#if due_time}}<span class="u-margin--l-8">{{formatDateTime due_time "LT" inputFormat="HH:mm:ss"}}</span>{{/if}}`,
});

export {
  ReadOnlyStateView,
  ReadOnlyOwnerView,
  ReadOnlyDueDateView,
  ReadOnlyDueTimeView,
};
