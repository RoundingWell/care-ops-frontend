const _ = require('underscore');
const faker = require('faker');
const dayjs = require('dayjs');

const roles = require('../test/roles.json');
const states = require('../test/states.json');

module.exports = {
  generate(index) {
    const baseRelationships = {
      editor: {
        data: {
          id: faker.random.uuid(),
          type: 'clinicians',
        },
      },
      action: {
        data: {
          id: faker.random.uuid(),
          type: 'patient-actions',
        },
      },
    };

    const baseAttributes = {
      date: faker.date.past(),
      type: null,
    };

    const types = {
      ActionCreated() {
        return {
          relationships: _.clone(baseRelationships),
          attributes: _.clone(baseAttributes),
        };
      },
      ActionClinicianAssigned() {
        const relationships = _.clone(baseRelationships);

        relationships.clinician = {
          data: {
            id: faker.random.uuid(),
            type: 'clinicians',
          },
        };

        return {
          relationships,
          attributes: _.clone(baseAttributes),
        };
      },
      ActionDetailsUpdated() {
        return {
          relationships: _.clone(baseRelationships),
          attributes: _.clone(baseAttributes),
        };
      },
      ActionDueDateUpdated() {
        const attributes = _.clone(baseAttributes);

        attributes.previous = faker.date.between(
          dayjs().subtract(1, 'week').format(),
          dayjs().add(1, 'week').format(),
        );

        attributes.value = faker.date.between(
          dayjs().subtract(1, 'week').format(),
          dayjs().add(1, 'week').format(),
        );

        return {
          relationships: _.clone(baseRelationships),
          attributes,
        };
      },
      ActionDueTimeUpdated() {
        const attributes = _.clone(baseAttributes);

        attributes.previous = dayjs(faker.date.past()).format('HH:mm:ss');
        attributes.value = dayjs(faker.date.past()).format('HH:mm:ss');

        return {
          relationships: _.clone(baseRelationships),
          attributes,
        };
      },
      ActionDurationUpdated() {
        const attributes = _.clone(baseAttributes);
        attributes.previous = faker.random.number({ min: 1, max: 1200 });
        attributes.value = faker.random.number({ min: 1, max: 1200 });

        return {
          relationships: _.clone(baseRelationships),
          attributes,
        };
      },
      ActionFormUpdated() {
        const relationships = _.clone(baseRelationships);

        relationships.form = {
          data: {
            id: faker.random.uuid(),
            type: 'forms',
          },
        };

        return {
          relationships,
          attributes: _.clone(baseAttributes),
        };
      },
      ActionFormRemoved() {
        const relationships = _.clone(baseRelationships);

        relationships.form = {
          data: {
            id: faker.random.uuid(),
            type: 'forms',
          },
        };

        return {
          relationships,
          attributes: _.clone(baseAttributes),
        };
      },
      ActionNameUpdated() {
        const attributes = _.clone(baseAttributes);
        attributes.previous = `${ faker.company.bsBuzz() } ${ faker.company.catchPhraseNoun() }`;
        attributes.value = `${ faker.company.bsBuzz() } ${ faker.company.catchPhraseNoun() }`;

        return {
          relationships: _.clone(baseRelationships),
          attributes,
        };
      },
      ActionRoleAssigned() {
        const relationships = _.clone(baseRelationships);
        const role = _.sample(roles);

        relationships.role = {
          data: {
            id: role.id,
            type: 'roles',
          },
        };

        return {
          relationships,
          attributes: _.clone(baseAttributes),
        };
      },
      ActionStateUpdated() {
        const relationships = _.clone(baseRelationships);
        const state = _.sample(states);

        relationships.state = {
          data: {
            id: state.id,
            type: 'states',
          },
        };

        return {
          relationships,
          attributes: _.clone(baseAttributes),
        };
      },
    };

    // shouldn't actually be random. We want at least 1 of each
    // there's a chance, even with 100, we won't get something
    const type = _.sample(_.keys(types));
    const { relationships, attributes } = _.result(types, type);
    attributes.type = type;

    return {
      id: faker.random.uuid(),
      attributes,
      relationships,
      type: 'events',
    };
  },
};
