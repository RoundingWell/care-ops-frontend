import Radio from 'backbone.radio';

import RouterApp from 'js/base/routerapp';

import ProgramsAllApp from 'js/apps/admin/list/programs-all_app';
import CliniciansAllApp from 'js/apps/admin/list/clinicians-all_app';
import ProgramApp from 'js/apps/admin/program/program_app';
import ProgramFlowApp from 'js/apps/admin/program/flow/flow_app';

export default RouterApp.extend({
  routerAppName: 'AdminApp',

  childApps: {
    cliniciansAll: CliniciansAllApp,
    programsAll: ProgramsAllApp,
    program: ProgramApp,
    programflow: ProgramFlowApp,
  },

  eventRoutes: {
    'programs:all': {
      action: 'showProgramsAll',
      route: 'programs',
      isList: true,
    },
    'program:details': {
      action: 'showProgram',
      route: 'program/:id',
    },
    'program:action': {
      action: 'showProgram',
      route: 'program/:id/action/:id',
    },
    'program:action:new': {
      action: 'showProgram',
      route: 'program/:id/action',
    },
    'programFlow:new': {
      action: 'showProgram',
      route: 'program/:id/flow',
    },
    'programFlow': {
      action: 'showProgramFlow',
      route: 'program-flow/:id',
    },
    'programFlow:action': {
      action: 'showProgramFlow',
      route: 'program-flow/:id/action/:id',
    },
    'programFlow:action:new': {
      action: 'showProgramFlow',
      route: 'program-flow/:id/action',
    },
    'clinicians:all': {
      action: 'showCliniciansAll',
      route: 'clinicians',
      isList: true,
    },
  },
  showProgramsAll() {
    this.startCurrent('programsAll');
  },
  showProgram(programId) {
    this.startRoute('program', { programId });
  },
  showProgramFlow(flowId) {
    this.startRoute('programflow', { flowId });
  },
  showCliniciansAll() {
    /* istanbul ignore if */
    if (!_DEVELOP_) {
      Radio.trigger('event-router', 'notFound');
      return;
    }

    this.startCurrent('cliniciansAll');
  },
});
