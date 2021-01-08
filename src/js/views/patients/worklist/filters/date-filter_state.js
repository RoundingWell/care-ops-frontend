import Backbone from 'backbone';
import dayjs from 'dayjs';

export default Backbone.Model.extend({
  setRelativeDate(relativeDate) {
    this.set({
      relativeDate,
      selectedDate: null,
      selectedMonth: null,
    });
  },
  setMonth(selectedMonth) {
    this.set({
      relativeDate: null,
      selectedDate: null,
      selectedMonth,
    });
  },
  setDate(selectedDate) {
    this.set({
      relativeDate: null,
      selectedDate,
      selectedMonth: null,
    });
  },
  incrementBackward() {
    if (this.get('selectedDate')) {
      this.setDate(dayjs(this.get('selectedDate')).subtract(1, 'day'));
      return;
    }

    if (this.get('selectedMonth')) {
      this.setMonth(dayjs(this.get('selectedMonth')).subtract(1, 'month').startOf('month'));
      return;
    }

    const relativeDate = this.get('relativeDate');

    if (relativeDate === 'today') {
      this.setDate(dayjs().subtract(1, 'day'));
      return;
    }

    if (relativeDate === 'yesterday') {
      this.setDate(dayjs().subtract(2, 'days'));
      return;
    }

    this.setMonth(dayjs().subtract(1, 'month').startOf('month'));
  },
  incrementForward() {
    if (this.get('selectedDate')) {
      this.setDate(dayjs(this.get('selectedDate')).add(1, 'day'));
      return;
    }

    if (this.get('selectedMonth')) {
      this.setMonth(dayjs(this.get('selectedMonth')).add(1, 'month').startOf('month'));
      return;
    }

    const relativeDate = this.get('relativeDate');

    if (relativeDate === 'today') {
      this.setDate(dayjs().add(1, 'day'));
      return;
    }

    if (relativeDate === 'yesterday') {
      this.setDate(dayjs());
      return;
    }

    this.setMonth(dayjs().add(1, 'month').startOf('month'));
  },
});
