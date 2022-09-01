import { noop, find, get, map, debounce, each, extend, pick } from 'underscore';
import dayjs from 'dayjs';
import hbs from 'handlebars-inline-precompile';
import { View, CollectionView } from 'marionette';

import hasAllText from 'js/utils/formatting/has-all-text';

import PicklistComponent from 'js/components/picklist';

import InputWatcherBehavior from 'js/behaviors/input-watcher';
import PicklistBehavior from 'js/behaviors/picklist-transport';

const CLASS_OPTIONS = [
  'childView',
  'childViewEventPrefix',
  'className',
  'lists',
];

const CLASS_OPTIONS_ITEM = [
  'itemClassName',
  'itemTemplate',
  'itemTemplateContext',
];

const Picklist = CollectionView.extend({
  className: 'picklist__group',
  tagName: 'li',
  template: hbs`<ul></ul>`,
  serializeCollection: noop,
  childViewContainer: 'ul',
  childViewEventPrefix: 'item',
  modelEvents: {
    'change:query': 'filter',
  },
  viewFilter(view) {
    view.render();
    const query = this.model.get('query');
    return !query || !view.searchText || hasAllText(view.searchText, query);
  },
  initialize(options) {
    this.mergeOptions(options, CLASS_OPTIONS_ITEM);
  },
  childViewOptions() {
    const opts = pick(this, ...CLASS_OPTIONS_ITEM);
    return extend({ state: this.model }, opts);
  },
});

const PicklistsCollectionView = CollectionView.extend({
  behaviors: [
    InputWatcherBehavior,
    PicklistBehavior,
  ],
  template: hbs`
    <div class="modal__header patient-search__header">
      <span class="modal__header-icon">{{far "magnifying-glass"}}</span>
      <div class="js-clear-search-type button-primary patient-search__clear-type-button">
        <span class="patient-search__clear-type-button-label">Date of Birth</span>{{far "xmark"}}
      </div>
      <input
        type="date"
        class="js-input patient-search__input"
        placeholder="{{ @intl.globals.search.patientSearchViews.patientSearchPicklist.searchByDOB.placeholderText }}"
        value="{{ search }}"
      >
    </div>
    <ul class="flex-region picklist__scroll js-picklist-scroll"></ul>
`,
  triggers: {
    'click .js-clear-search-type': 'click:clear:search:type',
  },
  serializeCollection: noop,
  childViewContainer: 'ul',
  initialize(options) {
    this.mergeOptions(options, CLASS_OPTIONS);
    this.mergeOptions(options, CLASS_OPTIONS_ITEM);

    this.debouncedFilter = debounce(this.filter, 1);

    each(this.lists, this.addList, this);
  },
  addList(list) {
    const options = extend({
      model: this.model,
      childView: this.childView,
    }, pick(this, ...CLASS_OPTIONS_ITEM), list);

    const picklist = new Picklist(options);

    picklist.render();

    this.addChildView(picklist);
  },
  viewFilter(childView) {
    return !!childView.children.length;
  },
  childViewEvents: {
    'before:render:children'() {
      return this.debouncedFilter();
    },
  },
  onRenderChildren() {
    this.$('.js-picklist-item').removeClass('is-highlighted');

    if (!this.model.get('query')) return;

    this.$('.js-picklist-item').first().addClass('is-highlighted');
  },
});

const TipTemplate = hbs`
  <div class="patient-search__tip">{{ @intl.globals.search.patientSearchViews.picklistEmptyView.searchByDOB.searchTip }}</div>
  <div class="patient-search__search-by">
    <div class="patient-search__search-by-title">I'm looking for patients by...</div>
    <div class="patient-search__search-by-buttons">
      <div class="js-name-button button-primary patient-search__search-by-button">
        <span class="patient-search__search-by-button-label">Name</span>
      </div>
    </div>
  </div>
  <div class="patient-search__shortcut">{{fas "keyboard"}}<strong class="u-margin--l-8">{{ @intl.globals.search.patientSearchViews.picklistEmptyView.shortcut }}</strong></div>
`;

const SearchingTemplate = hbs`<div class="patient-search__searching">{{ @intl.globals.search.patientSearchViews.picklistEmptyView.searching }}</div>`;
const NoResultsTemplate = hbs`<div class="patient-search__no-results">{{ @intl.globals.search.patientSearchViews.picklistEmptyView.noResults }}</div>`;

const EmptyView = View.extend({
  collectionEvents: {
    'search': 'render',
  },
  tagName: 'li',
  className: 'patient-search__info',
  triggers: {
    'click .js-name-button': 'select:name:type',
  },
  initialize({ state }) {
    this.state = state;
    this.listenTo(this.state, 'change:search', this.render);
  },
  getTemplate() {
    const search = this.state.get('search');

    const isValidDate = dayjs(search, 'YYYY-MM-DD', true).isValid();

    if (!search || !isValidDate || search.length < 3) {
      return TipTemplate;
    }

    if (this.collection.isSearching) return SearchingTemplate;

    return NoResultsTemplate;
  },
  onSelectNameType() {
    this.state.set('searchType', 'name');
  },
});

const PatientSearchByDOBPicklist = PicklistComponent.extend({
  className: 'patient-search__picklist',
  itemClassName: 'patient-search__picklist-item',
  itemTemplate: hbs`
    <span>{{first_name}} {{last_name}}</span>{{~ remove_whitespace ~}}
    <span class="patient-search__picklist-item-meta">{{formatDateTime birth_date "MM/DD/YYYY"}}</span>
    {{#each identifiers}}<span class="patient-search__picklist-item-meta">{{this}}</span>{{/each}}
  `,
  ViewClass: PicklistsCollectionView,
  itemTemplateContext() {
    const settings = this.state.get('settings');
    const settingsIdentifiers = get(settings, 'result_identifiers');

    const patientIdentifiers = this.model.get('identifiers');

    const identifiers = map(settingsIdentifiers, settingsIdentifier => {
      const identifierToShow = find(patientIdentifiers, { type: settingsIdentifier });

      return identifierToShow && identifierToShow.value;
    });

    return {
      search: this.state.get('search'),
      identifiers,
    };
  },
  emptyView: EmptyView,
  onWatchChange(search) {
    this.setState('search', search);
  },
  initialize() {
    this.listenTo(this.collection, 'search', this.renderView);
  },
});

export {
  PatientSearchByDOBPicklist,
};
