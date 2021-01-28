import Radio from 'backbone.radio';

import PublishedComponent from './components/published_component';
import RoleComponent from './components/role_component';

const FlowPublishedComponent = PublishedComponent.extend({
  isPublishDisabled() {
    const flow = this.getOption('flow');
    const programActions = flow.getActions();
    return !programActions.some({ status: 'published' });
  },
  onPicklistSelect({ model }) {
    if (model.id === 'published' && this.isPublishDisabled()) {
      return;
    }

    this.setState('selected', model);
    this.popRegion.empty();
  },
});

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
  FlowPublishedComponent,
  OwnerComponent,
};
