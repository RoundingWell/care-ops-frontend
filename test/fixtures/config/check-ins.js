const faker = require('faker');
const moment = require('moment');

module.exports = {
  generate() {
    const startDate = faker.date.between(
      moment().utc().subtract(2, 'weeks').format(),
      moment().utc().format(),
    );
    const finishDate = moment(startDate).utc().add(1, 'day');

    return {
      id: faker.random.uuid(),
      issue_id: 14,
      evaluated: true,
      started_at: startDate,
      finished_at: finishDate,
      checkin_duration: 31,
      requesting_user_id: null,
      responder: 'patient',
    };
  },
};
