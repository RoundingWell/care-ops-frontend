import _ from 'underscore';
import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';

import 'sass/modules/modals.scss';

import intl from 'js/i18n';

import Picklist from 'js/components/picklist';

import './patient-search.scss';

const EmptyResultsViews = View.extend({
  collectionEvents: {
    'search': 'render',
  },
  tagName: 'li',
  className: 'patient-search--no-results',
  getTemplate() {
    if (this.collection.isSearching) return hbs`{{ @intl.globals.search.patientSearchViews.picklistEmptyView.searching }}`;

    return hbs`{{ @intl.globals.search.patientSearchViews.picklistEmptyView.noResults }}`;
  },
});

const TipView = View.extend({
  tagName: 'li',
  className: 'patient-search--no-results',
  template: hbs`
    <div>{{ @intl.globals.search.patientSearchViews.picklistEmptyView.searchTip }}</div>
    <div>{{fas "keyboard"}}<strong class="u-margin--l-8">{{ @intl.globals.search.patientSearchViews.picklistEmptyView.shortcut }}</strong></div>
  `,
});

const PatientSearchPicklist = Picklist.extend({
  className: 'picklist patient-search__picklist',
  isSelectlist: true,
  placeholderText: intl.globals.search.patientSearchViews.patientSearchPicklist.placeholderText,
  getItemSearchText() {
    return `${ this.model.get('first_name') } ${ this.model.get('last_name') }`;
  },
  itemClassName: 'patient-search__picklist-item',
  itemTemplate: hbs`
    {{matchText text query}}{{~ remove_whitespace ~}}
    <span class="picklist-item__birthdate">{{formatDateTime birth_date "MM/DD/YYYY"}}</span>
  `,
  itemTemplateContext() {
    return {
      text: this.getItemSearchText(),
    };
  },
});

const PatientSearchModal = View.extend({
  className: 'modal patient-search__modal',
  template: hbs`
    <div class="modal-body patient-search__modal-body">
      <a href="#" class="modal-close patient-search__modal-close js-close">{{fas "times"}}</a>
      <div data-picklist-region></div>
    </div>
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
  serializeCollection: _.noop,
  onRender() {
    const collection = this.collection;

    const picklistComponent = new PatientSearchPicklist({
      lists: [
        {
          collection,
        },
      ],
    });
    this.listenTo(picklistComponent.getState(), 'change:query', this.onChangeQuery);

    picklistComponent.showIn(this.getRegion('picklist'), {
      emptyView() {
        const query = this.model.get('query');
        if (!query || query.length < 3) return TipView;
        return EmptyResultsViews;
      },
      emptyViewOptions: {
        collection,
      },
      template: hbs`
        <div class="picklist__fixed-heading patient-search__heading">
          <span class="patient-search__search-icon">{{far "search"}}</span>
          {{#if isSelectlist}}<input type="text" class="js-input patient-search__input" placeholder="{{ placeholderText }}">{{/if}}
        </div>
        <ul class="flex-region picklist__scroll js-picklist-scroll"></ul>
        {{#if infoText}}<div class="picklist__info">{{fas "info-circle"}}{{ infoText }}</div>{{/if}}
      `,
    });

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
