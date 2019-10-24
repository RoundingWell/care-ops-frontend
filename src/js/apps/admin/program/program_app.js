import Radio from 'backbone.radio';

import App from 'js/base/app';

import { LayoutView } from 'js/views/admin/program/program_views';
import { SidebarView } from 'js/views/admin/program/sidebar/sidebar-views';

export default App.extend({
  onBeforeStart() {
    this.getRegion().startPreloader();
  },
  beforeStart({ programId }) {
    return Radio.request('entities', 'fetch:programs:model', programId);
  },
  onStart(options, program) {
    this.program = program;
    this.setView(new LayoutView({ model: program }));

    this.showSidebar();

    // Show/Empty program sidebar based on app sidebar
    this.listenTo(Radio.channel('sidebar'), {
      'show': this.emptySidebar,
      'close': this.showSidebar,
    });

    this.showView();
  },
  showSidebar() {
    const sidebarView = new SidebarView({ model: this.program });

    this.listenTo(sidebarView, {
      'edit': this.onEdit,
    });

    this.showChildView('sidebar', sidebarView);
  },
  emptySidebar() {
    this.getRegion('sidebar').empty();
  },
  onEdit() {
    Radio.request('sidebar', 'start', 'program', { program: this.program });
  },
});
