import Radio from 'backbone.radio';
import hbs from 'handlebars-inline-precompile';

import 'sass/modules/buttons.scss';

import FormComponent from './components/form_component';
import RoleComponent from 'js/views/shared/components/role';
import DueDayComponent from './components/dueday_component';
import PublishedComponent from './components/published_component';

let rolesCollection;

function getRoles() {
  if (rolesCollection) return rolesCollection;
  const currentOrg = Radio.request('bootstrap', 'currentOrg');
  rolesCollection = currentOrg.getRoles();
  return rolesCollection;
}

const RoleButtonTemplate = hbs`{{far "user-circle"}}{{ name }}{{#unless name}}<em>{{ @intl.programs.shared.actionsView.ownerComponent.defaultText }}</em>{{/unless}}`;
const RoleShortButtonTemplate = hbs`{{far "user-circle"}}{{ short }}{{#unless short}}<em>{{ @intl.programs.shared.actionsView.ownerComponent.defaultText }}</em>{{/unless}}`;

const OwnerComponent = RoleComponent.extend({
  canClear: true,
  getButtonTemplate() {
    if (this.getOption('fromFlow')) return RoleButtonTemplate;
    return this.RoleButtonTemplate;
  },
  getShortButtonTemplate() {
    if (this.getOption('fromFlow')) return RoleShortButtonTemplate;
    return this.RoleShortButtonTemplate;
  },
  getClassName(isCompact) {
    const fromFlow = this.getOption('fromFlow');
    const selected = this.getState('selected');

    if (!fromFlow && !selected && isCompact) {
      return 'button-secondary--compact is-icon-only';
    }

    return isCompact ? 'button-secondary--compact' : 'button-secondary w-100';
  },
  initialize({ owner }) {
    this.collection = getRoles();

    this.setState({ selected: owner });
  },
  onChangeSelected(selected) {
    this.triggerMethod('change:owner', selected);
  },
});

export {
  FormComponent,
  OwnerComponent,
  DueDayComponent,
  PublishedComponent,
};
