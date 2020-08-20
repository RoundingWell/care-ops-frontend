import Radio from 'backbone.radio';
import hbs from 'handlebars-inline-precompile';

import 'sass/modules/buttons.scss';

import intl from 'js/i18n';

import Droplist from 'js/components/droplist';

import './role-component.scss';

const i18n = intl.patients.worklist.roleComponent;

const RoleItemTemplate = hbs`{{matchText name query}} <span class="role-component__role">{{matchText short query}}</span>`;
const RoleButtonTemplate = hbs`{{far "user-circle"}}{{ name }}{{#unless name}}{{ @intl.patients.worklist.roleComponent.defaultText }}{{/unless}}{{far "angle-down"}}`;

let rolesCollection;

function getRoles() {
  if (rolesCollection) return rolesCollection;
  const currentOrg = Radio.request('bootstrap', 'currentOrg');
  rolesCollection = currentOrg.getRoles();
  return rolesCollection;
}

export default Droplist.extend({
  canClear: false,
  picklistOptions() {
    return {
      canClear: this.getOption('canClear'),
      itemTemplate: RoleItemTemplate,
      isSelectlist: true,
      headingText: i18n.headingText,
      placeholderText: i18n.placeholderText,
    };
  },
  viewOptions: {
    className: 'button-filter role-component__button',
    template: RoleButtonTemplate,
  },
  initialize({ role }) {
    this.collection = getRoles();

    this.setState({ selected: this.collection.get(role) });
  },
  onChangeSelected(selected) {
    this.triggerMethod('change:role', selected);
  },
});
