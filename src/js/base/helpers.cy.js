import { View } from 'marionette';

import hbs from 'handlebars-inline-precompile';

import { testTs } from 'helpers/test-timestamp';
import formatDate from 'helpers/format-date';

context('Handlebars helpers', function() {
  specify('Match text formatting', function() {
    const MatchTextView = View.extend({
      template: hbs`
        <div class="test-element">{{matchText "Patient Name" null}}</div>
        <div class="test-element">{{matchText "Patient Name" "Patient"}}</div>
      `,
    });

    cy
      .mount(() => {
        return new MatchTextView();
      })
      .as('root');

    cy
      .get('@root')
      .find('.test-element')
      .first()
      .find('strong')
      .should('not.exist');

    cy
      .get('@root')
      .find('.test-element')
      .last()
      .find('strong')
      .should('contain', 'Patient');
  });

  specify('Date time formatting', function() {
    const testDate = testTs();

    const DateTimeView = View.extend({
      template: hbs`
        <div class="test-element">{{formatDateTime null "lll"}}</div>
        <div class="test-element">{{formatDateTime testDate "lll"}}</div>
        <div class="test-element">{{formatDateTime testDate "lll" nowrap=false}}</div>
        <div class="test-element">{{formatDateTime null "lll" defaultHtml="No Date Available"}}</div>
      `,
      templateContext() {
        return {
          testDate,
        };
      },
    });

    cy
      .mount(() => {
        return new DateTimeView();
      })
      .as('root');

    cy
      .get('@root')
      .find('.test-element')
      .first()
      .should('be.empty');

    cy
      .get('@root')
      .find('.test-element')
      .eq(1)
      .should('contain', formatDate(testDate, 'lll'));

    cy
      .get('@root')
      .find('.test-element')
      .eq(2)
      .find('.u-text--nowrap')
      .should('not.exist');

    cy
      .get('@root')
      .find('.test-element')
      .last()
      .should('contain', 'No Date Available');
  });

  specify('Phone number formatting', function() {
    const PhoneView = View.extend({
      template: hbs`
        <div class="test-element">{{formatPhoneNumber null}}</div>
        <div class="test-element">{{formatPhoneNumber phone}}</div>
        <div class="test-element">{{formatPhoneNumber badPhone}}</div>
        <div class="test-element">{{formatPhoneNumber null defaultHtml="No Phone Available"}}</div>
      `,
      templateContext() {
        return {
          phone: '6155555551',
          badPhone: 'UNKNOWN',
        };
      },
    });

    cy
      .mount(() => {
        return new PhoneView();
      })
      .as('root');

    cy
      .get('@root')
      .find('.test-element')
      .first()
      .should('be.empty');

    cy
      .get('@root')
      .find('.test-element')
      .eq(1)
      .should('contain', '(615) 555-5551');

    cy
      .get('@root')
      .find('.test-element')
      .eq(2)
      .should('be.empty');

    cy
      .get('@root')
      .find('.test-element')
      .last()
      .should('contain', 'No Phone Available');
  });
});
