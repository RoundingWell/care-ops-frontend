import _ from 'underscore';

import 'sass/modules/fill-window.scss';

import RouterApp from 'js/base/routerapp';

import Error404Template from 'js/views/globals/error-404.item.hbs';

export default RouterApp.extend({
  initialize() {
    this.router.route('*unknown', '404', _.bind(this.start, this));
  },

  onStop() {
    this.getRegion().empty();
  },

  onStart() {
    this.showView({
      className: 'error-page',
      template: Error404Template,
    });
  },
});

