const _ = require('underscore');
const faker = require('@roundingwellos/faker');

const teams = require('../test/teams.json');
const states = require('../test/states.json');

module.exports = {
  generate(index) {
    const baseRelationships = {
      editor: {
        data: {
          id: faker.datatype.uuid(),
          type: 'clinicians',
        },
      },
      action: {
        data: {
          id: faker.datatype.uuid(),
          type: 'patient-actions',
        },
      },
    };

    const baseAttributes = {
      date: faker.date.past(),
      type: null,
    };

    const types = {
      FlowCreated() {
        return {
          relationships: baseRelationships,
          attributes: _.clone(baseAttributes),
        };
      },
      FlowProgramStarted() {
        const relationships = _.clone(baseRelationships);
        relationships.program = {
          data: {
            id: '11111',
            type: 'programs',
          },
        };

        return {
          relationships,
          attributes: _.clone(baseAttributes),
        };
      },
      FlowClinicianAssigned() {
        const relationships = _.clone(baseRelationships);

        relationships.clinician = {
          data: {
            id: faker.datatype.uuid(),
            type: 'clinicians',
          },
        };

        return {
          relationships,
          attributes: _.clone(baseAttributes),
        };
      },
      FlowDetailsUpdated() {
        return {
          relationships: _.clone(baseRelationships),
          attributes: _.clone(baseAttributes),
        };
      },
      FlowNameUpdated() {
        const attributes = _.clone(baseAttributes);
        attributes.previous = `${ faker.company.bsBuzz() } ${ faker.company.catchPhraseNoun() }`;
        attributes.value = `${ faker.company.bsBuzz() } ${ faker.company.catchPhraseNoun() }`;

        return {
          relationships: _.clone(baseRelationships),
          attributes,
        };
      },
      FlowTeamAssigned() {
        const relationships = _.clone(baseRelationships);
        const team = _.sample(teams);

        relationships.team = {
          data: {
            id: team.id,
            type: 'teams',
          },
        };

        return {
          relationships,
          attributes: _.clone(baseAttributes),
        };
      },
      FlowStateUpdated() {
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
      id: faker.datatype.uuid(),
      attributes,
      relationships,
      type: 'events',
    };
  },
};
