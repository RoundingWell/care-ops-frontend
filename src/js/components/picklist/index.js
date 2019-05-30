import _ from 'underscore';
import { View, CollectionView } from 'marionette';

import hbs from 'handlebars-inline-precompile';

import Component from 'js/base/component';

import './picklist.scss';

import PicklistBehavior from 'js/behaviors/picklist-transport';

const ListTemplate = hbs`
  {{#if headingText}}<div class="picklist__heading">{{ headingText }}</div>{{/if}}
  <ul></ul>
`;

const CLASS_OPTIONS = [
  'childViewEventPrefix',
  'className',
  'headingText',
  'lists',
  'noResultsText',
  'PicklistItem',
];

const CLASS_OPTIONS_ITEM = [
  'getItemFormat',
  'getItemSearchText',
  'itemAttr',
  'itemTemplate',
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
  tagName: 'li',
  className: 'picklist__item js-picklist-item',
  template: hbs`<a{{#if isSelected}} class="is-selected"{{/if}}>{{matchText text query}}</a>`,
  triggers: {
    'click': 'select',
  },
  initialize(options) {
    this.mergeOptions(options, ['state', ...CLASS_OPTIONS_ITEM]);
  },
  onRender() {
    this.searchText = this.getItemSearchText(this.model);
  },
  templateContext() {
    return {
      text: this.getItemFormat(this.model),
      query: this.state.get('query'),
      isSelected: this.model === this.state.get('selected'),
    };
  },
  getItemFormat(item) {
    return item.get(this.itemAttr);
  },
  getItemSearchText(item) {
    return this.getItemFormat(item);
  },
  getTemplate() {
    return this.itemTemplate || this.template;
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
  initialize(options) {
    this.mergeOptions(options, CLASS_OPTIONS_ITEM);
  },
  childViewOptions() {
    const opts = _.pick(this, ...CLASS_OPTIONS_ITEM);
    return _.extend({ state: this.model }, opts);
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
    this.mergeOptions(options, CLASS_OPTIONS_ITEM);

    _.each(this.lists, this.addList, this);
  },
  addList({ collection, eventPrefix, headingText }) {
    const picklist = new Picklist({
      itemAttr: this.itemAttr,
      getItemFormat: this.getItemFormat,
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
  itemAttr: 'text',
  className: 'picklist',
  childViewEventPrefix: 'picklist',
  headingText: '',
  noResultsText: '',
  constructor(options) {
    this.mergeOptions(options, CLASS_OPTIONS);
    this.mergeOptions(options, CLASS_OPTIONS_ITEM);

    Component.apply(this, arguments);
  },
  viewOptions() {
    const opts = _.pick(this, ...CLASS_OPTIONS, ...CLASS_OPTIONS_ITEM);
    return _.extend({ model: this.getState() }, opts);
  },
  ViewClass: Picklists,
});
