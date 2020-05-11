import RouterApp from 'js/base/routerapp';

import CheckInApp from 'js/apps/check-ins/check-in/check-in_app';

export default RouterApp.extend({
  routerAppName: 'CheckInsApp',

  childApps: {
    checkIn: CheckInApp,
  },

  eventRoutes: {
    'checkin': {
      action: 'showCheckIn',
      route: 'patient/:id/check-in/:id',
    },
  },
  showCheckIn(checkInId, patientId) {
    this.startCurrent('checkIn', { checkInId, patientId });
  },
});
