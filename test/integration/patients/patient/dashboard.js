import _ from 'underscore';
import dayjs from 'dayjs';

import { testTs, testTsSubtract } from 'helpers/test-timestamp';
import { testDate } from 'helpers/test-date';

function createActionPostRoute(id) {
  cy
    .route({
      status: 201,
      method: 'POST',
      url: '/api/patients/1/relationships/actions*',
      response() {
        return {
          data: {
            id,
            attributes: {
              updated_at: testTs(),
              outreach: 'disabled',
              sharing: 'disabled',
              due_time: null,
            },
          },
        };
      },
    })
    .as('routePostAction');
}

context('patient dashboard page', function() {
  specify('action and flow list', function() {
    const testTime = dayjs().hour(10).utc().valueOf();
    const actionData = {
      id: '1',
      attributes: {
        name: 'First In List',
        details: null,
        duration: 0,
        due_date: null,
        due_time: null,
        updated_at: testTs(),
      },
      relationships: {
        patient: { data: { id: '1' } },
        owner: {
          data: {
            type: 'teams',
            id: '11111',
          },
        },
        state: { data: { id: '22222' } },
        form: { data: { id: '1' } },
        files: { data: [{ id: '1' }] },
      },
    };

    cy.clock(testTime, ['Date']);

    cy
      .routePatient(fx => {
        fx.data.id = '1';
        fx.data.relationships.workspaces.data = [
          {
            id: '11111',
            type: 'workspaces',
          },
        ];
        return fx;
      })
      .routePatientActions(fx => {
        fx.data = _.sample(fx.data, 3);

        fx.data[0] = actionData;

        fx.data[2].attributes.name = 'Third In List';
        fx.data[2].relationships.state = { data: { id: '33333' } };
        fx.data[2].attributes.updated_at = testTsSubtract(2);

        fx.data[1].attributes.name = 'Not In List';
        fx.data[1].relationships.state = { data: { id: '55555' } };
        fx.data[1].attributes.updated_at = testTsSubtract(5);

        return fx;
      })
      .routePatientFlows(fx => {
        fx.data = _.sample(fx.data, 3);

        fx.data[0].attributes.name = 'Second In List';
        fx.data[0].relationships.state = { data: { id: '33333' } };
        fx.data[0].attributes.updated_at = testTsSubtract(1);

        fx.data[2].attributes.name = 'Last In List';
        fx.data[2].id = '2';
        fx.data[2].relationships.state = { data: { id: '33333' } };
        fx.data[2].relationships.owner = {
          data: {
            id: '11111',
            type: 'teams',
          },
        };
        fx.data[2].attributes.updated_at = testTsSubtract(5);

        fx.data[1].attributes.name = 'Not In List';
        fx.data[1].relationships.state = { data: { id: '55555' } };
        fx.data[1].attributes.updated_at = testTsSubtract(5);

        return fx;
      })
      .routeAction(fx => {
        fx.data = actionData;
        return fx;
      })
      .routePatientByAction()
      .routeActionActivity()
      .routePrograms()
      .routeAllProgramActions()
      .routeAllProgramFlows()
      .visit('/patient/dashboard/1')
      .wait('@routePatient')
      .wait('@routePatientFlows');

    cy
      .wait('@routePatientActions')
      .itsUrl()
      .its('search')
      .should('contain', 'filter[state]=22222,33333');

    // Filters out done id 55555
    cy
      .get('.patient__list')
      .find('tr')
      .should('have.lengthOf', 4);

    cy
      .route({
        status: 204,
        method: 'PATCH',
        url: '/api/actions/1',
        response: {},
      })
      .as('routePatchAction');

    cy
      .route({
        status: 204,
        method: 'PATCH',
        url: '/api/flows/2',
        response: {},
      })
      .as('routePatchFlow');

    cy
      .get('.patient__list')
      .find('.table-list__item')
      .first()
      .should('contain', 'First In List')
      .next()
      .should('contain', 'Second In List')
      .next()
      .should('contain', 'Third In List')
      .next()
      .should('contain', 'Last In List');

    cy
      .get('.patient__list')
      .contains('First In List')
      .click();

    cy
      .get('.patient__list')
      .find('.is-selected')
      .find('[data-state-region]')
      .find('.fa-circle-exclamation')
      .click();

    cy
      .get('.picklist')
      .contains('In Progress')
      .click();

    cy
      .wait('@routePatchAction')
      .its('request.body')
      .should(({ data }) => {
        expect(data.relationships.state.data.id).to.equal('33333');
      });

    cy
      .get('.patient__list')
      .find('.is-selected')
      .find('[data-owner-region]')
      .should('contain', 'CO')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__heading')
      .should('contain', 'Workspace One');

    cy
      .get('.picklist')
      .contains('Nurse')
      .click();

    cy
      .wait('@routePatchAction')
      .its('request.body')
      .should(({ data }) => {
        expect(data.relationships.owner.data.id).to.equal('22222');
        expect(data.relationships.owner.data.type).to.equal('teams');
      });

    cy
      .get('.patient__list')
      .find('.is-selected')
      .find('[data-due-day-region]')
      .click();

    cy
      .get('.datepicker')
      .contains('Today')
      .click();

    cy
      .wait('@routePatchAction')
      .its('request.body')
      .should(({ data }) => {
        // Datepicker doesn't use timestamp so due_date is local.
        expect(data.attributes.due_date).to.equal(testDate());
      });

    cy
      .get('.patient__list')
      .find('.is-selected')
      .find('[data-due-time-region]')
      .click();

    cy
      .get('.picklist')
      .contains('9:45 AM')
      .click();

    cy
      .get('.patient__list')
      .find('.is-selected')
      .find('[data-due-time-region] .is-overdue');

    cy
      .wait('@routePatchAction')
      .its('request.body')
      .should(({ data }) => {
        expect(data.attributes.due_time).to.equal('09:45:00');
      });

    cy
      .get('.patient__list')
      .find('.table-list__item')
      .last()
      .as('flowItem');

    cy
      .get('@flowItem')
      .find('.fa-circle-dot');

    cy
      .get('@flowItem')
      .find('[data-owner-region]')
      .should('contain', 'CO')
      .click();

    cy
      .get('.picklist')
      .contains('Nurse')
      .click();

    cy
      .wait('@routePatchFlow')
      .its('request.body')
      .should(({ data }) => {
        expect(data.relationships.owner.data.id).to.equal('22222');
        expect(data.relationships.owner.data.type).to.equal('teams');
      });

    cy
      .routeFlow()
      .routeFlowActions()
      .routePatientByFlow();

    cy
      .get('@flowItem')
      .find('.patient__action-name')
      .click()
      .wait('@routeFlow')
      .wait('@routePatientByFlow')
      .wait('@routeFlowActions');

    cy
      .url()
      .should('contain', 'flow/2');

    cy
      .go('back');

    cy
      .get('.patient__list')
      .find('.is-selected')
      .find('[data-state-region]')
      .click();

    cy
      .get('.picklist')
      .find('.js-picklist-item')
      .contains('Done')
      .click()
      .wait(800); // wait the length of the animation

    cy
      .wait('@routePatchAction')
      .its('request.body')
      .should(({ data }) => {
        expect(data.relationships.state.data.id).to.equal('55555');
      });

    cy
      .get('.patient__list')
      .find('tr')
      .should('have.lengthOf', 3);

    cy
      .get('.sidebar')
      .find('.fa-circle-check')
      .click();

    cy
      .get('.picklist')
      .contains('To Do')
      .click();

    cy
      .get('.patient__list')
      .find('tr')
      .should('have.lengthOf', 4);

    cy
      .get('.table-list__item')
      .first()
      .next()
      .next()
      .find('[data-form-region]')
      .should('be.empty')
      .find('.fa-paperclip')
      .should('not.exist');

    // dirty hack to make sure the form button isn't offscreen
    cy
      .get('.table-list__item')
      .first()
      .find('[data-due-day-region] button')
      .click();

    cy
      .get('.datepicker')
      .contains('Clear')
      .click();

    cy
      .get('.table-list__item')
      .first()
      .find('.fa-paperclip')
      .should('exist');

    cy
      .routeFormByAction()
      .routeFormDefinition()
      .routeFormActionFields()
      .routeFormResponse();

    cy
      .get('.table-list__item')
      .first()
      .find('[data-form-region]')
      .find('button')
      .click();

    cy
      .url()
      .should('contain', 'patient-action/1/form/1');

    cy.clock().invoke('restore');
  });

  specify('add action and flow', function() {
    cy
      .routePatient(fx => {
        fx.data.id = '1';

        return fx;
      })
      .routeAction()
      .routePatientActions(_.identity, '1')
      .routePatientFlows(_.identity, '1')
      .routeActionActivity()
      .routePrograms(fx => {
        fx.data = _.sample(fx.data, 4);
        fx.data[0].id = 1;
        fx.data[0].attributes.published = true;
        fx.data[0].attributes.name = 'Two Actions, One Published, One Flow';
        fx.data[0].relationships['program-actions'] = {
          data: [
            { id: '1' },
            { id: '4' },
          ],
        };
        fx.data[0].relationships['program-flows'] = { data: [{ id: '4' }] };

        fx.data[1].id = 2;
        fx.data[1].attributes.published = true;
        fx.data[1].attributes.name = 'Two Published Actions and Flows';
        fx.data[1].relationships['program-actions'] = {
          data: [
            { id: '2' },
            { id: '3' },
          ],
        };
        fx.data[1].relationships['program-flows'] = {
          data: [
            { id: '5' },
            { id: '6' },
            { id: '7' },
          ],
        };

        fx.data[2].id = 3;
        fx.data[2].attributes.published = true;
        fx.data[2].attributes.name = 'No Actions, No Flows';
        fx.data[2].relationships['program-actions'] = { data: [] };
        fx.data[2].relationships['program-flows'] = { data: [] };

        fx.data[3].id = 4;
        fx.data[3].attributes.published = false;
        fx.data[3].attributes.name = 'Unpublished';
        fx.data[3].relationships['program-actions'] = { data: [] };
        fx.data[2].relationships['program-flows'] = { data: [] };

        return fx;
      })
      .routeAllProgramActions(fx => {
        fx.data = _.sample(fx.data, 3);

        fx.data[0].id = 1;
        fx.data[0].attributes.status = 'published';
        fx.data[0].attributes.name = 'One of One';
        fx.data[0].attributes.details = 'details';
        fx.data[0].attributes.days_until_due = 1;
        fx.data[0].relationships.owner = {
          data: {
            id: '11111',
            type: 'teams',
          },
        };
        fx.data[0].relationships.form = { data: { id: '11111' } };


        fx.data[1].id = 2;
        fx.data[1].attributes.status = 'published';
        fx.data[1].attributes.name = 'One of Two';
        fx.data[1].attributes.outreach = 'patient';
        fx.data[1].attributes.details = '';
        fx.data[1].attributes.days_until_due = 0;
        fx.data[1].relationships.owner = { data: null };

        fx.data[2].id = 3;
        fx.data[2].attributes.status = 'published';
        fx.data[2].attributes.name = 'Two of Two';
        fx.data[2].attributes.days_until_due = null;

        return fx;
      }, [1, 2])
      .routeAllProgramFlows(fx => {
        fx.data = _.sample(fx.data, 5);

        fx.data[0].id = 4;
        fx.data[0].attributes.name = '1 Flow';
        fx.data[0].attributes.status = 'published';
        fx.data[0].relationships.program = { data: { id: '1' } };
        fx.data[0].relationships.state = { data: { id: '22222' } };
        fx.data[0].relationships.owner = {
          data: {
            id: '77777',
            type: 'teams',
          },
        };

        fx.data[1].id = 5;
        fx.data[1].attributes.name = '2 Flow';
        fx.data[1].attributes.status = 'published';
        fx.data[1].relationships.program = { data: { id: 2 } };

        fx.data[2].id = 6;
        fx.data[2].attributes.name = '3 Flow';
        fx.data[2].attributes.status = 'published';
        fx.data[2].relationships.program = { data: { id: 2 } };

        fx.data[3].id = 7;
        fx.data[3].attributes.name = '4 Flow, should not show';
        fx.data[3].attributes.status = 'draft';
        fx.data[3].relationships.program = { data: { id: 2 } };

        fx.data[4].id = 8;
        fx.data[4].attributes.name = '5 Flow, should not show';
        fx.data[4].attributes.status = 'published';
        fx.data[4].relationships.program = { data: { id: 3 } };

        return fx;
      })
      .visit('/patient/dashboard/1')
      .wait('@routePatient')
      .wait('@routePatientActions')
      .wait('@routePatientFlows')
      .wait('@routePrograms')
      .wait('@routeAllProgramActions')
      .wait('@routeAllProgramFlows');

    cy
      .get('[data-add-workflow-region]')
      .contains('Add')
      .click();

    cy
      .get('.picklist')
      .contains('New Action')
      .click();

    cy
      .get('.patient__list')
      .find('.is-selected')
      .should('contain', 'New Action')
      .as('newAction');

    cy
      .get('@newAction')
      .find('[data-state-region]')
      .find('button')
      .should('be.disabled')
      .find('.fa-circle-exclamation');

    cy
      .get('@newAction')
      .find('[data-owner-region]')
      .find('button')
      .should('be.disabled')
      .should('contain', 'Clinician McTester');

    cy
      .get('@newAction')
      .find('[data-due-day-region]')
      .find('button')
      .should('be.disabled');

    cy
      .get('@newAction')
      .find('[data-due-time-region]')
      .find('button')
      .should('be.disabled');

    cy
      .get('.sidebar')
      .find('.js-close')
      .click();

    cy
      .get('.patient__list')
      .should('not.contain', 'New Action')
      .find('.is-selected')
      .should('not.exist');

    cy
      .get('[data-add-workflow-region]')
      .contains('Add')
      .click();

    const headingOrder = [
      'Add Flow or Action',
      'No Actions, No Flows',
      'Two Actions, One Published, One Flow',
      'Two Published Actions and Flows',
    ];

    cy
      .get('.picklist')
      .find('.picklist__heading')
      .then($headings => {
        $headings.each((idx, $heading) => {
          expect($heading).to.contain(headingOrder[idx]);
        });
      });

    cy
      .get('.picklist')
      .contains('New Action');

    cy
      .get('.picklist')
      .contains('Two Actions, One Published, One Flow')
      .next()
      .should('contain', '1 Flow')
      .should('contain', 'One of One');


    cy
      .get('.picklist')
      .contains('Two Published Actions and Flows')
      .next()
      .should('contain', '2 Flow')
      .should('contain', '3 Flow')
      .should('contain', 'One of Two')
      .should('contain', 'Two of Two');

    cy
      .get('.picklist')
      .contains('No Actions, No Flows')
      .next()
      .should('contain', 'No Published Actions');

    cy
      .get('.picklist')
      .should('not.contain', 'Unpublished');

    createActionPostRoute('test-1');

    cy
      .routeAction(fx => {
        fx.data.id = 'test-1';

        // In this case let the cache work for testing routing only
        fx.data.attributes = {};
      });

    cy
      .route({
        method: 'GET',
        url: '/api/actions/test-1*',
        response: {},
      }).as('routeTestAction1');

    cy
      .get('.picklist')
      .contains('One of One')
      .click();

    cy
      .wait('@routePostAction')
      .its('request.body')
      .should(({ data }) => {
        expect(data.attributes.name).to.equal('One of One');
        expect(data.attributes.details).to.be.undefined;
        expect(data.attributes.duration).to.be.undefined;
        expect(data.attributes.due_date).to.be.undefined;
        expect(data.attributes.due_time).to.be.undefined;
        expect(data.relationships.state.data.id).to.equal('22222');
        expect(data.relationships.owner.data.id).to.equal('11111');
        expect(data.relationships.owner.data.type).to.equal('teams');
      });

    cy
      .wait('@routeTestAction1')
      .url()
      .should('contain', 'patient/1/action/test-1');

    cy
      .get('.patient__list')
      .find('.is-selected')
      .should('contain', 'One of One');

    cy
      .get('.sidebar')
      .find('[data-name-region]')
      .should('contain', 'One of One');

    cy
      .get('[data-add-workflow-region]')
      .contains('Add')
      .click();

    createActionPostRoute('test-2');

    cy
      .routeAction(fx => {
        fx.data.id = 'test-2';

        // In this case let the cache work for testing routing only
        fx.data.attributes = {};
      });

    cy
      .route({
        method: 'GET',
        url: '/api/actions/test-2*',
        response: {},
      }).as('routeTestAction2');

    cy
      .get('.picklist')
      .contains('One of Two')
      .click();

    cy
      .wait('@routeTestAction2')
      .wait('@routePostAction')
      .its('request.body')
      .should(({ data }) => {
        expect(data.attributes.name).to.equal('One of Two');
        expect(data.attributes.details).to.be.undefined;
        expect(data.attributes.duration).to.be.undefined;
        expect(data.attributes.due_date).to.be.undefined;
        expect(data.attributes.due_time).to.be.undefined;
        expect(data.relationships.state.data.id).to.equal('22222');
        expect(data.relationships.owner.data.id).to.be.equal('11111');
        expect(data.relationships.owner.data.type).to.be.equal('clinicians');
      });

    cy
      .url()
      .should('contain', 'patient/1/action/test-2');

    cy
      .get('.patient__list')
      .find('.is-selected')
      .should('contain', 'One of Two');

    cy
      .get('.sidebar')
      .find('[data-name-region]')
      .should('contain', 'One of Two');

    cy
      .get('[data-add-workflow-region]')
      .contains('Add')
      .click();

    createActionPostRoute('test-3');

    cy
      .routeAction(fx => {
        fx.data.id = 'test-3';

        // In this case let the cache work for testing routing only
        fx.data.attributes = {};
      });

    cy
      .route({
        method: 'GET',
        url: '/api/actions/test-3*',
        response: {},
      }).as('routeTestAction3');

    cy
      .get('.picklist')
      .contains('Two of Two')
      .click();

    cy
      .wait('@routeTestAction3')
      .wait('@routePostAction')
      .its('request.body')
      .should(({ data }) => {
        expect(data.attributes.name).to.equal('Two of Two');
        expect(data.attributes.due_date).to.be.undefined;
      });

    cy
      .url()
      .should('contain', 'patient/1/action/test-3');

    cy
      .get('.patient__list')
      .find('.is-selected')
      .should('contain', 'Two of Two');

    cy
      .get('.sidebar')
      .find('[data-name-region]')
      .should('contain', 'Two of Two');

    cy
      .route({
        status: 201,
        method: 'POST',
        url: '/api/patients/1/relationships/flows*',
        response() {
          return {
            data: {
              id: '1',
              attributes: { updated_at: testTs() },
            },
          };
        },
      })
      .as('routePostFlow');

    cy
      .get('[data-add-workflow-region]')
      .contains('Add')
      .click();

    cy
      .routeFlow()
      .routeFlowActions()
      .routePatientByFlow();

    cy
      .get('.picklist')
      .contains('1 Flow')
      .click();

    cy
      .wait('@routePostFlow')
      .its('request.body')
      .should(({ data }) => {
        expect(data.relationships.state.data.id).to.equal('22222');
        expect(data.relationships['program-flow'].data.id).to.be.equal('4');
      });

    cy
      .url()
      .should('contain', 'flow/1');
  });
});
