import { result } from 'underscore';
import Radio from 'backbone.radio';
import hbs from 'handlebars-inline-precompile';

import 'sass/modules/buttons.scss';

import intl from 'js/i18n';

import Droplist from 'js/components/droplist';

import './role-component.scss';

const i18n = intl.shared.components.roleComponent;

const RoleItemTemplate = hbs`{{matchText name query}} <span class="role-component__role">{{matchText short query}}</span>`;

let rolesCollection;

function getRoles() {
  if (rolesCollection) return rolesCollection;
  const currentOrg = Radio.request('bootstrap', 'currentOrg');
  rolesCollection = currentOrg.getRoles();
  return rolesCollection;
}

export default Droplist.extend({
  RoleItemTemplate,
  isCompact: false,
  defaultText() {
    const isCompact = this.getOption('isCompact');

    return isCompact ? null : i18n.defaultText;
  },
  popWidth() {
    const isCompact = this.getOption('isCompact');

    return isCompact ? null : this.getView().$el.outerWidth();
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
    const icon = { type: 'far', icon: 'user-circle' };
    const defaultText = result(this, 'defaultText');

    if (this.getOption('isCompact')) {
      return {
        className: 'button-secondary--compact',
        templateContext: {
          defaultText,
          attr: 'short',
          icon,
        },
      };
    }

    return {
      className: 'button-secondary w-100',
      templateContext: {
        defaultText,
        attr: 'name',
        icon,
      },
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
