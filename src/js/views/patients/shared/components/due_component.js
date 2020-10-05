import dayjs from 'dayjs';
import hbs from 'handlebars-inline-precompile';
import { Component } from 'marionette.toolkit';

import 'sass/modules/buttons.scss';

import intl from 'js/i18n';

import Datepicker from 'js/components/datepicker';

import './due-component.scss';

const i18n = intl.patients.shared.components.dueComponent;

const DueTemplate = hbs`
  <span{{#if isOverdue}} class="is-overdue"{{/if}}>
    {{far "calendar-alt"}}{{formatDateTime date dateFormat inputFormat="YYYY-MM-DD" defaultHtml=defaultText}}
  </span>
`;

export default Component.extend({
  isCompact: false,
  viewEvents: {
    'click': 'onClick',
  },
  onClick() {
    this.toggleState('isActive');
  },
  stateEvents: {
    'change:isActive': 'onChangeIsActive',
    'change:selected': 'onChangeStateSelected',
  },
  onChangeIsActive(state, isActive) {
    const view = this.getView();
    view.$el.toggleClass('is-active', isActive);

    if (!isActive) return;

    // blur off the button so enter won't trigger select repeatedly
    view.$el.blur();

    this.showDatepicker();
  },
  viewOptions() {
    const isCompact = this.getOption('isCompact');
    const selected = this.getState('selected');
    return {
      tagName: 'button',
      attributes: {
        disabled: this.getState('isDisabled'),
      },
      className() {
        if (isCompact && selected) {
          return 'button-secondary--compact due-component';
        }

        if (isCompact && !selected) {
          return 'button-secondary--compact due-component is-icon-only';
        }

        return 'button-secondary w-100 due-component';
      },
      triggers: {
        'click': 'click',
      },
      template: DueTemplate,
      templateContext: {
        defaultText: isCompact ? '' : i18n.defaultText,
        dateFormat: isCompact ? 'SHORT' : 'LONG',
        date: selected,
        isOverdue: selected ? dayjs(selected).isBefore(dayjs(), 'day') : false,
      },
    };
  },
  initialize({ date }) {
    this.setState({ selected: date });
  },
  showDatepicker() {
    const datepicker = new Datepicker({
      uiView: this.getView(),
      state: { selectedDate: this.getState('selected') },
    });

    this.listenTo(datepicker, {
      'change:selectedDate'(date) {
        this.setState('selected', date);
        datepicker.destroy();
      },
      'destroy': this.onDatepickerDestroy,
    });

    datepicker.show();
  },
  onDatepickerDestroy() {
    this.toggleState('isActive', false);
  },
  onChangeStateSelected(state, selected) {
    this.show();
    this.triggerMethod('change:due', selected);
  },
});
