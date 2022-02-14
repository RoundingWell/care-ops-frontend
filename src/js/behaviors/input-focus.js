import { Behavior } from 'marionette';

export default Behavior.extend({
  selector: 'input',

  ui() {
    return {
      input: this.getOption('selector'),
    };
  },

  onDomRefresh() {
    const element = this.ui.input[0];
    if (!element || !element.style) return;
    element.style.transform = 'TranslateY(-10000px)';
    element.focus();
    setTimeout(function() {
      /* istanbul ignore next: edge case destroy during timeout */
      if (!element || !element.style) return;
      element.style.transform = 'none';
    }, 30);
  },
});
