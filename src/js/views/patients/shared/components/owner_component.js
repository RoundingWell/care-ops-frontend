import { find } from 'underscore';
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
let cliniciansCache = {};

function getTeams(workspaces, currentUser) {
  if (teamsCollection) return teamsCollection;

  if (currentUser.can('work:team:manage')) {
    teamsCollection = Radio.request('entities', 'teams:collection', [currentUser.getTeam()]);
    return teamsCollection;
  }

  teamsCollection = Radio.request('entities', 'teams:collection');

  workspaces.each(workspace => {
    const clinicians = getClinicians(workspace, currentUser);
    teamsCollection.add(clinicians.invoke('getTeam'));
  });

  return teamsCollection;
}

function getClinicians(workspace, currentUser) {
  if (cliniciansCache[workspace.id]) return cliniciansCache[workspace.id];

  if (currentUser.can('work:team:manage')) {
    cliniciansCache[workspace.id] = currentUser.getTeam().getAssignableClinicians();
    return cliniciansCache[workspace.id];
  }

  cliniciansCache[workspace.id] = workspace.getAssignableClinicians();
  return cliniciansCache[workspace.id];
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
    const lists = this.getLists();
    const hasCurrent = this.getOption('hasCurrentClinician');
    const showCurrentUser = hasCurrent && find(lists, ({ collection }) => {
      return collection.get(this.currentUser);
    });

    return {
      lists,
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
      canClear: showCurrentUser,
      clearText: this.currentUser.get('name'),
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
        className: 'owner-component--compact button-secondary--compact',
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
  initialize({ owner, workspaces }) {
    const currentWorkspace = Radio.request('workspace', 'current');

    this.owner = owner;
    this.workspaces = workspaces || Radio.request('entities', 'workspaces:collection', [currentWorkspace]);
    this.currentUser = Radio.request('bootstrap', 'currentUser');

    if (currentWorkspaceCache !== currentWorkspace.id) {
      teamsCollection = null;
      cliniciansCache = {};
      currentWorkspaceCache = currentWorkspace.id;
    }

    this.setState({ selected: owner });
  },
  getLists() {
    const lists = [];

    if (this.getOption('hasClinicians')) {
      this.workspaces.each(workspace => {
        const clinicians = getClinicians(workspace, this.currentUser);

        if (!clinicians.length) return;

        lists.push({
          collection: clinicians,
          headingText: workspace.get('name'),
        });
      });
    }

    if (this.getOption('hasTeams')) {
      lists.push({
        collection: getTeams(this.workspaces, this.currentUser),
        headingText: lists.length ? i18n.teamsHeadingText : null,
      });
    }

    return lists;
  },
  onPicklistSelect({ model }) {
    this.setState('selected', model || this.currentUser);

    this.popRegion.empty();
  },
  onChangeSelected(selected) {
    this.triggerMethod('change:owner', selected);
  },
});
