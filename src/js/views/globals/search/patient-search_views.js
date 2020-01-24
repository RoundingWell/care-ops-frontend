import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';

import intl from 'js/i18n';

import Picklist from 'js/components/picklist';

import './patient-search.scss';

const EmptyResultsViews = View.extend({
  tagName: 'li',
  className: 'patient-search--no-results',
  template: hbs`{{ @intl.globals.search.patientSearchViews.picklistEmptyView.noResults }}`,
});

const TipView = View.extend({
  tagName: 'li',
  className: 'patient-search--no-results',
  template: hbs`{{ @intl.globals.search.patientSearchViews.picklistEmptyView.searchTip }}`,
});

const PatientSearchPicklist = Picklist.extend({
  className: 'picklist patient-search__picklist',
  isSelectlist: true,
  placeholderText: intl.globals.search.patientSearchViews.patientSearchPicklist.placeholderText,
  getItemFormat(item) {
    return `${ item.get('first_name') } ${ item.get('last_name') }`;
  },
  itemTemplate: hbs`
    <a class="patient-search__picklist-item{{#if isSelected}} is-selected{{/if}}">
      {{matchText text query}}{{~ remove_whitespace ~}}
      <span class="picklist-item__birthdate">{{formatMoment birth_date "MM/DD/YYYY"}}</span>
    </a>
  `,
});

const PatientSearchModal = View.extend({
  className: 'modal patient-search__modal',
  template: hbs`
    <div class="modal-body patient-search__modal-body">
      <a href="#" class="modal-close patient-search__modal-close js-close">{{fas "times"}}</a>
      <div class="patient-search__picklist-container" data-picklist-region></div>
    </div>
  `,
  triggers: {
    'click .js-close': 'close',
  },
  regions: {
    picklist: '[data-picklist-region]',
  },
  childViewTriggers: {
    'picklist:item:select': 'item:select',
  },
  onRender() {
    const picklistComponent = new PatientSearchPicklist({
      lists: [
        {
          collection: this.getOption('resultsCollection'),
        },
      ],
    });
    this.listenTo(picklistComponent.getState(), 'change:query', this.onChangeQuery);

    picklistComponent.showIn(this.getRegion('picklist'), {
      emptyView() {
        if (!this.model.get('query')) return TipView;
        return EmptyResultsViews;
      },
      template: hbs`
        <div class="picklist__fixed-heading patient-search__heading">
          <span class="patient-search__search-icon">{{far "search"}}</span>
          {{#if isSelectlist}}<input type="text" class="js-input patient-search__input" placeholder="{{ placeholderText }}">{{/if}}
        </div>
        <ul class="flex-region overflow-y"></ul>
        {{#if infoText}}<div class="picklist__info">{{fas "info-circle"}}{{ infoText }}</div>{{/if}}
      `,
    });
  },
  onChangeQuery(state) {
    this.triggerMethod('update:query', state);
  },
  onClose() {
    this.destroy();
  },
});

export {
  PatientSearchModal,
};
