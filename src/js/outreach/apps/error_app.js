import { bind } from 'underscore';

import RouterApp from 'js/base/routerapp';

import { DialogView } from 'js/outreach/views/dialog_views';

import {
  ErrorView,
  Error404View,
} from 'js/outreach/views/error_views';

export default RouterApp.extend({
  eventRoutes: {
    'unknownError': {
      route: 'outreach/unknown-error',
      action: 'show500',
      root: true,
    },
  },
  initialize() {
    this.router.route('*unknown', 'show404', bind(this.show404, this));
  },
  show404() {
    const dialogView = new DialogView();
    this.showView(dialogView);

    this.showChildView('content', new Error404View());
  },
  show500() {
    const dialogView = new DialogView();
    this.showView(dialogView);

    this.showChildView('content', new ErrorView());
  },
});
