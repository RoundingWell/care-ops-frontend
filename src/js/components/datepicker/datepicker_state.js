import _ from 'underscore';
import Backbone from 'backbone';
import moment from 'moment';

export default Backbone.Model.extend({
  initialize() {
    this.set('selectedDate', this.moment('selectedDate'));
    this.setCurrentMonth(this.moment('currentMonth'));

    this.on({
      'change:selectedDate': this.onChangeSelectedDate,
      'change:currentMonth': this.onChangeCurrentMonth,
    });
  },
  onChangeCurrentMonth(model, currentMonth) {
    if (!moment.isMoment(currentMonth)) {
      this.set('currentMonth', moment(currentMonth));
    }
  },
  onChangeSelectedDate(model, selectedDate) {
    if (selectedDate && !moment.isMoment(selectedDate)) {
      this.set('selectedDate', moment(selectedDate));
      return;
    }
    this.setCurrentMonth(selectedDate);
  },
  setCurrentMonth(date) {
    // If date === null moment(date) will fail
    const currentMonth = date ? moment(date) : moment();

    this.set('currentMonth', currentMonth.startOf('month'));
  },
  getCurrentMonth() {
    return this.moment('currentMonth');
  },
  getNextMonth() {
    return this.moment('currentMonth').add(1, 'months');
  },
  getPrevMonth() {
    return this.moment('currentMonth').subtract(1, 'months');
  },
  getCalendar() {
    const dates = _.flatten([
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

    return _.map(_.range(daysInPrev - (startDay - 1), daysInPrev + 1), day => ({
      date: String(day),
      isOtherMonth: true,
    }));
  },
  _getPostDates() {
    const endDay = this.getCurrentMonth().endOf('month').weekday();

    // Bail if end
    if (endDay === 6) return [];

    return _.map(_.range(1, 7 - endDay), day => ({
      date: String(day),
      isOtherMonth: true,
    }));
  },
  _getDates() {
    const currentMonth = this.getCurrentMonth();
    const todaysDate = currentMonth.isSame(moment(), 'month') && moment().date();

    return _.map(_.range(1, currentMonth.daysInMonth() + 1), day => {
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
    const beginDate = this.moment('beginDate');

    if (!beginDate) return false;

    const date = this.getCurrentMonth().date(dateNum);

    return date.isBefore(beginDate, 'day');
  },
  _isAfterEndDate(dateNum) {
    const endDate = this.moment('endDate');

    if (!endDate) return false;

    const date = this.getCurrentMonth().date(dateNum);

    return date.isAfter(endDate, 'day');
  },
  _isSelectedDate(dateNum) {
    const selectedDate = this.moment('selectedDate');

    if (!selectedDate || !this.getCurrentMonth().isSame(selectedDate, 'month')) return false;

    return selectedDate.date() === dateNum;
  },
});
