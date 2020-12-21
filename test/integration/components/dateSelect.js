import 'js/base/setup';
import Backbone from 'backbone';
import { Region } from 'marionette';

import dayjs from 'dayjs';

context('DateSelect', function() {
  beforeEach(function() {
    cy
      .visitComponent('DateSelect');

    // Set View prototype to window's BB for instanceOf checks
    cy
      .window()
      .its('Backbone')
      .then(winBackbone => {
        Backbone.View = winBackbone.View;
      });
  });

  specify('Setting the date', function() {
    const DateSelect = this.DateSelect;
    const currentDate = dayjs();
    const pastDate = currentDate.subtract(10, 'years');

    cy
      .getHook($hook => {
        const region = new Region({ el: $hook[0] });

        const dateSelect = new DateSelect({
          selectButtonClassName: 'test-view__select',
        });

        dateSelect.showIn(region);
      });

    cy
      .get('@hook')
      .find('.test-view__select')
      .should('contain', 'Select year...')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__item')
      .contains(pastDate.year())
      .click();

    cy
      .get('@hook')
      .find('.date-select__date')
      .should('contain', pastDate.year());

    cy
      .get('@hook')
      .find('.test-view__select')
      .should('contain', 'Select month...')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__item')
      .contains(pastDate.format('MMMM'))
      .click();

    cy
      .get('@hook')
      .find('.date-select__date')
      .should('contain', pastDate.format('MMM YYYY'))
      .click();

    cy
      .get('@hook')
      .find('.test-view__select')
      .should('contain', 'Select day...')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__item')
      .contains(pastDate.date())
      .click();

    cy
      .get('@hook')
      .find('.date-select__date')
      .should('contain', pastDate.format('MMM DD, YYYY'));

    cy
      .get('@hook')
      .find('.test-view__select')
      .should('not.exist');

    cy
      .get('@hook')
      .find('.js-cancel')
      .click();

    cy
      .get('@hook')
      .find('.date-select__date')
      .should('not.exist');

    cy
      .get('@hook')
      .find('.test-view__select');
  });

  specify('Prefilled date', function() {
    const DateSelect = this.DateSelect;
    const currentDate = dayjs();
    const pastDate = currentDate.subtract(10, 'years');

    cy
      .getHook($hook => {
        const region = new Region({ el: $hook[0] });

        const dateSelect = new DateSelect({
          state: {
            selectedDate: pastDate.format('YYYY-MM-DD'),
          },
        });

        dateSelect.showIn(region);
      });

    cy
      .get('@hook')
      .find('.test-view__select')
      .should('not.exist');

    cy
      .get('@hook')
      .find('.date-select__date')
      .should('contain', pastDate.format('MMM DD, YYYY'))
      .next()
      .should('have.class', 'js-cancel');
  });
});
