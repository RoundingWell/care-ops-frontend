import RouterApp from 'js/base/routerapp';

import ProgramsAllApp from 'js/apps/admin/list/programs-all_app';
import ProgramApp from 'js/apps/admin/program/program_app';
import ProgramFlowApp from 'js/apps/admin/program/flow/flow_app';
import CliniciansAllApp from 'js/apps/admin/list/clinicians-all_app';
import ReportsAllApp from 'js/apps/admin/list/reports-all_app';
import ReportApp from 'js/apps/admin/report/report_app';

export default RouterApp.extend({
  routerAppName: 'AdminApp',

  childApps: {
    cliniciansAll: CliniciansAllApp,
    programsAll: ProgramsAllApp,
    program: ProgramApp,
    programflow: ProgramFlowApp,
    reportsAll: ReportsAllApp,
    report: ReportApp,
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
    'clinician': {
      action: 'showCliniciansAll',
      route: 'clinicians/:id',
    },
    'clinician:new': {
      action: 'showCliniciansAll',
      route: 'clinicians/new',
    },
    'reports:all': {
      action: 'showReportsAll',
      route: 'reports',
      isList: true,
    },
    'report': {
      action: 'showReport',
      route: 'reports/:id',
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
    this.startRoute('cliniciansAll');
  },
  showReportsAll() {
    this.startRoute('reportsAll');
  },
  showReport(reportId) {
    this.startRoute('report', { reportId });
  },
});
