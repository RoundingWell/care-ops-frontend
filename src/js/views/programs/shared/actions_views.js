import Radio from 'backbone.radio';

import 'sass/modules/buttons.scss';

import intl from 'js/i18n';

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

const OwnerComponent = RoleComponent.extend({
  canClear: true,
  initialize({ owner, isFromFlow }) {
    this.collection = getRoles();

    if (isFromFlow) this.defaultText = intl.programs.shared.actionsView.ownerComponent.defaultText;

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
