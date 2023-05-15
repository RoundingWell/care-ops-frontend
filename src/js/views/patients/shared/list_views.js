import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';

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
  <div>{{formatMessage (intlGet "patients.shared.listViews.countView.maximumListCount") maximumCount=maximumCount totalInDb=totalInDb isFlowList=isFlowList}}</div>
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
    const totalInDb = this.getOption('totalInDb');

    if (!this.collection || !filteredCollection.length) return hbs``;

    const hasReachedMaximum = this.collection.length < totalInDb;
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
      maximumCount: this.collection.length,
      count: filteredCollection.length,
      isFlowList: !!this.getOption('isFlowList'),
      totalInDb: this.getOption('totalInDb'),
    };
  },
});

export {
  CountView,
};
