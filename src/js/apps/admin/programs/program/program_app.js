import Radio from 'backbone.radio';

import App from 'js/base/app';

import { LayoutView } from 'js/views/admin/programs/program/program_views';
import { SidebarView } from 'js/views/admin/programs/program/sidebar/sidebar-views';

export default App.extend({
  onBeforeStart() {
    this.getRegion().startPreloader();
  },
  beforeStart({ programId }) {
    return Radio.request('entities', 'fetch:programs:model', programId);
  },
  onStart(options, program) {
    this.setView(new LayoutView({ model: program }));

    this.showChildView('sidebar', new SidebarView({ model: program }));

    this.showView();
  },
});
