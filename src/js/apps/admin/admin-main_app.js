import RouterApp from 'js/base/routerapp';

import ProgramsAllApp from 'js/apps/admin/list/programs-all_app';
import ProgramApp from 'js/apps/admin/program/program_app';

export default RouterApp.extend({
  routerAppName: 'AdminApp',

  childApps: {
    programsAll: ProgramsAllApp,
    program: ProgramApp,
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
  },
  showProgramsAll() {
    this.startCurrent('programsAll');
  },
  showProgram(programId) {
    this.startCurrent('program', { programId });
  },
});
