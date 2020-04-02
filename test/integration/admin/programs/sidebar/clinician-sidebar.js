import _ from 'underscore';

context('clinician sidebar', function() {
  specify('edit clinician', function() {
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
      .visit()
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
        fx.data[0].attributes.email = 'test.clinician@roundingwell.com';
        fx.data[0].id = '1';
        fx.data[0].relationships.role.data.id = '11111';

        return fx;
      })
      .routeClinician(fx => {
        fx.data.attributes.name = 'Test Clinician';
        fx.data.attributes.email = 'test.clinician@roundingwell.com';
        fx.data.id = '1';
        fx.data.relationships.role.data.id = '11111';
        fx.data.relationships.groups = {
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

        return fx;
      })
      .navigate('/clinicians/1')
      .wait('@routeClinicians');

    cy
      .get('.table-list')
      .find('.table-list__item')
      .first()
      .should('contain', 'Test Clinician')
      .should('have.class', 'is-selected');

    cy
      .get('.sidebar')
      .as('clinicianSidebar');

    cy
      .get('@clinicianSidebar')
      .find('[data-name-region] .js-input')
      .should('have.value', 'Test Clinician');

    cy
      .get('@clinicianSidebar')
      .find('[data-email-region] .js-input')
      .should('have.value', 'test.clinician@roundingwell.com');

    cy
      .get('.sidebar')
      .find('[data-save-region]')
      .should('be.empty');

    cy
      .route({
        status: 204,
        method: 'PATCH',
        url: '/api/clinicians/1',
        response: {},
      })
      .as('routePatchClinician');

    cy
      .get('@clinicianSidebar')
      .find('[data-role-region] button')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__item')
      .contains('Nurse')
      .click();

    cy
      .wait('@routePatchClinician')
      .its('request.body')
      .should(({ data }) => {
        expect(data.id).to.equal('1');
        expect(data.relationships.role.data.id).to.equal('22222');
        expect(data.relationships.role.data.type).to.equal('roles');
      });

    cy
      .get('.sidebar')
      .find('.js-close')
      .click();

    cy
      .get('.sidebar')
      .should('not.exist');

    cy
      .get('.table-list')
      .find('.table-list__item')
      .first()
      .should('contain', 'Test Clinician')
      .should('have.not.class', 'is-selected');

    cy
      .url()
      .should('contain', 'clinicians')
      .should('not.contain', 'clinicians/1');
  });

  specify('add clinician', function() {
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
      .visit()
      .routeClinicians()
      .routeClinician(fx => {
        fx.data.id = '1';

        return fx;
      })
      .navigate('/clinicians/new')
      .wait('@routeClinicians');

    cy
      .get('.table-list')
      .find('.table-list__item')
      .contains('New Clinician')
      .click();

    cy
      .get('.sidebar')
      .find('[data-name-region] .js-input')
      .should('have.attr', 'placeholder', 'New Clinician')
      .type('Test Clinician')
      .type('{enter}');

    cy
      .get('[data-save-region]')
      .find('.js-save')
      .should('be', 'disabled');

    cy
      .get('.sidebar')
      .find('[data-name-region] .js-input')
      .clear();

    cy
      .get('.sidebar')
      .find('[data-email-region] .js-input')
      .should('have.attr', 'placeholder', 'clinician@organization.com')
      .type('test.clinician@roundingwell.com')
      .type('{enter}');

    cy
      .get('[data-save-region]')
      .find('.js-save')
      .should('be', 'disabled');

    cy
      .get('.sidebar')
      .find('[data-name-region] .js-input')
      .type('Test Clinician');

    cy
      .get('[data-save-region]')
      .find('.js-cancel')
      .click();

    cy
      .get('.sidebar')
      .should('not.exist');

    cy
      .get('.table-list')
      .find('.table-list__item')
      .contains('New Clinician')
      .should('not.exist');

    cy
      .route({
        status: 201,
        method: 'POST',
        url: '/api/clinicians',
        response: {
          data: {
            id: '1',
          },
        },
      })
      .as('routePostClinician');

    cy
      .get('.js-add-clinician')
      .click();

    cy
      .get('.sidebar')
      .as('clinicianSidebar');

    cy
      .get('@clinicianSidebar')
      .find('[data-name-region] .js-input')
      .should('have.attr', 'placeholder', 'New Clinician')
      .type('Test Clinician');

    cy
      .get('@clinicianSidebar')
      .find('[data-email-region] .js-input')
      .should('have.attr', 'placeholder', 'clinician@organization.com')
      .type('test.clinician@roundingwell.com');

    cy
      .get('@clinicianSidebar')
      .find('[data-role-region] button')
      .should('be.disabled');

    cy
      .get('@clinicianSidebar')
      .find('[data-save-region]')
      .find('.js-save')
      .click()
      .wait('@routePostClinician');

    cy
      .url()
      .should('contain', 'clinicians/1');
  });

  specify('clinician does not exist', function() {
    cy
      .server()
      .visit('clinicians/2');

    cy
      .get('.alert-box')
      .contains('The Clinician you requested does not exist.');

    cy
      .url()
      .should('contain', 'clinicians')
      .should('not.contain', 'clinicians/2');
  });

  specify('view clinician', function() {
    cy
      .server()
      .routeClinicians(fx => {
        fx.data[0].id = 1;
        fx.data[0].attributes.name = 'Test Clinician';
        fx.data[0].attributes.email = 'Test.Clinician@roundingwell.com';

        return fx;
      })
      .visit('clinicians/1')
      .wait('@routeClinicians');

    cy
      .get('.sidebar')
      .as('clinicianSidebar');

    cy
      .get('@clinicianSidebar')
      .find('[data-name-region] .js-input')
      .should('have.value', 'Test Clinician');

    cy
      .get('@clinicianSidebar')
      .find('[data-email-region] .js-input')
      .should('have.value', 'Test.Clinician@roundingwell.com');

    cy
      .get('.table-list')
      .find('.table-list__item')
      .contains('Test Clinician')
      .parent()
      .should('have.class', 'is-selected');
  });
});
