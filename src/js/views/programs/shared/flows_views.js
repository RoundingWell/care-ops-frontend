import Radio from 'backbone.radio';

import PublishedComponent from './components/published_component';
import TeamComponent from 'js/views/shared/components/team';

const FlowPublishedComponent = PublishedComponent.extend({
  isPublishDisabled() {
    const flow = this.getOption('flow');
    const programActions = flow.getActions();
    return !programActions.some({ published: true });
  },
  isConditionalAvailable: false,
  onPicklistSelect({ model }) {
    if (model.get('published') && this.isPublishDisabled()) {
      return;
    }

    this.setState('selected', model);
    this.popRegion.empty();
  },
});

let teamsCollection;

function getTeams() {
  if (teamsCollection) return teamsCollection;
  teamsCollection = Radio.request('bootstrap', 'teams');
  return teamsCollection;
}

const OwnerComponent = TeamComponent.extend({
  canClear: true,
  initialize({ owner }) {
    this.collection = getTeams();

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
