import { noop } from 'underscore';
import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';

import 'scss/modules/buttons.scss';
import 'scss/modules/modals.scss';

import Picklist from 'js/components/picklist';

import './patient-search.scss';

const TipTemplate = hbs`
<div>{{ @intl.globals.search.patientSearchViews.picklistEmptyView.searchTip }}</div>
<div>{{fas "keyboard"}}<strong class="u-margin--l-8">{{ @intl.globals.search.patientSearchViews.picklistEmptyView.shortcut }}</strong></div>
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
  getTemplate() {
    const search = this.state.get('search');
    if (!search || search.length < 3) return TipTemplate;
    if (this.collection.isSearching) return hbs`{{ @intl.globals.search.patientSearchViews.picklistEmptyView.searching }}`;

    return hbs`{{ @intl.globals.search.patientSearchViews.picklistEmptyView.noResults }}`;
  },
});

const PatientSearchPicklist = Picklist.extend({
  className: 'patient-search__picklist',
  getItemSearchText() {
    return `${ this.model.get('first_name') } ${ this.model.get('last_name') }`;
  },
  itemClassName: 'patient-search__picklist-item',
  itemTemplate: hbs`
    {{matchText text search}}{{~ remove_whitespace ~}}
    <span class="patient-search__picklist-item-meta">{{formatDateTime birth_date "MM/DD/YYYY"}}</span>
  `,
  itemTemplateContext() {
    return {
      text: this.getItemSearchText(),
      search: this.state.get('search'),
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

    const picklistComponent = new PatientSearchPicklist({
      lists: [{ collection }],
      state: { search },
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
