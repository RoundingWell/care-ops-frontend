import { map } from 'underscore';
import Radio from 'backbone.radio';
import hbs from 'handlebars-inline-precompile';

import 'sass/modules/buttons.scss';

import intl from 'js/i18n';

import Droplist from 'js/components/droplist';

import 'sass/domain/action-state.scss';

const i18n = intl.patients.shared.components.stateComponent;

const StateTemplate = hbs`<span class="action--{{ options.color }}">{{fa options.iconType options.icon}}{{#unless isCompact}}{{ name }}{{/unless}}</span>`;

let statesCollection;

function getStates() {
  if (statesCollection) return statesCollection;
  const currentOrg = Radio.request('bootstrap', 'currentOrg');
  statesCollection = currentOrg.getStates();
  return statesCollection;
}

const statuses = ['queued', 'started', 'done'];
let statesLists;

function getStateLists() {
  if (statesLists) return statesLists;
  const statesByStatus = getStates().groupBy('status');
  statesLists = map(statuses, status => {
    return {
      collection: Radio.request('entities', 'states:collection', statesByStatus[status]),
      headingText: i18n.statusLabels[status],
    };
  });
  return statesLists;
}

export default Droplist.extend({
  isCompact: false,
  initialize({ stateId }) {
    const states = getStates();
    this.lists = getStateLists();
    this.setState({ selected: states.get(stateId) });
  },
  onChangeSelected(selected) {
    this.triggerMethod('change:state', selected);
  },
  popWidth() {
    const isCompact = this.getOption('isCompact');

    return isCompact ? null : this.getView().$el.outerWidth();
  },
  viewOptions() {
    const isCompact = this.getOption('isCompact');

    return {
      className: isCompact ? 'button-secondary--compact is-icon-only' : 'button-secondary w-100',
      template: StateTemplate,
      templateContext: {
        isCompact,
      },
    };
  },
  picklistOptions: {
    headingText: i18n.headingText,
    itemTemplate: StateTemplate,
  },
});
