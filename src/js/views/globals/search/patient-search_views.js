import { noop } from 'underscore';
import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';

import 'scss/modules/buttons.scss';
import 'scss/modules/modals.scss';

import { PatientSearchByNamePicklist } from './search-by-name_views.js';
import { PatientSearchByDOBPicklist } from './search-by-dob_views.js';

import './patient-search.scss';

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
    'click:clear:search:type': 'clear:search:type',
  },
  serializeCollection: noop,
  onRender() {
    const collection = this.collection;
    const search = this.getOption('prefillText');
    const settings = this.getOption('settings');
    const searchType = this.getOption('searchType');

    const picklistData = {
      lists: [{ collection }],
      state: { search, settings, searchType },
    };

    let picklistComponent;

    if (searchType === 'name') {
      picklistComponent = new PatientSearchByNamePicklist(picklistData);
    }

    if (searchType === 'dob') {
      picklistComponent = new PatientSearchByDOBPicklist(picklistData);
    }

    this.listenTo(picklistComponent.getState(), 'change:search', this.onChangeSearch);
    this.listenTo(picklistComponent.getState(), 'change:searchType', this.onChangeSearchType);

    picklistComponent.showIn(this.getRegion('picklist'), {
      emptyViewOptions: {
        collection,
        state: picklistComponent.getState(),
      },
    });

    if (search) this.collection.search(search, searchType);

    this.listenTo(picklistComponent.getView(), 'close', this.destroy);
  },
  onChangeSearch(state, search) {
    const currentSearchType = state.get('searchType');

    this.collection.search(search, currentSearchType);
  },
  onChangeSearchType(state, newSearchType) {
    this.triggerMethod('select:search:type', newSearchType);
  },
  onClose() {
    this.destroy();
  },
  onClearSearchType() {
    this.triggerMethod('select:search:type', 'name');
  },
});

export {
  PatientSearchModal,
};
