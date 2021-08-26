import Radio from 'backbone.radio';
import hbs from 'handlebars-inline-precompile';

import 'sass/modules/buttons.scss';

import intl from 'js/i18n';

import Droplist from 'js/components/droplist';

import './role-component.scss';

const i18n = intl.admin.shared.components.roleComponent;

const RoleItemTemplate = hbs`{{matchText name query}} <span class="role-component__role">{{matchText short query}}</span>`;
const RoleButtonTemplate = hbs`{{far "user-circle"}}{{ name }}{{#unless name}}{{ @intl.admin.shared.components.roleComponent.defaultText }}{{/unless}}`;
const RoleShortButtonTemplate = hbs`{{far "user-circle"}}{{ short }}`;

let rolesCollection;

function getRoles() {
  if (rolesCollection) return rolesCollection;
  const currentOrg = Radio.request('bootstrap', 'currentOrg');
  rolesCollection = currentOrg.getRoles();
  return rolesCollection;
}

export default Droplist.extend({
  RoleItemTemplate,
  RoleButtonTemplate,
  RoleShortButtonTemplate,
  isCompact: false,
  popWidth() {
    const isCompact = this.getOption('isCompact');

    return isCompact ? null : this.getView().$el.outerWidth();
  },
  getClassName(isCompact) {
    const selected = this.getState('selected');

    if (!selected && isCompact) {
      return 'button-secondary--compact is-icon-only';
    }

    if (isCompact) {
      return 'button-secondary--compact';
    }

    return 'button-secondary w-100';
  },
  canClear: false,
  picklistOptions() {
    return {
      canClear: this.getOption('canClear'),
      itemTemplate: this.RoleItemTemplate,
      isSelectlist: true,
      headingText: i18n.headingText,
      placeholderText: i18n.placeholderText,
    };
  },
  viewOptions() {
    const isCompact = this.getOption('isCompact');
    return {
      className: this.getClassName(isCompact),
      template: isCompact ? this.RoleShortButtonTemplate : this.RoleButtonTemplate,
    };
  },
  initialize({ role }) {
    this.collection = getRoles();

    this.setState({ selected: this.collection.get(role) });
  },
  onChangeSelected(selected) {
    this.triggerMethod('change:role', selected);
  },
});
