import Radio from 'backbone.radio';

import WSService from './ws';

let service;
const clientKey = 'clientKey';

Cypress.Commands.add('startService', () => {
  return new Cypress.Promise(resolve => {
    service.on('start', resolve);
    service.start();
  });
});

context('WS Service', function() {
  beforeEach(function() {
    Radio.reply('bootstrap', 'currentUser', { clientKey });
    Radio.reply('auth', 'getToken', () => 'token');
    const url = 'ws://cypress-websocket/ws';
    cy.mockWs(url);
    service = new WSService({ url });
  });

  afterEach(function() {
    service.destroy();
    Radio.stopReplying('auth', 'getToken');
    Radio.stopReplying('bootstrap', 'currentUser');
  });

  specify('ws url not configured', function() {
    service.destroy();

    service = new WSService({ url: null });
    const channel = Radio.channel('ws');

    channel.request('subscribe', { id: 'foo', type: 'bar' });

    expect(service.isRunning()).to.be.false;
  });

  specify('ws error', function() {
    cy.spy(console, 'error').as('consoleError');

    cy
      .startService()
      .errorWs();

    cy.get('@consoleError').should('have.been.calledOnce');
  });

  specify('Constructing the websocket', function() {
    service.start();

    cy
      .interceptWs('SendTest').as('sendTest');

    service.on('start', () => {
      const channel = Radio.channel('ws');

      service.ws.readyState = WebSocket.CONNECTING;
      channel.request('send', { name: 'SendTest', data: 'NOTCONNECTED' });
    });

    cy
      .get('@sendTest')
      .should('equal', 'NOTCONNECTED');
  });

  specify('Connecting the websocket', function() {
    const channel = Radio.channel('ws');

    cy
      .startService()
      .interceptWs('SendTest', () => {
        channel.request('send', { name: 'SendTest', data: 'CONNECTING' });
      })
      .should('equal', 'CONNECTING')
      .then(() => {
        expect(service.isRunning()).to.be.true;
      });

    cy
      .interceptWs('SendTest', () => {
        channel.request('send', { name: 'SendTest', data: 'OPEN' });
      })
      .should('equal', 'OPEN');
  });

  specify('Restarting a closed socket', function() {
    const channel = Radio.channel('ws');

    cy.stub(service, 'restart').as('restart');

    // Start service
    channel.request('send', { name: 'SendTest', data: 'OPENED' });

    service.on('start', () => {
      // websocket is closed
      service.ws.close();

      // send after close
      service.ws.onclose = () => {
        channel.request('send', { name: 'SendTest', data: 'CLOSED' });
      };
    });

    cy
      .get('@restart')
      .should('have.been.calledOnce');
  });

  specify('Message handling', function() {
    const channel = Radio.channel('ws');

    const handler = cy.stub();

    cy
      .startService()
      .then(() => {
        service.listenTo(channel, 'message', handler);

        channel.request('subscribe', {});
      });

    cy
      .sendWs({ id: 'foo', category: 'Test' })
      .then(() => {
        expect(handler).to.be.calledWith({ id: 'foo', category: 'Test' });
      });
  });

  specify('Subscribing', function() {
    const notifications = [
      { id: 'foo', type: 'bar' },
      { id: 'foo2', type: 'bar2' },
      { id: 'foo3', type: 'bar3' },
      { id: 'foo4', type: 'bar4' },
    ];

    const channel = Radio.channel('ws');

    cy
      .startService()
      .interceptWs('Subscribe', () => {
        channel.request('subscribe', notifications[0]);
      })
      .should('deep.equal', { clientKey, resources: [notifications[0]] });

    cy
      .interceptWs('Subscribe', () => {
        channel.request('subscribe:persist', notifications[1]);
      })
      .should('deep.equal', { clientKey, resources: [notifications[0], notifications[1]] });

    cy
      .interceptWs('Subscribe', () => {
        channel.request('subscribe', notifications[2]);
      })
      .should('deep.equal', { clientKey, resources: [notifications[2], notifications[1]] });

    cy
      .interceptWs('Subscribe', () => {
        channel.request('subscribe:persist', [notifications[3]]);
      })
      .should('deep.equal', { clientKey, resources: [notifications[2], notifications[1], notifications[3]] });

    cy
      .interceptWs('Subscribe', () => {
        channel.request('unsubscribe', notifications[1]);
      })
      .should('deep.equal', { clientKey, resources: [notifications[2], notifications[3]] });

    cy
      .interceptWs('Subscribe', () => {
        channel.request('unsubscribe', [notifications[3]]);
      })
      .should('deep.equal', { clientKey, resources: [notifications[2]] });
  });
});
