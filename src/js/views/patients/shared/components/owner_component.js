import Backbone from 'backbone';
import Radio from 'backbone.radio';
import hbs from 'handlebars-inline-precompile';

import 'sass/modules/buttons.scss';

import intl from 'js/i18n';

import Droplist from 'js/components/droplist';

import './owner-component.scss';

const i18n = intl.patients.shared.components.ownerComponent;

const OwnerItemTemplate = hbs`{{matchText name query}} <span class="owner-component__role">{{matchText short query}}</span>`;
const OwnerButtonTemplate = hbs`{{far "user-circle"}}{{ name }}`;
const OwnerShortButtonTemplate = hbs`{{far "user-circle"}}{{ short }}`;
const FilterButtonTemplate = hbs`{{far "user-circle"}}{{ name }}{{far "angle-down"}}`;

let rolesCollection;

function getRoles() {
  if (rolesCollection) return rolesCollection;
  const currentOrg = Radio.request('bootstrap', 'currentOrg');
  rolesCollection = currentOrg.getActiveRoles();
  return rolesCollection;
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
  isFilter: false,
  headingText: i18n.headingText,
  placeholderText: i18n.placeholderText,
  hasRoles: true,
  popWidth() {
    const isFilter = this.getOption('isFilter');
    const isCompact = this.getOption('isCompact');

    return (isFilter || isCompact) ? null : this.getView().$el.outerWidth();
  },
  picklistOptions() {
    return {
      itemTemplate: OwnerItemTemplate,
      itemTemplateContext() {
        if (this.model.type === 'roles') return;
        return {
          short: this.model.getRole().get('short'),
        };
      },
      isSelectlist: true,
      infoText: this.getOption('infoText'),
    };
  },
  viewOptions() {
    const isCompact = this.getOption('isCompact');
    const isFilter = this.getOption('isFilter');

    if (isFilter) {
      return {
        className: 'button-filter',
        template: FilterButtonTemplate,
      };
    }

    if (isCompact) {
      const selected = this.getState('selected');
      const isRole = selected.type === 'roles';

      return {
        className: 'owner-component--compact button-secondary--compact w-100',
        template: isRole ? OwnerShortButtonTemplate : OwnerButtonTemplate,
      };
    }

    return {
      className: 'button-secondary w-100',
      template: OwnerButtonTemplate,
    };
  },

  initialize({ owner, groups = [] }) {
    this.lists = groups.map(group => {
      return {
        collection: getGroupClinicians(group),
        headingText: group.get('name'),
      };
    });

    if (this.lists.length) {
      const currentUser = Radio.request('bootstrap', 'currentUser');
      this.lists.unshift({
        collection: new Backbone.Collection([currentUser]),
      });
    }

    if (this.getOption('hasRoles')) {
      this.lists.push({
        collection: getRoles(),
        headingText: this.lists.length ? i18n.rolesHeadingText : null,
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
