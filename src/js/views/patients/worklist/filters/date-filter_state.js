import Backbone from 'backbone';

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
});
