import 'js/base/setup';
import 'js/config';

import $ from 'jquery';
import Backbone from 'backbone';
import Radio from 'backbone.radio';

import initPlatform from 'js/utils/platform';
import 'js/base/moment';
import App from 'js/base/app';

import Datepicker from 'js/components/datepicker';
import Droplist from 'js/components/droplist';
import Optionlist from 'js/components/optionlist';
import Selectlist from 'js/components/selectlist';
import Tooltip from 'js/components/tooltip';

import 'js/entities-service';
import ActivityService from 'js/services/activity';
import AlertService from 'js/services/alert';
import AuthService from 'js/services/auth';
import HistoryService from 'js/services/history';
import ModalService from 'js/services/modal';

import AppFrameApp from 'js/apps/globals/app-frame_app';
import ErrorApp from 'js/apps/globals/error_app';

import { RootView } from 'js/views/globals/root_views';

const $document = $(document);

const Application = App.extend({
  initialize() {
    initPlatform();
  },

  // Before the application starts make sure:
  // - A root layout is attached
  // - Global services are started
  onBeforeStart() {
    this.setView(new RootView());
    this.configComponents();
    this.startServices();
    this.setListeners();
  },

  configComponents() {
    Tooltip.setRegion(this.getRegion('tooltip'));
    const popRegion = this.getRegion('pop');
    Datepicker.setRegion(popRegion);
    Droplist.setPopRegion(popRegion);
    Optionlist.setRegion(popRegion);
    Selectlist.setPopRegion(popRegion);
  },

  startServices() {
    new ActivityService();
    new AlertService({ region: this.getRegion('alert') });
    new AuthService();
    new ModalService({
      modalRegion: this.getRegion('modal'),
      modalSmallRegion: this.getRegion('modalSmall'),
    });
  },

  setListeners() {
    $(window).on('resize.app', function() {
      Radio.trigger('user-activity', 'window:resize');
    });

    $document.on('keydown.app', function(evt) {
      Radio.trigger('user-activity', 'document:keydown', evt);
    });

    this.setMouseListeners();
  },

  setMouseListeners() {
    $document.on('mouseover.app', function(evt) {
      Radio.trigger('user-activity', 'document:mouseover', evt);
    });

    /* istanbul ignore next: No need to test jquery functionality */
    $document.on('mouseleave.app', function(evt) {
      Radio.trigger('user-activity', 'document:mouseleave', evt);
    });

    $('body').on('mousedown.app touchstart.app', function(evt) {
      Radio.trigger('user-activity', 'body:down', evt);
    });
  },

  childApps: {
    appFrame: AppFrameApp,
  },

  //
  // Start all Global Apps and Main Apps
  // Finish with starting the backbone history to kick off the first router
  onStart() {
    new ErrorApp({ region: this.getRegion('error') });

    this.startChildApp('appFrame', { view: this.getView().appView });

    Backbone.history.start({ pushState: true });

    new HistoryService();
  },

  emptyRegion(name) {
    return this.getRegion(name).empty();
  },
});

const app = new Application();

document.addEventListener('DOMContentLoaded', function() {
  app.start();
});

export default app;
