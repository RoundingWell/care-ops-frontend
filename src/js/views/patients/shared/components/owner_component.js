import Backbone from 'backbone';
import Radio from 'backbone.radio';
import hbs from 'handlebars-inline-precompile';

import 'scss/modules/buttons.scss';

import intl from 'js/i18n';

import Droplist from 'js/components/droplist';

import './owner-component.scss';

const i18n = intl.patients.shared.components.ownerComponent;

const OwnerItemTemplate = hbs`<div>{{matchText name query}} <span class="owner-component__team">{{matchText abbr query}}</span></div>`;
const TitleOwnerFilterTemplate = hbs`<div><span class="owner-component__title-filter-name">{{ name }}</span>{{far "angle-down"}}</div>`;

let currentWorkspaceCache;
let teamsCollection;
let cliniciansCache;

function getTeams(workspace) {
  if (teamsCollection) return teamsCollection;
  const clinicians = getClinicians(workspace);
  teamsCollection = Radio.request('entities', 'teams:collection', clinicians.invoke('getTeam'));
  return teamsCollection;
}

function getClinicians(workspace) {
  if (cliniciansCache) return cliniciansCache;
  cliniciansCache = workspace.getAssignableClinicians();
  return cliniciansCache;
}

export default Droplist.extend({
  isCompact: false,
  headingText: i18n.headingText,
  placeholderText: i18n.placeholderText,
  hasTeams: true,
  hasClinicians: true,
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
          abbr: this.model.getTeam().get('abbr'),
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
      const isReadOnly = this.getOption('isReadOnly');

      return {
        className: `owner-component--compact button-secondary--compact w-100${ isReadOnly ? ' button__read-only' : '' }`,
        templateContext: {
          attr: isTeam ? 'abbr' : 'name',
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

  initialize({ owner }) {
    this.isReadOnly = this.getOption('isReadOnly');

    this.lists = [];
    const currentWorkspace = Radio.request('bootstrap', 'currentWorkspace');

    if (currentWorkspaceCache !== currentWorkspace.id) {
      teamsCollection = null;
      cliniciansCache = null;
      currentWorkspaceCache = currentWorkspace.id;
    }

    const currentUser = Radio.request('bootstrap', 'currentUser');
    const clinicians = getClinicians(currentWorkspace);

    if (this.getOption('hasCurrentClinician') && clinicians.get(currentUser)) {
      this.lists.push({
        collection: new Backbone.Collection([currentUser]),
      });
    }

    if (this.getOption('hasClinicians') && clinicians.length) {
      this.lists.push({
        collection: clinicians,
        headingText: currentWorkspace.get('name'),
      });
    }

    if (this.getOption('hasTeams')) {
      this.lists.push({
        collection: getTeams(currentWorkspace),
        headingText: this.lists.length ? i18n.teamsHeadingText : null,
      });
    }

    this.setState({ selected: owner });
  },
  onChangeSelected(selected) {
    this.triggerMethod('change:owner', selected);
  },
});
