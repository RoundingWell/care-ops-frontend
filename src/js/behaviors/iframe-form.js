import $ from 'jquery';
import Radio from 'backbone.radio';
import { Behavior } from 'marionette';

export default Behavior.extend({
  ui: {
    iframe: 'iframe',
  },
  onInitialize() {
    this.channel = Radio.channel(`form${ this.view.model.id }`);
  },
  onAttach() {
    const iframeWindow = this.ui.iframe[0].contentWindow;
    this.channel.reply('send', (message, args = {}) => {
      iframeWindow.postMessage({ message, args }, window.origin);
    }, this);

    $(window).on('message', ({ originalEvent }) => {
      const { data, origin } = originalEvent;
      /* istanbul ignore next: security check */
      if (origin !== window.origin || !data || !data.message) return;

      this.channel.request(data.message, data.args);
    });
  },
  /* istanbul ignore next: skipping form test flake */
  onBeforeDetach() {
    $(window).off('message');
    this.channel.stopReplying('send');
  },
});
