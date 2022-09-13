import { noop } from 'underscore';
import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';

import 'scss/modules/buttons.scss';
import 'scss/modules/modals.scss';

import Picklist from './patient-search_picklist';

import './patient-search.scss';

const TipTemplate = hbs`
  <div class="patient-search__tip">{{ @intl.globals.search.patientSearchViews.picklistEmptyView.searchTip }}</div>
  <div class="patient-search__search-by">
    <div class="patient-search__search-by-title">Or search for patients by</div>
    <div class="u-margin--t-8 qa-search-option">
      <span class="patient-search__search-by-label">Date of Birth</span>
      <span class="patient-search__search-by-example">For example: MM/DD/YYYY</span>
    </div>
    {{#each identifiers}}
      <div class="u-margin--t-8 qa-search-option">
        <span class="patient-search__search-by-label">{{this.label}}</span>
        <span class="patient-search__search-by-example">For example: {{this.example}}</span>
      </div>
    {{/each}}
  </div>
  <div class="patient-search__shortcut">{{fas "keyboard"}}<strong class="u-margin--l-8">{{ @intl.globals.search.patientSearchViews.picklistEmptyView.shortcut }}</strong></div>
`;

const EmptyView = View.extend({
  collectionEvents: {
    'search': 'render',
  },
  tagName: 'li',
  className: 'patient-search__no-results',
  initialize({ state }) {
    this.state = state;
    this.listenTo(this.state, 'change:search', this.render);
  },
  templateContext() {
    const settings = this.state.get('settings');

    return {
      identifiers: settings && settings.identifiers,
    };
  },
  getTemplate() {
    const search = this.state.get('search');

    if (!search || search.length < 3) return TipTemplate;
    if (this.collection.isSearching) return hbs`{{ @intl.globals.search.patientSearchViews.picklistEmptyView.searching }}`;

    return hbs`{{ @intl.globals.search.patientSearchViews.picklistEmptyView.noResults }}`;
  },
});

const PatientSearchPicklist = Picklist.extend({
  className: 'patient-search__picklist',
  itemClassName: 'patient-search__picklist-item',
  itemTemplate: hbs`
    <div class="patient-search__picklist-item-name u-text--overflow">
      <span>{{matchText name search}}{{~ remove_whitespace ~}}</span>
    </div>
    <div class="patient-search__picklist-item-meta">
      <div class="patient-search__picklist-item-dob u-text--overflow">
        {{formatDateTime birth_date "MM/DD/YYYY"}}
      </div>
      {{#if identifier}}
        <div class="patient-search__picklist-item-identifier u-text--overflow">
          {{matchText identifier search}}
        </div>
      {{/if}}
    </div>
  `,
  itemTemplateContext() {
    const name = `${ this.model.get('first_name') } ${ this.model.get('last_name') }`;
    const identifiers = this.model.get('identifiers');

    return {
      name,
      search: this.state.get('search'),
      identifier: identifiers.length && identifiers[0].value,
    };
  },
  template: hbs`
    <div class="modal__header patient-search__header">
      <span class="modal__header-icon">{{far "magnifying-glass"}}</span>
      <input type="text" class="js-input patient-search__input" placeholder="{{ @intl.globals.search.patientSearchViews.patientSearchPicklist.placeholderText }}" value="{{ search }}">
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

const PatientSearchModal = View.extend({
  className: 'modal',
  template: hbs`
    <a href="#" class="button--icon patient-search__close js-close">{{far "xmark"}}</a>
    <div data-picklist-region></div>
  `,
  triggers: {
    'click .js-close': 'close',
  },
  regions: {
    picklist: {
      el: '[data-picklist-region]',
      replaceElement: true,
    },
  },
  childViewTriggers: {
    'picklist:item:select': 'item:select',
  },
  serializeCollection: noop,
  onRender() {
    const collection = this.collection;
    const search = this.getOption('prefillText');
    const settings = this.getOption('settings');

    const picklistComponent = new PatientSearchPicklist({
      lists: [{ collection }],
      state: { search, settings },
    });

    this.listenTo(picklistComponent.getState(), 'change:search', this.onChangeSearch);

    picklistComponent.showIn(this.getRegion('picklist'), {
      emptyViewOptions: {
        collection,
        state: picklistComponent.getState(),
      },
    });

    if (search) this.collection.search(search);

    this.listenTo(picklistComponent.getView(), 'close', this.destroy);
  },
  onChangeSearch(state, search) {
    this.collection.search(search);
  },
  onClose() {
    this.destroy();
  },
});

export {
  PatientSearchModal,
};
