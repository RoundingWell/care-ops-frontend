import _ from 'underscore';
import { getResource, getRelationship } from 'helpers/json-api';

Cypress.Commands.add('routeActionComments', (mutator = _.identity) => {
  cy
    .fixture('collections/comments').as('fxComments')
    .fixture('collections/clinicians').as('fxClinicians');

  cy.route({
    url: '/api/actions/**/relationships/comments',
    response() {
      const data = getResource(_.sample(this.fxComments, 5), 'comments');

      _.each(data, comment => {
        comment.relationships = {
          clinician: { data: getRelationship(_.sample(this.fxClinicians), 'clinicians') },
        };
      });

      return mutator({
        data,
        included: [],
      });
    },
  })
    .as('routeActionComments');
});
