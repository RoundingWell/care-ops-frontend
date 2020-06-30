const _ = require('underscore');
const faker = require('faker');


module.exports = {
  generate(index) {
    const baseRelationships = {
      patient: {
        data: {
          id: faker.random.uuid(),
          type: 'patients',
        },
      },
    };

    const baseAttributes = {
      event_type: null,
      date: faker.date.past(),
    };

    const event_types = {
      EngagementCheckInCompleted() {
        return {
          relationships: _.clone(baseRelationships),
          attributes: _.clone(baseAttributes),
        };
      },
    };

    // shouldn't actually be random. We want at least 1 of each
    // there's a chance, even with 100, we won't get something
    const event_type = _.sample(_.keys(event_types));
    const { relationships, attributes } = _.result(event_types, event_type);
    attributes.event_type = event_type;

    return {
      id: faker.random.uuid(),
      attributes,
      relationships,
      type: 'patient-events',
    };
  },
};
