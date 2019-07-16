const _ = require('underscore');
const faker = require('faker');
const moment = require('moment');

const { generate } = require('./clinicians');
const roles = require('../test/roles.json');
const states = require('../test/states.json');

module.exports = {
  generate(index) {
    const types = {
      ActionCreated() {
        return;
      },
      ActionClinicianAssigned() {
        return {
          to: generate(),
        };
      },
      ActionDetailsUpdated() {
        return;
      },
      ActionDueDateUpdated() {
        return {
          from: faker.date.between(
            moment.utc().subtract(1, 'week').format(),
            moment.utc().add(1, 'week').format()
          ),
          to: faker.date.between(
            moment.utc().subtract(1, 'week').format(),
            moment.utc().add(1, 'week').format()
          ),
        };
      },
      ActionDurationUpdated() {
        return {
          from: faker.random.number({ min: 1, max: 1200 }),
          to: faker.random.number({ min: 1, max: 1200 }),
        };
      },
      ActionNameUpdated() {
        return {
          from: `${ faker.company.bsBuzz() } ${ faker.company.catchPhraseNoun() }`,
          to: `${ faker.company.bsBuzz() } ${ faker.company.catchPhraseNoun() }`,
        };
      },
      ActionRoleAssigned() {
        return {
          to: _.sample(roles),
        };
      },
      ActionStateUpdated() {
        return {
          from: _.sample(states),
          to: _.sample(states),
        };
      },
    };

    const editor = generate();
    editor.role = _.sample(roles);

    // Base Metadata
    const metadata = {
      entityId: [
        faker.random.uuid(),
      ],
      editor,
    };

    // shouldn't actually be random. We want at least 1 of each
    // there's a chance, even with 100, we won't get something
    const type = _.sample(_.keys(types));
    const value = _.result(types, type);
    if (_.isObject(value)) {
      metadata.value = value;
    }

    return {
      id: faker.random.uuid(),
      type,
      date: faker.date.past(),
      metadata,
    };
  },
};
