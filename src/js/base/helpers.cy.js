import Backbone from 'backbone';
import { View } from 'marionette';

import hbs from 'handlebars-inline-precompile';

import { testTs } from 'helpers/test-timestamp';
import formatDate from 'helpers/format-date';

context('Handlebars helpers', function() {
  const testDate = testTs();

  const MatchTextView = View.extend({
    template: hbs`
      <div class="test-element">
        {{matchText "Patient Name" null}}
      </div>
      <div class="test-element">
        {{matchText "Patient Name" "Patient"}}
      </div>
    `,
  });

  const DateTimeView = View.extend({
    template: hbs`
      <div class="test-element">
        {{formatDateTime null "lll"}}
      </div>
      <div class="test-element">
        {{formatDateTime testDate "lll"}}
      </div>
      <div class="test-element">
        {{formatDateTime testDate "lll" nowrap=false}}
      </div>
      <div class="test-element">
        {{formatDateTime null "lll" defaultHtml="No Date Available"}}
      </div>
    `,
    templateContext() {
      return {
        testDate,
      };
    },
  });

  const PhoneView = View.extend({
    template: hbs`
      <div class="test-element">
        {{formatPhoneNumber null}}
      </div>
      <div class="test-element">
        {{formatPhoneNumber phone}}
      </div>
      <div class="test-element">
        {{formatPhoneNumber badPhone}}
      </div>
      <div class="test-element">
        {{formatPhoneNumber null defaultHtml="No Phone Available"}}
      </div>
    `,
    templateContext() {
      return {
        phone: '6155555551',
        badPhone: 'UNKNOWN',
      };
    },
  });


  specify('Match text formatting', function() {
    const matchTextView = new MatchTextView({
      model: new Backbone.Model(),
    });

    cy
      .mount(rootView => {
        return matchTextView;
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
    const dateTimeView = new DateTimeView({
      model: new Backbone.Model(),
    });

    cy
      .mount(rootView => {
        return dateTimeView;
      })
      .as('root');

    cy
      .get('@root')
      .find('.test-element')
      .first()
      .should(el => {
        expect(el.text().trim()).equal('');
      });

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
    const phoneView = new PhoneView({
      model: new Backbone.Model(),
    });

    cy
      .mount(rootView => {
        return phoneView;
      })
      .as('root');

    cy
      .get('@root')
      .find('.test-element')
      .first()
      .should(el => {
        expect(el.text().trim()).equal('');
      });

    cy
      .get('@root')
      .find('.test-element')
      .eq(1)
      .should('contain', '(615) 555-5551');

    cy
      .get('@root')
      .find('.test-element')
      .eq(2)
      .should(el => {
        expect(el.text().trim()).equal('');
      });

    cy
      .get('@root')
      .find('.test-element')
      .last()
      .should('contain', 'No Phone Available');
  });
});
