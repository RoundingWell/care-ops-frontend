import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';

import { MAXIMUM_LIST_COUNT } from 'js/static';

const ListCountTemplate = hbs`
  <strong>
    {{#if isFlowList}}
      {{formatMessage (intlGet "patients.shared.listViews.countView.flowsCount") itemCount=count}}
    {{else}}
      {{formatMessage (intlGet "patients.shared.listViews.countView.actionsCount") itemCount=count}}
    {{/if}}
  </strong>
`;

const MaximumCountTemplate = hbs`
  <div>{{formatMessage (intlGet "patients.shared.listViews.countView.maximumListCount") maximumCount=maximumCount isFlowList=isFlowList}}</div>
  <div>{{ @intl.patients.shared.listViews.countView.narrowFilters }}</div>
`;

const MaximumCountNarrowedTemplate = hbs`
  <div>
    {{formatMessage (intlGet "patients.shared.listViews.countView.maximumListCountNarrowed") itemCount=count maximumCount=maximumCount isFlowList=isFlowList}}
  </div>
  <div>{{ @intl.patients.shared.listViews.countView.narrowFilters }}</div>
`;

const CountView = View.extend({
  getTemplate() {
    const filteredCollection = this.getOption('filteredCollection');

    if (!this.collection || !filteredCollection.length) return hbs``;

    const hasReachedMaximum = this.collection.length === MAXIMUM_LIST_COUNT;
    const isFindInListApplied = hasReachedMaximum && filteredCollection.length < this.collection.length;

    if (!hasReachedMaximum) {
      return ListCountTemplate;
    }

    if (isFindInListApplied) {
      return MaximumCountNarrowedTemplate;
    }

    return MaximumCountTemplate;
  },
  templateContext() {
    const filteredCollection = this.getOption('filteredCollection');

    return {
      maximumCount: MAXIMUM_LIST_COUNT,
      count: filteredCollection.length,
      isFlowList: !!this.getOption('isFlowList'),
    };
  },
});

export {
  CountView,
};
