import _ from 'underscore';
import hbs from 'handlebars-inline-precompile';
import { View, CollectionView } from 'marionette';

import 'sass/modules/forms.scss';

import intl from 'js/i18n';

import Component from 'js/base/component';

import './picklist.scss';

import InputWatcherBehavior from 'js/behaviors/input-watcher';
import PicklistBehavior from 'js/behaviors/picklist-transport';

const CLASS_OPTIONS = [
  'attr',
  'childViewEventPrefix',
  'className',
  'headingText',
  'isSelectlist',
  'lists',
  'noResultsText',
  'PicklistItem',
  'placeholderText',
];

const CLASS_OPTIONS_ITEM = [
  'attr',
  'getItemFormat',
  'getItemSearchText',
  'itemTemplate',
  'itemTemplateContext',
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
  itemTemplate: hbs`<a{{#if isSelected}} class="is-selected"{{/if}}>{{matchText text query}}</a>`,
  triggers: {
    'click': 'select',
  },
  initialize(options) {
    this.mergeOptions(options, ['state', ...CLASS_OPTIONS_ITEM]);
  },
  onRender() {
    this.searchText = this.getItemSearchText(this.model);
  },
  itemTemplateContext: _.noop,
  templateContext() {
    return _.extend({
      text: this.getItemFormat(this.model),
      query: this.state.get('query'),
      isSelected: this.model === this.state.get('selected'),
    }, _.result(this, 'itemTemplateContext'));
  },
  getItemFormat(item) {
    return item.get(this.attr);
  },
  getItemSearchText(item) {
    return this.getItemFormat(item);
  },
  getTemplate() {
    return this.itemTemplate;
  },
});

const Picklist = CollectionView.extend({
  tagName: 'li',
  template: hbs`
    {{#if headingText}}<div class="picklist__heading">{{ headingText }}</div>{{/if}}
    <ul></ul>
  `,
  serializeCollection: _.noop,
  childViewContainer: 'ul',
  childViewEventPrefix: 'item',
  modelEvents: {
    'change:query': 'filter',
  },
  viewFilter(view) {
    view.render();
    const query = this.model.get('query');
    return !query || !view.searchText || _.hasAllText(view.searchText, query);
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
    InputWatcherBehavior,
    PicklistBehavior,
  ],
  template: hbs`
    {{#if headingText}}<div class="picklist__heading u-margin--b-8">{{ headingText }}</div>{{/if}}
    {{#if isSelectlist}}<input type="text" class="js-input picklist__input input-primary--small" placeholder="{{ placeholderText }}">{{/if}}
    <ul></ul>
  `,
  triggers: {
    'focus @ui.input': 'focus',
  },
  ui: { input: '.js-input' },
  onDomRefresh() {
    this.ui.input.focus();
  },
  serializeCollection: _.noop,
  childViewContainer: 'ul',
  emptyView: PicklistEmpty,
  initialize(options) {
    this.mergeOptions(options, CLASS_OPTIONS);
    this.mergeOptions(options, CLASS_OPTIONS_ITEM);

    this.debouncedFilter = _.debounce(this.filter, 1);

    _.each(this.lists, this.addList, this);
  },
  addList(list) {
    const options = _.extend({
      model: this.model,
      childView: this.PicklistItem,
    }, _.pick(this, ...CLASS_OPTIONS_ITEM), list);

    const picklist = new Picklist(options);

    picklist.render();

    this.addChildView(picklist);
  },
  viewFilter(childView) {
    return !!childView.children.length;
  },
  childViewEvents: {
    'filter'() {
      return this.debouncedFilter();
    },
  },
  onRenderChildren() {
    this.$('.js-picklist-item').removeClass('is-highlighted');

    if (!this.model.get('query')) return;

    this.$('.js-picklist-item').first().addClass('is-highlighted');
  },
  emptyViewOptions() {
    return { noResultsText: this.noResultsText };
  },
  templateContext() {
    return {
      headingText: this.headingText,
      placeholderText: this.placeholderText,
      isSelectlist: this.isSelectlist,
    };
  },
});

export default Component.extend({
  attr: 'text',
  PicklistItem,
  className: 'picklist',
  childViewEventPrefix: 'picklist',
  headingText: '',
  noResultsText: intl.components.picklist.noResultsText,
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
  viewEvents: {
    'watch:change': 'onWatchChange',
  },
  onWatchChange(query) {
    this.setState('query', query);
  },
});
