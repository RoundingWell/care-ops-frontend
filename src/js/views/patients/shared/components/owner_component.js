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
  popWidth() {
    const isCompact = this.getOption('isCompact');

    return isCompact ? null : this.getView().$el.outerWidth();
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
      headingText: i18n.headingText,
      placeholderText: i18n.placeholderText,
      infoText: this.getOption('infoText'),
    };
  },
  viewOptions() {
    const isCompact = this.getOption('isCompact');
    const selected = this.getState('selected');
    const isRole = selected.type === 'roles';

    return {
      className: isCompact ? 'owner-component--list-item button-secondary--compact w-100' : 'button-secondary w-100',
      template: (isCompact && isRole) ? OwnerShortButtonTemplate : OwnerButtonTemplate,
    };
  },

  initialize({ owner, groups }) {
    this.lists = groups.map(group => {
      return {
        collection: getGroupClinicians(group),
        headingText: group.get('name'),
      };
    });

    const currentUser = Radio.request('bootstrap', 'currentUser');

    this.lists.unshift({
      collection: new Backbone.Collection([currentUser]),
    });

    this.lists.push({
      collection: getRoles(),
      headingText: i18n.rolesHeadingText,
    });

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
