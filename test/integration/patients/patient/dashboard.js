import _ from 'underscore';
import dayjs from 'dayjs';

import { testTs, testTsSubtract } from 'helpers/test-timestamp';
import { testDate, testDateSubtract } from 'helpers/test-date';

import { workspaceOne } from 'support/api/workspaces';

function createActionPostRoute(id) {
  cy
    .intercept('POST', '/api/patients/1/relationships/actions*', {
      statusCode: 201,
      body: {
        data: {
          id,
          attributes: {
            updated_at: testTs(),
            outreach: 'disabled',
            sharing: 'disabled',
            due_time: null,
          },
          relationships: {
            author: { id: '11111', types: 'clinicians' },
          },
        },
      },
    })
    .as('routePostAction');
}

context('patient dashboard page', function() {
  specify('action and flow list', function() {
    const testTime = dayjs(testDate()).hour(12).valueOf();
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

    cy
      .routesForPatientAction()
      .routePatient(fx => {
        fx.data.id = '1';
        fx.data.relationships.workspaces.data = [
          {
            id: workspaceOne.id,
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
      .visitOnClock('/patient/dashboard/1', { now: testTime, functionNames: ['Date'] })
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
      .intercept('PATCH', '/api/actions/1', {
        statusCode: 204,
        body: {},
      })
      .as('routePatchAction');

    cy
      .intercept('PATCH', '/api/flows/2', {
        statusCode: 204,
        body: {},
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
      .find('[data-due-date-region]')
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
      .tick(800); // the length of the animation

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
      .find('[data-due-date-region] button')
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
      .routeLatestFormResponse()
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
  });

  specify('add action and flow', function() {
    cy
      .routeCurrentClinician(fx => {
        fx.data.relationships.role = { data: { id: '33333' } };
        return fx;
      })
      .routesForPatientAction()
      .routePatient(fx => {
        fx.data.id = '1';

        return fx;
      })
      .routePrograms(fx => {
        fx.data = _.sample(fx.data, 5);

        fx.data[0].id = 1;
        fx.data[0].attributes.name = 'Two Actions, One Published, One Flow';
        fx.data[0].attributes.published_at = testTs();
        fx.data[0].attributes.archived_at = null;
        fx.data[0].relationships['program-actions'] = {
          data: [
            { id: '1' },
            { id: '4' },
            { id: '5' },
            { id: '6' },
          ],
        };
        fx.data[0].relationships['program-flows'] = { data: [{ id: '4' }] };

        fx.data[1].id = 2;
        fx.data[1].attributes.name = 'Two Published Actions and Flows';
        fx.data[1].attributes.published_at = testTs();
        fx.data[1].attributes.archived_at = null;
        fx.data[1].relationships['program-actions'] = {
          data: [
            { id: '2' },
            { id: '3' },
            { id: '4' },
            { id: '5' },
            { id: '6' },
          ],
        };
        fx.data[1].relationships['program-flows'] = {
          data: [
            { id: '5' },
            { id: '6' },
            { id: '7' },
            { id: '8' },
            { id: '9' },
          ],
        };

        fx.data[2].id = 3;
        fx.data[2].attributes.name = 'No Actions, No Flows';
        fx.data[2].attributes.published_at = testTs();
        fx.data[2].attributes.archived_at = null;
        fx.data[2].relationships['program-actions'] = { data: [] };
        fx.data[2].relationships['program-flows'] = { data: [] };

        fx.data[3].id = 4;
        fx.data[3].attributes.name = 'Should not show - unpublished';
        fx.data[3].attributes.published_at = null;
        fx.data[3].attributes.archived_at = null;
        fx.data[3].relationships['program-actions'] = { data: [] };
        fx.data[3].relationships['program-flows'] = { data: [] };

        fx.data[4].id = 5;
        fx.data[4].attributes.name = 'Should not show - archived';
        fx.data[4].attributes.published_at = testTs();
        fx.data[4].attributes.archived_at = testTs();
        fx.data[4].relationships['program-actions'] = { data: [] };
        fx.data[4].relationships['program-flows'] = { data: [] };

        return fx;
      })
      .routeAllProgramActions(fx => {
        fx.data = _.sample(fx.data, 6);

        fx.data[0].id = 1;
        fx.data[0].attributes.name = 'One of One';
        fx.data[0].attributes.behavior = 'standard';
        fx.data[0].attributes.published_at = testTs();
        fx.data[0].attributes.archived_at = null;
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
        fx.data[1].attributes.name = 'One of Two';
        fx.data[1].attributes.behavior = 'standard';
        fx.data[1].attributes.published_at = testTs();
        fx.data[1].attributes.archived_at = null;
        fx.data[1].attributes.outreach = 'patient';
        fx.data[1].attributes.details = '';
        fx.data[1].attributes.days_until_due = 0;
        fx.data[1].relationships.owner = { data: null };

        fx.data[2].id = 3;
        fx.data[2].attributes.name = 'Two of Two';
        fx.data[2].attributes.behavior = 'standard';
        fx.data[2].attributes.published_at = testTs();
        fx.data[2].attributes.archived_at = null;
        fx.data[2].attributes.days_until_due = null;

        fx.data[3].id = 4;
        fx.data[3].attributes.name = 'Should not show - unpublished';
        fx.data[3].attributes.behavior = 'standard';
        fx.data[3].attributes.published_at = null;
        fx.data[3].attributes.archived_at = null;
        fx.data[3].attributes.days_until_due = null;

        fx.data[4].id = 5;
        fx.data[4].attributes.name = 'Should not show - archived';
        fx.data[4].attributes.behavior = 'standard';
        fx.data[4].attributes.published_at = testTs();
        fx.data[4].attributes.archived_at = testTs();
        fx.data[4].attributes.days_until_due = null;

        fx.data[5].id = 6;
        fx.data[5].attributes.name = 'Should not show - automated behavior';
        fx.data[5].attributes.behavior = 'automated';
        fx.data[5].attributes.published_at = testTs();
        fx.data[5].attributes.archived_at = null;
        fx.data[5].attributes.days_until_due = null;

        return fx;
      }, [1, 2])
      .routeAllProgramFlows(fx => {
        fx.data = _.sample(fx.data, 6);

        fx.data[0].id = 4;
        fx.data[0].attributes.name = '1 Flow';
        fx.data[0].attributes.behavior = 'standard';
        fx.data[0].attributes.published_at = testTs();
        fx.data[0].attributes.archived_at = null;
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
        fx.data[1].attributes.behavior = 'standard';
        fx.data[1].attributes.published_at = testTs();
        fx.data[1].attributes.archived_at = null;
        fx.data[1].relationships.program = { data: { id: 2 } };

        fx.data[2].id = 6;
        fx.data[2].attributes.name = '3 Flow';
        fx.data[2].attributes.behavior = 'standard';
        fx.data[2].attributes.published_at = testTs();
        fx.data[2].attributes.archived_at = null;
        fx.data[2].relationships.program = { data: { id: 2 } };

        fx.data[3].id = 7;
        fx.data[3].attributes.name = 'Should not show - unpublished';
        fx.data[3].attributes.behavior = 'standard';
        fx.data[3].attributes.published_at = null;
        fx.data[3].attributes.archived_at = null;
        fx.data[3].relationships.program = { data: { id: 2 } };

        fx.data[4].id = 8;
        fx.data[4].attributes.name = 'Should not show - archived';
        fx.data[4].attributes.behavior = 'standard';
        fx.data[4].attributes.published_at = testTs();
        fx.data[4].attributes.archived_at = testTs();
        fx.data[4].relationships.program = { data: { id: 2 } };

        fx.data[5].id = 9;
        fx.data[5].attributes.name = 'Should not show - automated behavior';
        fx.data[5].attributes.behavior = 'automated';
        fx.data[5].attributes.published_at = testTs();
        fx.data[5].attributes.archived_at = null;
        fx.data[5].relationships.program = { data: { id: 2 } };

        return fx;
      })
      .routeFlowActivity()
      .visit('/patient/dashboard/1')
      .wait('@routePatient')
      .wait('@routePrograms')
      .wait('@routeAllProgramActions')
      .itsUrl()
      .its('search')
      .should('contain', 'filter[behavior]=standard')
      .wait('@routeAllProgramFlows')
      .itsUrl()
      .its('search')
      .should('contain', 'filter[behavior]=standard');

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
      .find('[data-due-date-region]')
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
      .should('contain', 'No Published Actions')
      .click();

    cy
      .get('.picklist')
      .should('not.contain', 'Should not show');

    createActionPostRoute('test-1');

    cy
      .routeAction(fx => {
        fx.data.id = 'test-1';

        // In this case let the cache work for testing routing only
        fx.data.attributes = {};
      });

    cy
      .intercept('GET', '/api/actions/test-1*', {
        body: {},
      })
      .as('routeTestAction1');

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
      .get('.sidebar')
      .find('.js-menu')
      .should('not.exist');

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
      .intercept('GET', '/api/actions/test-2*', {
        body: {},
      })
      .as('routeTestAction2');

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
      .get('.sidebar')
      .find('.js-menu')
      .should('not.exist');

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
      .intercept('GET', '/api/actions/test-3*', {
        body: {},
      })
      .as('routeTestAction3');

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
      .intercept('POST', '/api/patients/1/relationships/flows*', {
        statusCode: 201,
        body: {
          data: {
            id: '1',
            attributes: { updated_at: testTs() },
          },
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

    cy
      .get('.patient-flow__header')
      .find('.patient-flow__name')
      .click();

    cy
      .get('.sidebar')
      .find('.js-menu')
      .should('not.exist');
  });

  specify('non work:own clinician', function() {
    cy
      .routesForPatientDashboard()
      .routeCurrentClinician(fx => {
        fx.data.id = '123456';
        fx.data.attributes.enabled = true;
        fx.data.relationships.role = { data: { id: '22222' } };
        return fx;
      })
      .visit('/patient/dashboard/1')
      .wait('@routePatient')
      .wait('@routePatientField')
      .wait('@routePatientFlows')
      .wait('@routePatientActions');

    cy
      .get('[data-add-workflow-region]')
      .should('be.empty');
  });

  specify('work with work:owned:manage permission', function() {
    cy
      .routeCurrentClinician(fx => {
        fx.data.relationships.role = { data: { id: '66666' } };
        return fx;
      })
      .routesForPatientDashboard()
      .routePatientActions(fx => {
        fx.data = _.sample(fx.data, 2);
        fx.data[0] = {
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
            patient: { data: { id: '11111' } },
            owner: {
              data: {
                id: '11111',
                type: 'clinicians',
              },
            },
            state: { data: { id: '22222' } },
            form: { data: { id: '11111' } },
            files: { data: [{ id: '1' }] },
          },
        };

        fx.data[1].attributes.name = 'Third In List';
        fx.data[1].relationships.state = { data: { id: '22222' } };
        fx.data[1].relationships.owner = { data: { id: '11111', type: 'teams' } };
        fx.data[1].attributes.updated_at = testTsSubtract(2);
        fx.data[1].attributes.due_time = '09:00:00';
        fx.data[1].attributes.due_date = testDateSubtract(2);

        return fx;
      })
      .routePatientFlows(fx => {
        fx.data = _.sample(fx.data, 2);

        fx.data[0].attributes.name = 'Second In List';
        fx.data[0].relationships.state = { data: { id: '22222' } };
        fx.data[0].relationships.owner = { data: { id: '11111', type: 'clinicians' } };
        fx.data[0].attributes.updated_at = testTsSubtract(1);

        fx.data[1].attributes.name = 'Last In List';
        fx.data[1].id = '2';
        fx.data[1].relationships.state = { data: { id: '22222' } };
        fx.data[1].relationships.owner = { data: { id: '11111', type: 'teams' } };
        fx.data[1].attributes.updated_at = testTsSubtract(6);

        return fx;
      })
      .visit('/patient/dashboard/1')
      .wait('@routePatient')
      .wait('@routePatientActions')
      .wait('@routePatientFlows');

    cy
      .get('.patient__list')
      .find('.table-list__item')
      .as('listItems')
      .first()
      .find('button')
      .should('have.length', 5);

    cy
      .get('@listItems')
      .eq(1)
      .find('[data-owner-region]')
      .find('button');

    cy
      .get('@listItems')
      .eq(2)
      .find('button')
      .should('not.exist');

    cy
      .get('@listItems')
      .eq(3)
      .find('[data-owner-region]')
      .find('button')
      .should('not.exist');
  });

  specify('work with work:team:manage permission', function() {
    cy
      .routesForPatientDashboard()
      .routeCurrentClinician(fx => {
        fx.data.relationships.role = { data: { id: '77777' } };
        fx.data.relationships.team = { data: { id: '11111', type: 'teams' } };

        return fx;
      })
      .routeWorkspaceClinicians(fx => {
        fx.data = _.first(fx.data, 2);

        const nonTeamMemberClinician = fx.data[1];
        nonTeamMemberClinician.attributes.name = 'Non Team Member';
        nonTeamMemberClinician.relationships.team.data.id = '22222';

        return fx;
      })
      .routePatientActions(fx => {
        fx.data = _.sample(fx.data, 2);

        fx.data[0].attributes.name = 'Owned by another team';
        fx.data[0].attributes.updated_at = testTsSubtract(1);
        fx.data[0].relationships.state = { data: { id: '33333' } };
        fx.data[0].relationships.owner = { data: { id: '22222', type: 'teams' } };

        fx.data[1].attributes.name = 'Owned by non team member';
        fx.data[1].attributes.updated_at = testTsSubtract(2);
        fx.data[1].relationships.state = { data: { id: '33333' } };
        fx.data[1].relationships.owner = { data: { id: '22222', type: 'clinicians' } };


        return fx;
      })
      .routePatientFlows(fx => {
        fx.data = [];

        return fx;
      })
      .visit('/patient/dashboard/1')
      .wait('@routePatient')
      .wait('@routePatientActions')
      .wait('@routePatientFlows');

    cy
      .get('.patient__list')
      .find('.table-list__item')
      .as('listItems')
      .first()
      .find('[data-owner-region]')
      .find('button')
      .should('not.exist');

    cy
      .get('@listItems')
      .last()
      .find('[data-owner-region]')
      .find('button')
      .should('not.exist');
  });

  specify('410 patient not found error', function() {
    cy
      .intercept('GET', '/api/patients/1', {
        statusCode: 410,
        body: {},
      })
      .as('routePatient')
      .visit('/patient/dashboard/1');

    cy
      .get('.error-page')
      .should('contain', 'Something went wrong.')
      .and('contain', ' This page doesn\'t exist.');

    cy
      .url()
      .should('contain', '/404');
  });
});
