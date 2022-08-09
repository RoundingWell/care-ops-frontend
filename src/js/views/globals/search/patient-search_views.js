import { noop } from 'underscore';
import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';

import 'scss/modules/buttons.scss';
import 'scss/modules/modals.scss';

import Picklist from 'js/components/picklist';

import './patient-search.scss';

const EmptyResultsViews = View.extend({
  collectionEvents: {
    'search': 'render',
  },
  tagName: 'li',
  className: 'patient-search__no-results',
  getTemplate() {
    if (this.collection.isSearching) return hbs`{{ @intl.globals.search.patientSearchViews.picklistEmptyView.searching }}`;

    return hbs`{{ @intl.globals.search.patientSearchViews.picklistEmptyView.noResults }}`;
  },
});

const TipView = View.extend({
  tagName: 'li',
  className: 'patient-search__no-results',
  template: hbs`
    <div>{{ @intl.globals.search.patientSearchViews.picklistEmptyView.searchTip }}</div>
    <div>{{fas "keyboard"}}<strong class="u-margin--l-8">{{ @intl.globals.search.patientSearchViews.picklistEmptyView.shortcut }}</strong></div>
  `,
});

const PatientSearchPicklist = Picklist.extend({
  className: 'patient-search__picklist',
  getItemSearchText() {
    return `${ this.model.get('first_name') } ${ this.model.get('last_name') }`;
  },
  itemClassName: 'patient-search__picklist-item',
  itemTemplate: hbs`
    {{matchText text query}}{{~ remove_whitespace ~}}
    <span class="patient-search__picklist-item-meta">{{formatDateTime birth_date "MM/DD/YYYY"}}</span>
  `,
  itemTemplateContext() {
    return {
      text: this.getItemSearchText(),
    };
  },
  template: hbs`
    <div class="modal__header patient-search__header">
      <span class="modal__header-icon">{{far "search"}}</span>
      <input type="text" class="js-input patient-search__input" placeholder="{{ @intl.globals.search.patientSearchViews.patientSearchPicklist.placeholderText }}" value="{{ query }}">
    </div>
    <ul class="flex-region picklist__scroll js-picklist-scroll"></ul>
  `,
  emptyView() {
    const query = this.model.get('query');
    if (!query || query.length < 3) return TipView;
    return EmptyResultsViews;
  },
});

const PatientSearchModal = View.extend({
  className: 'modal',
  template: hbs`
    <a href="#" class="button--icon patient-search__close js-close">{{far "times"}}</a>
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
    const query = this.getOption('prefillText');

    const picklistComponent = new PatientSearchPicklist({
      lists: [{ collection }],
      state: { query },
    });

    this.listenTo(picklistComponent.getState(), 'change:query', this.onChangeQuery);

    picklistComponent.showIn(this.getRegion('picklist'), {
      emptyViewOptions: { collection },
    });

    if (query) this.collection.search(query);

    this.listenTo(picklistComponent.getView(), 'close', this.destroy);
  },
  onChangeQuery(state, query) {
    this.collection.search(query);
  },
  onClose() {
    this.destroy();
  },
});

export {
  PatientSearchModal,
};
