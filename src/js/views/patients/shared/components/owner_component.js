import Backbone from 'backbone';
import Radio from 'backbone.radio';
import hbs from 'handlebars-inline-precompile';

import 'scss/modules/buttons.scss';

import intl from 'js/i18n';

import Droplist from 'js/components/droplist';

import './owner-component.scss';

const i18n = intl.patients.shared.components.ownerComponent;

const OwnerItemTemplate = hbs`<div>{{matchText name query}} <span class="owner-component__team">{{matchText short query}}</span></div>`;
const TitleOwnerFilterTemplate = hbs`<div><span class="owner-component__title-filter-name">{{ name }}</span>{{far "angle-down"}}</div>`;

let teamsCollection;

function getTeams() {
  if (teamsCollection) return teamsCollection;
  const currentOrg = Radio.request('bootstrap', 'currentOrg');
  teamsCollection = currentOrg.getActiveTeams();
  return teamsCollection;
}

// Caching for single renders
let groupCache = {};

function getGroupClinicians(group) {
  if (groupCache[group.id]) return groupCache[group.id];
  groupCache[group.id] = group.getActiveClinicians();
  return groupCache[group.id];
}

export default Droplist.extend({
  isCompact: false,
  headingText: i18n.headingText,
  placeholderText: i18n.placeholderText,
  hasTeams: true,
  hasCurrentClinician: true,
  popWidth() {
    const isCompact = this.getOption('isCompact');
    const isTitleFilter = this.getOption('isTitleFilter');

    return (isCompact || isTitleFilter) ? null : this.getView().$el.outerWidth();
  },
  picklistOptions() {
    return {
      itemTemplate: OwnerItemTemplate,
      itemTemplateContext() {
        if (this.model.type === 'teams') return;
        return {
          short: this.model.getTeam().get('short'),
        };
      },
      isSelectlist: true,
      infoText: this.getOption('infoText'),
      headingText: this.getOption('headingText'),
      placeholderText: this.getOption('placeholderText'),
    };
  },
  viewOptions() {
    const icon = { type: 'far', icon: 'circle-user' };
    const isCompact = this.getOption('isCompact');
    const isTitleFilter = this.getOption('isTitleFilter');

    if (isCompact) {
      const selected = this.getState('selected');
      const isTeam = selected.type === 'teams';

      return {
        className: 'owner-component--compact button-secondary--compact w-100',
        templateContext: {
          attr: isTeam ? 'short' : 'name',
          icon,
        },
      };
    }

    if (isTitleFilter) {
      return {
        className: 'owner-component__title-filter-button',
        template: TitleOwnerFilterTemplate,
      };
    }

    return {
      className: 'button-secondary w-100',
      templateContext: {
        attr: 'name',
        icon,
      },
    };
  },

  initialize({ owner, groups }) {
    this.lists = [];

    if (this.getOption('hasCurrentClinician')) {
      const currentUser = Radio.request('bootstrap', 'currentUser');
      this.lists.push({
        collection: new Backbone.Collection([currentUser]),
      });
    }

    if (groups) {
      this.lists.push(...groups.map(group => {
        return {
          collection: getGroupClinicians(group),
          headingText: group.get('name'),
        };
      }));
    }

    if (this.getOption('hasTeams')) {
      this.lists.push({
        collection: getTeams(),
        headingText: this.lists.length ? i18n.teamsHeadingText : null,
      });
    }

    this.setState({ selected: owner });
  },
  onDestroy() {
    // NOTE: overzealously clearing the cache
    groupCache = {};
  },
  onChangeSelected(selected) {
    this.triggerMethod('change:owner', selected);
  },
});
