const faker = require('faker');
const dayjs = require('dayjs');

module.exports = {
  generate() {
    const startDate = faker.date.between(
      dayjs().subtract(2, 'weeks').format(),
      dayjs().format(),
    );
    const finishDate = dayjs(startDate).add(1, 'day');

    return {
      id: faker.datatype.uuid(),
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
