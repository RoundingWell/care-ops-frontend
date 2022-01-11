import Radio from 'backbone.radio';

import { PUBLISH_STATE_STATUS } from 'js/static';

import PublishedComponent from './components/published_component';
import RoleComponent from 'js/views/shared/components/role';

const FlowPublishedComponent = PublishedComponent.extend({
  isPublishDisabled() {
    const flow = this.getOption('flow');
    const programActions = flow.getActions();
    return !programActions.some({ status: PUBLISH_STATE_STATUS.PUBLISHED });
  },
  isConditionalAvailable: false,
  onPicklistSelect({ model }) {
    if (model.id === PUBLISH_STATE_STATUS.PUBLISHED && this.isPublishDisabled()) {
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
