import _ from 'underscore';

context('clinicians list', function() {
  specify('display clinicians list', function() {
    cy
      .server()
      .routeGroupsBootstrap(_.identity, [
        {
          id: '1',
          name: 'Group One',
        },
        {
          id: '2',
          name: 'Group Two',
        },
      ])
      .routeClinicians(fx => {
        _.each(fx.data, clinician => {
          clinician.relationships.groups = {
            data: [
              {
                type: 'groups',
                id: '1',
              },
              {
                type: 'groups',
                id: '2',
              },
            ],
          };
        });

        fx.data[0].attributes.name = 'Test Clinician';
        fx.data[0].relationships.role.data.id = '11111';

        return fx;
      })
      .visit('/clinicians')
      .wait('@routeClinicians');

    cy
      .get('.list-page__list')
      .find('.table-list__header')
      .first()
      .should('contain', 'Clinician')
      .next()
      .should('contain', 'Groups')
      .next()
      .should('contain', 'Role');

    cy
      .get('.table-list')
      .find('.table-list__item .table-list__cell')
      .first()
      .should('contain', 'Test Clinician')
      .next()
      .should('contain', 'Group One, Group Two')
      .next()
      .find('button')
      .click();

    cy
      .route({
        status: 204,
        method: 'PATCH',
        url: '/api/clinicians/*',
        response: {},
      })
      .as('routePatchClinician');

    cy
      .get('.picklist')
      .find('.picklist__item')
      .contains('Nurse')
      .click();

    cy
      .wait('@routePatchClinician')
      .its('request.body')
      .should(({ data }) => {
        expect(data.relationships.role.data.id).to.equal('22222');
      });
  });

  specify('empty clinicians list', function() {
    cy
      .server()
      .routeGroupsBootstrap()
      .routeClinicians(fx => {
        fx.data = [];

        return fx;
      })
      .visit('/clinicians')
      .wait('@routeClinicians');

    cy
      .get('.table-empty-list')
      .contains('No Clinicians');
  });
});
