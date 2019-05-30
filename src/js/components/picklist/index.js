import _ from 'underscore';
import { View, CollectionView } from 'marionette';

import hbs from 'handlebars-inline-precompile';

import Component from 'js/base/component';

import './picklist.scss';

import PicklistBehavior from 'js/behaviors/picklist-transport';

const ListTemplate = hbs`
  {{#if headingText}}<div class="picklist__heading">{{headingText}}</div>{{/if}}
  <ul></ul>
`;

const CLASS_OPTIONS = [
  'attr',
  'childViewEventPrefix',
  'headingText',
  'lists',
  'noResultsText',
  'PicklistItem',
];

const PicklistEmpty = View.extend({
  tagName: 'li',
  className: 'picklist--no-results',
  template: hbs`{{ noResultsText }}`,
  serializeData() {
    return this.options;
  },
});

const PicklistItem = View.extend({
  className: 'picklist__item js-picklist-item',
  tagName: 'li',
  template: hbs`<a{{#if isSelected}} class="is-selected"{{/if}}>{{matchText text query}}</a>`,
  triggers: {
    'click': 'select',
  },
  initialize(options) {
    this.mergeOptions(options, ['state', 'attr']);
  },
  onRender() {
    this.searchText = this.$el.text();
  },
  templateContext() {
    return {
      text: this.model.get(this.attr),
      query: this.state.get('query'),
      isSelected: this.model === this.state.get('selected'),
    };
  },
});

const Picklist = CollectionView.extend({
  tagName: 'li',
  template: ListTemplate,
  serializeCollection: _.noop,
  childViewContainer: 'ul',
  modelEvents: {
    'change:query': 'filter',
  },
  viewFilter(view) {
    view.render();
    const query = this.model.get('query');
    return !query || !view.searchText || _.hasText(view.searchText, query);
  },
  childViewOptions() {
    return {
      state: this.model,
      attr: this.getOption('attr'),
    };
  },
  templateContext() {
    return {
      headingText: this.getOption('headingText'),
    };
  },
});

const Picklists = CollectionView.extend({
  behaviors: [
    PicklistBehavior,
  ],
  template: ListTemplate,
  serializeCollection: _.noop,
  childViewContainer: 'ul',
  emptyView: PicklistEmpty,
  initialize(options) {
    this.mergeOptions(options, CLASS_OPTIONS);

    _.each(this.lists, this.addList, this);
  },
  addList({ collection, eventPrefix, headingText }) {
    const picklist = new Picklist({
      attr: this.attr,
      model: this.model,
      childView: this.PicklistItem,
      childViewEventPrefix: eventPrefix || 'item',
      collection,
      headingText,
    });

    picklist.render();

    this.addChildView(picklist);
  },
  viewFilter(childView) {
    return !!childView.children.length;
  },
  childViewEvents: {
    'filter': 'filter',
  },
  emptyViewOptions() {
    return { noResultsText: this.noResultsText };
  },
  templateContext() {
    return { headingText: this.headingText };
  },
});

export default Component.extend({
  PicklistItem,
  attr: 'text',
  className: 'picklist',
  childViewEventPrefix: 'picklist',
  headingText: '',
  noResultsText: '',
  constructor(options) {
    this.mergeOptions(options, CLASS_OPTIONS);
    Component.apply(this, arguments);
  },
  viewOptions() {
    const opts = _.pick(this, 'className', ...CLASS_OPTIONS);
    return _.extend({ model: this.getState() }, opts);
  },
  ViewClass: Picklists,
});
