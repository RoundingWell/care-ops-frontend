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
  onFail() {
    Radio.request('alert', 'show:error', intl.admin.program.flowApp.notFound);
    this.stop();
  },
  onStart({ currentRoute }, [flow], [program]) {
    this.flow = flow;

    this.showChildView('contextTrail', new ContextTrailView({
      model: this.flow,
      program,
    }));

    this.showChildView('header', new HeaderView({
      model: this.flow,
    }));

    this.showProgramSidebar(program);
  },
  showProgramSidebar(program) {
    const sidebarView = new SidebarView({ model: program });

    this.listenTo(sidebarView, {
      'edit': this.onEdit,
    });

    this.showChildView('sidebar', sidebarView);
  },

});
