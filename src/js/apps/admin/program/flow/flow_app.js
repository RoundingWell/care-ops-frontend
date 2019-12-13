import Radio from 'backbone.radio';

import intl from 'js/i18n';

import App from 'js/base/subrouterapp';

import { LayoutView, ContextTrailView, HeaderView } from 'js/views/admin/program/flow/flow_views';
import { SidebarView } from 'js/views/admin/program/sidebar/sidebar-views';

export default App.extend({
  onBeforeStart() {
    this.showView(new LayoutView());
  },
  beforeStart({ flowId, programId }) {
    return [
      Radio.request('entities', 'fetch:programFlows:model', flowId),
      Radio.request('entities', 'fetch:programs:model', programId),
    ];
  },
  onFail({ programId }) {
    Radio.request('alert', 'show:error', intl.admin.program.flowApp.notFound);
    Radio.trigger('event-router', 'program:details', programId);
    this.stop();
  },
  onStart({ currentRoute }, [flow], [program]) {
    this.flow = flow;
    this.program = program;

    this.showChildView('contextTrail', new ContextTrailView({
      model: this.flow,
      program: this.program,
    }));

    this.showHeader();

    this.showProgramSidebar();

    // Show/Empty program sidebar based on app sidebar
    this.listenTo(Radio.channel('sidebar'), {
      'show': this.emptySidebar,
      'close': this.showProgramSidebar,
    });
  },

  showHeader() {
    const headerView = new HeaderView({ model: this.flow });

    this.listenTo(headerView, {
      'edit': this.onEditFlow,
    });

    this.showChildView('header', headerView);
  },

  showProgramSidebar() {
    const sidebarView = new SidebarView({ model: this.program });

    this.listenTo(sidebarView, {
      'edit': this.onEditProgram,
    });

    this.showChildView('sidebar', sidebarView);
  },

  emptySidebar() {
    this.getRegion('sidebar').empty();
  },

  onEditProgram() {
    Radio.request('sidebar', 'start', 'program', { program: this.program });
  },

  onEditFlow() {
    Radio.request('sidebar', 'start', 'programFlow', { flow: this.flow, programId: this.program.id });
  },
});
