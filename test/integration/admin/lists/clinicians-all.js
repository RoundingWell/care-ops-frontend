import _ from 'underscore';
import moment from 'moment';
import formatDate from 'helpers/format-date';

const now = moment.utc();
const local = moment();

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
      .visit()
      .routeClinicians(fx => {
        fx.data = _.sample(fx.data, 2);
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

        fx.data[0].id = '1';
        fx.data[0].attributes.name = 'Aaron Aaronson';
        fx.data[0].attributes.access = 'employee';
        fx.data[0].attributes.last_active_at = now.format();
        fx.data[0].relationships.role.data.id = '11111';

        fx.data[1].attributes.name = 'Baron Baronson';
        fx.data[1].attributes.last_active_at = null;

        return fx;
      })
      .navigate('/clinicians')
      .wait('@routeClinicians');

    cy
      .get('.list-page__list')
      .find('.table-list__header')
      .first()
      .should('contain', 'Clinician')
      .next()
      .should('contain', 'Groups')
      .next()
      .should('contain', 'Access Type, Role')
      .next()
      .should('contain', 'Last Active');

    cy
      .get('.table-list')
      .find('.table-list__item')
      .last()
      .should('contain', 'Baron Baronson');

    cy
      .get('.table-list')
      .find('.table-list__item .table-list__cell')
      .first()
      .should('contain', 'Aaron Aaronson')
      .next()
      .should('contain', 'Group One, Group Two')
      .next()
      .next()
      .should('contain', formatDate(local, 'TIME_OR_DAY'))
      .prev()
      .contains('Employee')
      .click();

    cy
      .get('.table-list')
      .find('.table-list__item')
      .eq(1)
      .find('.table-list__cell--empty')
      .contains('Never');

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
      .contains('Manager')
      .click();

    cy
      .wait('@routePatchClinician')
      .its('request.body')
      .should(({ data }) => {
        expect(data.attributes.access).to.equal('manager');
      });

    cy
      .get('.table-list')
      .find('.table-list__item .table-list__cell')
      .contains('CO')
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
        expect(data.relationships.role.data.id).to.equal('22222');
      });

    cy
      .get('.table-list')
      .find('.table-list__item .table-list__cell')
      .first()
      .click();

    cy
      .url()
      .should('contain', 'clinicians/1');

    cy
      .get('.table-list')
      .find('.table-list__item')
      .contains('Aaron Aaronson')
      .parent()
      .should('have.class', 'is-selected');
  });

  specify('empty clinicians list', function() {
    cy
      .server()
      .routeGroupsBootstrap()
      .visit()
      .routeClinicians(fx => {
        fx.data = [];

        return fx;
      })
      .navigate('/clinicians')
      .wait('@routeClinicians');

    cy
      .get('.table-empty-list')
      .contains('No Clinicians');
  });

  specify('new clinician', function() {
    cy
      .server()
      .routeGroupsBootstrap()
      .visit()
      .routeClinicians()
      .navigate('/clinicians')
      .wait('@routeClinicians');

    cy
      .get('.js-add-clinician')
      .click();

    cy
      .url()
      .should('contain', 'clinicians/new');

    cy
      .get('.table-list')
      .find('.table-list__item')
      .contains('New Clinician')
      .click();

    cy
      .url()
      .should('contain', 'clinicians/new');
  });
});
