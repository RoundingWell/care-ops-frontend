import { bind } from 'underscore';

import RouterApp from 'js/base/routerapp';

import { ErrorView } from 'js/views/globals/error/error_views';

export default RouterApp.extend({
  eventRoutes: {
    'notFound': {
      action: 'show404',
      route: '404',
    },
    'error': {
      action: 'show500',
      route: '500',
    },
  },

  initialize() {
    this.router.route('*unknown', '404', bind(this.show404, this));
  },

  viewEvents: {
    'click:back': 'stop',
  },

  onBeforeStop() {
    this.getRegion().empty();
  },

  show404() {
    this.start();
    this.showView(new ErrorView({ is404: true }));
  },

  show500() {
    this.showView(new ErrorView({ is500: true }));
  },
});

