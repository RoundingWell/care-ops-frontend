import RouterApp from 'js/base/routerapp';

import ProgramsAllApp from 'js/apps/programs/list/programs-all_app';

export default RouterApp.extend({
  routerAppName: 'ProgramsApp',

  childApps: {
    programsAll: ProgramsAllApp,
  },

  eventRoutes: {
    'programs:all': {
      action: 'showProgramsAll',
      route: 'programs',
      isList: true,
    },
  },
  showProgramsAll() {
    this.startCurrent('programsAll');
  },
});
