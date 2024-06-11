import Radio from 'backbone.radio';

import { Collection } from 'js/entities-service/entities/teams';
import fxTestTeams from 'fixtures/test/teams';
import { teamCoordinator } from 'support/api/teams';
import TeamComponent from './index';

context('Team Component', function() {
  specify('No Default', function() {
    Radio.reply('bootstrap', 'teams', () => {
      return new Collection();
    });

    cy
      .mount(rootView => {
        TeamComponent.setPopRegion(rootView.getRegion('pop'));

        return new TeamComponent();
      })
      .as('root');

    cy
      .get('@root')
      .contains('Select Team...')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__heading')
      .contains('Update Team');

    cy
      .get('.picklist')
      .find('.picklist--no-results');
  });

  specify('isCompact', function() {
    Radio.reply('bootstrap', 'teams', () => {
      return new Collection(fxTestTeams);
    });

    cy
      .mount(rootView => {
        TeamComponent.setPopRegion(rootView.getRegion('pop'));

        return new TeamComponent({ isCompact: true });
      })
      .as('root');

    cy
      .get('@root')
      .find('.button-secondary--compact')
      .click();

    cy
      .get('.picklist')
      .contains('Physician PHS')
      .click();

    cy
      .get('@root')
      .find('.button-secondary--compact')
      .contains('PHS');
  });

  specify('with data', function() {
    const changeTeamStub = cy.stub().as('changeTeam');
    const teams = new Collection(fxTestTeams);

    Radio.reply('bootstrap', 'teams', () => {
      return teams;
    });

    cy
      .mount(rootView => {
        TeamComponent.setPopRegion(rootView.getRegion('pop'));

        const teamComponent = new TeamComponent({ team: teams.get(teamCoordinator.id), canClear: true });

        teamComponent.on('change:team', changeTeamStub);

        return teamComponent;
      })
      .as('root');

    cy
      .get('@root')
      .find('.button-secondary')
      .contains('Coordinator')
      .click();

    cy
      .get('.picklist')
      .find('.js-input')
      .type('p');

    cy
      .get('.picklist')
      .find('.picklist__item')
      .its('length')
      .should('eq', 3);

    cy
      .get('.picklist')
      .contains('Physician PHS')
      .click();

    cy
      .get('@changeTeam')
      .should('be.called.with', teams.find({ abbr: 'PHS' }));

    cy
      .get('@root')
      .find('.button-secondary')
      .contains('Physician')
      .click();

    cy
      .get('.picklist')
      .contains('Clear Selection')
      .click();

    cy
      .get('@changeTeam')
      .should('be.called.with', null);
  });
});
