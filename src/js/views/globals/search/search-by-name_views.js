import { find, get, map } from 'underscore';
import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';

import PicklistComponent from 'js/components/picklist';

const TipTemplate = hbs`
  <div class="patient-search__tip">{{ @intl.globals.search.patientSearchViews.picklistEmptyView.searchByName.searchTip }}</div>
  <div class="patient-search__search-by">
    <div class="patient-search__search-by-title">I'm looking for patients by...</div>
    <div class="patient-search__search-by-buttons">
      <div class="js-dob-button button-primary patient-search__search-by-button">
        <span class="patient-search__search-by-button-label">Date of Birth</span>
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
    'click .js-dob-button': 'select:dob:type',
  },
  initialize({ state }) {
    this.state = state;
    this.listenTo(this.state, 'change:search', this.render);
  },
  getTemplate() {
    const search = this.state.get('search');

    if (!search || search.length < 3) return TipTemplate;

    if (this.collection.isSearching) return SearchingTemplate;

    return NoResultsTemplate;
  },
  onSelectDobType() {
    this.state.set('searchType', 'dob');
  },
});

const PatientSearchByNamePicklist = PicklistComponent.extend({
  className: 'patient-search__picklist',
  getItemSearchText() {
    return `${ this.model.get('first_name') } ${ this.model.get('last_name') }`;
  },
  itemClassName: 'patient-search__picklist-item',
  itemTemplate: hbs`
    {{matchText text search}}{{~ remove_whitespace ~}}
    <span class="patient-search__picklist-item-meta">{{formatDateTime birth_date "MM/DD/YYYY"}}</span>
    {{#each identifiers}}<span class="patient-search__picklist-item-meta">{{this}}</span>{{/each}}
  `,
  itemTemplateContext() {
    const settings = this.state.get('settings');
    const settingsIdentifiers = get(settings, 'result_identifiers');

    const patientIdentifiers = this.model.get('identifiers');

    const identifiers = map(settingsIdentifiers, settingsIdentifier => {
      const identifierToShow = find(patientIdentifiers, { type: settingsIdentifier });

      return identifierToShow && identifierToShow.value;
    });

    return {
      text: this.getItemSearchText(),
      search: this.state.get('search'),
      identifiers,
    };
  },
  template: hbs`
    <div class="modal__header patient-search__header">
      <span class="modal__header-icon">{{far "magnifying-glass"}}</span>
      <input type="text" class="js-input patient-search__input" placeholder="{{ @intl.globals.search.patientSearchViews.patientSearchPicklist.searchByName.placeholderText }}" value="{{ search }}">
    </div>
    <ul class="flex-region picklist__scroll js-picklist-scroll"></ul>
  `,
  emptyView: EmptyView,
  onWatchChange(search) {
    this.setState('search', search);
  },
  initialize() {
    this.listenTo(this.collection, 'search', this.renderView);
  },
});

export {
  PatientSearchByNamePicklist,
};
