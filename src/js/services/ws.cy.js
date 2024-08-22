import Radio from 'backbone.radio';

import WSService from './ws';

context('WS Service', function() {
  let service;

  before(function() {
    Radio.reply('auth', 'getToken', () => 'token');
  });

  beforeEach(function() {
    const url = 'ws://cypress-websocket/ws';
    cy.mockWs(url);
    service = new WSService({ url });
  });

  afterEach(function() {
    service.destroy();
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

    // Start the service to initialize WebSocket and listeners
    service.start();

    cy.errorWs();

    cy.get('@consoleError').should('have.been.calledOnce');
  });

  specify('Constructing the websocket', function() {
    const channel = Radio.channel('ws');

    cy.interceptWs('SendTest').as('SendTestWs');

    channel.request('send', { name: 'SendTest', data: 'NOTCONNECTED' });

    cy
      .get('@SendTestWs')
      .should('equal', 'NOTCONNECTED');

    cy.interceptWs('SendTest').as('SendTestWs');

    channel.request('send', { name: 'SendTest', data: 'CONNECTING' });

    cy
      .get('@SendTestWs')
      .should('equal', 'CONNECTING');

    expect(service.isRunning()).to.be.true;

    cy.interceptWs('SendTest').as('SendTestWs');

    service.ws.onopen = () => {
      channel.request('send', { name: 'SendTest', data: 'OPEN' });
    };

    cy
      .get('@SendTestWs')
      .should('equal', 'OPEN');
  });

  specify('Subscribing', function() {
    const notifications = [
      { id: 'foo', type: 'bar' },
      { id: 'foo2', type: 'bar2' },
      { id: 'foo3', type: 'bar3' },
      { id: 'foo4', type: 'bar4' },
    ];

    const channel = Radio.channel('ws');

    cy.interceptWs('Subscribe').as('SubscribeWs');

    channel.request('subscribe', notifications[0]);

    cy
      .get('@SubscribeWs')
      .should('deep.equal', { resources: [notifications[0]] });

    cy.interceptWs('Subscribe').as('Subscribe2Ws');

    channel.request('subscribe:persist', notifications[1]);

    cy
      .get('@Subscribe2Ws')
      .should('deep.equal', { resources: [notifications[0], notifications[1]] });

    cy.interceptWs('Subscribe').as('Subscribe3Ws');

    channel.request('subscribe', [notifications[2]]);

    cy
      .get('@Subscribe3Ws')
      .should('deep.equal', { resources: [notifications[2], notifications[1]] });

    cy.interceptWs('Subscribe').as('Subscribe4Ws');

    channel.request('subscribe:persist', [notifications[3]]);

    cy
      .get('@Subscribe4Ws')
      .should('deep.equal', { resources: [notifications[2], notifications[1], notifications[3]] });

    cy.interceptWs('Subscribe').as('UnsubscribeWs');

    channel.request('unsubscribe', notifications[1]);

    cy
      .get('@UnsubscribeWs')
      .should('deep.equal', { resources: [notifications[2], notifications[3]] });

    cy.interceptWs('Subscribe').as('Unsubscribe2Ws');

    channel.request('unsubscribe', [notifications[3]]);

    cy
      .get('@Unsubscribe2Ws')
      .should('deep.equal', { resources: [notifications[2]] });
  });

  specify('Message handling', function() {
    const channel = Radio.channel('ws');

    const handler = cy.stub();

    service.listenTo(channel, 'message', handler);

    channel.request('subscribe', {});
    cy.sendWs({ id: 'foo', category: 'Test' });

    cy.then(() => {
      expect(handler).to.be.calledWith({ id: 'foo', category: 'Test' });
    });
  });
});
