import { flatten, map, range } from 'underscore';
import Backbone from 'backbone';
import dayjs from 'dayjs';

export default Backbone.Model.extend({
  initialize() {
    this.set('selectedDate', this.dayjs('selectedDate'));
    this.setCurrentMonth(this.dayjs('currentMonth'));

    this.on({
      'change:selectedDate': this.onChangeSelectedDate,
      'change:currentMonth': this.onChangeCurrentMonth,
    });
  },
  onChangeCurrentMonth(model, currentMonth) {
    if (!(currentMonth instanceof dayjs)) {
      this.set('currentMonth', dayjs(currentMonth));
    }
  },
  onChangeSelectedDate(model, selectedDate) {
    if (selectedDate && !(selectedDate instanceof dayjs)) {
      this.set('selectedDate', dayjs(selectedDate));
      return;
    }
    this.setCurrentMonth(selectedDate);
  },
  setCurrentMonth(date) {
    // If date === null dayjs(date) will fail
    const currentMonth = date ? dayjs(date) : dayjs();

    this.set('currentMonth', currentMonth.startOf('month'));
  },
  getCurrentMonth() {
    return this.dayjs('currentMonth');
  },
  getNextMonth() {
    return this.dayjs('currentMonth').add(1, 'months');
  },
  getPrevMonth() {
    return this.dayjs('currentMonth').subtract(1, 'months');
  },
  getCalendar() {
    const dates = flatten([
      this._getPreDates(),
      this._getDates(),
      this._getPostDates(),
    ]);

    return new Backbone.Collection(dates);
  },
  _getPreDates() {
    const startDay = this.getCurrentMonth().weekday();

    // Bail if Sunday (0)
    if (!startDay) return [];

    const daysInPrev = this.getPrevMonth().daysInMonth();

    return map(range(daysInPrev - (startDay - 1), daysInPrev + 1), day => ({
      date: String(day),
      isOtherMonth: true,
    }));
  },
  _getPostDates() {
    const endDay = this.getCurrentMonth().endOf('month').weekday();

    // Bail if end
    if (endDay === 6) return [];

    return map(range(1, 7 - endDay), day => ({
      date: String(day),
      isOtherMonth: true,
    }));
  },
  _getDates() {
    const currentMonth = this.getCurrentMonth();
    const todaysDate = currentMonth.isSame(dayjs(), 'month') && dayjs().date();

    return map(range(1, currentMonth.daysInMonth() + 1), day => {
      const isDisabled = this._isBeforeBeginDate(day) || this._isAfterEndDate(day);

      return {
        date: String(day),
        isDisabled,
        isSelected: !isDisabled && this._isSelectedDate(day),
        isToday: todaysDate === day,
      };
    });
  },
  _isBeforeBeginDate(dateNum) {
    const beginDate = this.dayjs('beginDate');

    if (!beginDate) return false;

    const date = this.getCurrentMonth().date(dateNum);

    return date.isBefore(beginDate, 'day');
  },
  _isAfterEndDate(dateNum) {
    const endDate = this.dayjs('endDate');

    if (!endDate) return false;

    const date = this.getCurrentMonth().date(dateNum);

    return date.isAfter(endDate, 'day');
  },
  _isSelectedDate(dateNum) {
    const selectedDate = this.dayjs('selectedDate');

    if (!selectedDate || !this.getCurrentMonth().isSame(selectedDate, 'month')) return false;

    return selectedDate.date() === dateNum;
  },
});
