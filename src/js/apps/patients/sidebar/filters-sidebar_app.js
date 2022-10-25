import Radio from 'backbone.radio';

import App from 'js/base/app';

import { LayoutView, CustomFiltersView, groupLabelView } from 'js/views/patients/sidebar/filters/filters-sidebar_views';

export default App.extend({
  onStart() {
    this.currentClinician = Radio.request('bootstrap', 'currentUser');
    this.directories = Radio.request('bootstrap', 'currentOrg:directories');

    this.showView(new LayoutView());

    this.showCustomFiltersView();
  },
  viewEvents: {
    'close': 'stop',
    'click:clearFilters': 'onClearFilters',
  },
  showCustomFiltersView() {
    const collection = this.directories.clone();
    const groups = this.currentClinician.getGroups();

    if (groups.length > 1) {
      const groupDirectory = collection.unshift({
        name: groupLabelView,
        slug: 'groupId',
      });

      groupDirectory.options = groups;
    }

    const customFiltersView = new CustomFiltersView({
      collection,
      state: this.getState(),
    });

    this.showChildView('customFilters', customFiltersView);
  },
  onClearFilters() {
    this.getState().clear();
  },
  onStop() {
    Radio.request('sidebar', 'close');
  },
});
