import Radio from 'backbone.radio';

import FormComponent from './components/form_component';
import RoleComponent from './components/role_component';
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
