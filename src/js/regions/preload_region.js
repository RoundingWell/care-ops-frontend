import anime from 'animejs';

import hbs from 'handlebars-inline-precompile';

import { Region, View } from 'marionette';

import './preload.scss';

const SpinnerTemplate = hbs`
<div class="spinner-circle js-spinner" style="opacity:0">
  <div class="spinner-child"></div>
  <div class="spinner-child"></div>
  <div class="spinner-child"></div>
  <div class="spinner-child"></div>
  <div class="spinner-child"></div>
  <div class="spinner-child"></div>
  <div class="spinner-child"></div>
  <div class="spinner-child"></div>
  <div class="spinner-child"></div>
  <div class="spinner-child"></div>
  <div class="spinner-child"></div>
  <div class="spinner-child"></div>
</div>
<p class="u-margin--t js-loading" style="opacity:0">{{ @intl.regions.preload.loading }}</p>`;

const SpinnerView = View.extend({
  className: 'spinner',
  template: SpinnerTemplate,
  ui: {
    spinner: '.js-spinner',
    loading: '.js-loading',
  },
  onRender() {
    const timeout = this.getOption('timeout');

    if (!timeout) {
      this.showLoader(0, 300);
      return;
    }

    this.showLoader(timeout / 2, timeout / 2 + 200);
  },
  showLoader(delay, duration) {
    const anim = anime.timeline({
      easing: 'easeInQuad',
      delay,
    });

    anim
      .add({
        opacity: [0, 1],
        targets: this.ui.spinner[0],
        duration,
      })
      .add({
        opacity: [0, 1],
        targets: this.ui.loading[0],
        duration: duration - 100,
      }, 100);
  },
});

export default Region.extend({
  timeout: 500,
  startPreloader() {
    this.show(new SpinnerView({ timeout: this.getOption('timeout') }));
  },
});
