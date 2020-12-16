import _ from 'underscore';
import 'js/base/setup';
import Backbone from 'backbone';
import { View } from 'marionette';
import hbs from 'handlebars-inline-precompile';

import { testTs } from 'helpers/test-timestamp';

context('Groups Manager', function() {
  const testGroups = [
    {
      id: '1',
      name: 'Group One',
      type: 'groups',
    },
    {
      id: '2',
      name: 'Another Group',
      type: 'groups',
    },
    {
      id: '3',
      name: 'Third Group',
      type: 'groups',
    },
  ];

  const currentClinician = {
    id: '1',
    attributes: {
      name: 'Current Clinician',
      email: 'current.clinician@roundingwell.com',
      access: 'employee',
      last_active_at: testTs(),
    },
    relationships: {
      role: { data: { id: '11111' } },
      groups: { data: testGroups },
    },
  };

  const testClinician = {
    id: '2',
    attributes: {
      name: 'Test Clinician',
      email: 'test.clinician@roundingwell.com',
      access: 'employee',
      last_active_at: testTs(),
    },
    relationships: {
      role: { data: { id: '11111' } },
      groups: { data: [] },
    },
  };

  let TestView;

  beforeEach(function() {
    cy
      .routeGroupsBootstrap(_.identity, testGroups)
      .routeClinicians(fx => {
        fx.data.push(testClinician);

        return fx;
      })
      .routeCurrentClinician(fx => {
        fx.data = currentClinician;

        return fx;
      })
      .visitComponent('GroupsManager');

    TestView = View.extend({
      initialize() {
        this.render();
      },
      childViewTriggers: {
        'add:member': 'add:member',
        'remove:member': 'remove:member',
      },
      template: hbs`<div data-groups-region></div>`,
      regions: {
        groups: '[data-groups-region]',
      },
      onRender() {
        const GroupsManager = this.getOption('groupsManager');
        this.showChildView('groups', new GroupsManager({
          ...this.getOption('groupsManagerOptions'),
        }));
      },
      onAddMember: cy.stub(),
      onRemoveMember: cy.stub(),
    });

    // Set View prototype to window's BB for instanceOf checks
    cy
      .window()
      .its('Backbone')
      .then(winBackbone => {
        Backbone.View = winBackbone.View;
      });
  });

  specify('Displaying', function() {
    const GroupsManager = this.GroupsManager;
    let member;
    let testView;

    cy
      .getRadio(Radio => {
        member = Radio.request('entities', 'clinicians:model', {
          id: testClinician.id,
          ...testClinician.attributes,
        });
      });

    cy
      .getHook($hook => {
        testView = new TestView({
          el: $hook[0],
          groupsManagerOptions: {
            member,
          },
          groupsManager: GroupsManager,
        });
      });


    cy
      .get('@hook')
      .find('.groups-manager__droplist')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__item')
      .should('have.length', 3)
      .contains('Third Group')
      .click()
      .then(() => {
        expect(testView.onAddMember).to.be.calledOnce;
      });

    cy
      .get('@hook')
      .find('.groups-manager__droplist')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__item')
      .should('have.length', 2)
      .first()
      .click();

    cy
      .get('@hook')
      .find('.groups-manager__droplist')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__item')
      .should('have.length', 1)
      .first()
      .click();

    cy
      .get('@hook')
      .find('.groups-manager__item')
      .should('have.length', 3);

    cy
      .get('@hook')
      .find('.groups-manager__droplist')
      .should('be.disabled');

    cy
      .get('@hook')
      .find('.groups-manager__item')
      .first()
      .should('contain', 'Third Group')
      .next()
      .should('contain', 'Group One')
      .next()
      .should('contain', 'Another Group')
      .find('.js-remove')
      .click()
      .then(() => {
        expect(testView.onRemoveMember).to.be.calledOnce;
      });

    cy
      .get('@hook')
      .find('.groups-manager__item')
      .should('have.length', 2);
  });

  specify('Disabled', function() {
    const GroupsManager = this.GroupsManager;
    let member;

    cy
      .getRadio(Radio => {
        member = Radio.request('entities', 'clinicians:model', {
          id: testClinician.id,
          ...testClinician.attributes,
        });
      });

    cy
      .getHook($hook => {
        new TestView({
          el: $hook[0],
          groupsManager: GroupsManager,
          groupsManagerOptions: {
            member,
            droplistOptions: {
              isDisabled: true,
            },
          },
        });
      });

    cy
      .get('@hook')
      .find('.groups-manager__droplist')
      .should('be.disabled');
  });
});
