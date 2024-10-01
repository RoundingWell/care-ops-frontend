
import { Server, WebSocket as MockedWebSocket } from 'mock-socket';

let socketReady;
let mockServer;

const sendMessage = (socket, message) => {
  socket.send(JSON.stringify(message));
};

const messageHandlers = {};

const handleMessages = message => {
  const { name, data } = JSON.parse(message);
  if (messageHandlers[name]) {
    cy.log(`ws: Intercepted message with name ${ name }`, data);
    messageHandlers[name](data);
  }
};

const getServer = (url, connectionResponseData) => {
  return new Cypress.Promise(resolve => {
    if (mockServer) {
      mockServer.close();
    }

    mockServer = new Server(url, { mock: true });

    mockServer.on('connection', socket => {
      if (connectionResponseData) {
        sendMessage(socket, connectionResponseData);
      }

      socket.on('message', function(message) {
        if (message) handleMessages(message);
      });
    });

    resolve();
  });
};

Cypress.Commands.add('mockWs', (url, { connectionResponseMessage } = {}) => {
  cy.log('ws: Mocking WebSocket');

  cy.on('window:before:load', win => {
    win.WebSocket = MockedWebSocket;
  });

  socketReady = getServer(url, connectionResponseMessage);

  cy.on('test:after:run', () => {
    cy.log('ws: Stopping Mock Server');
    mockServer.close();
  });
});

Cypress.Commands.add('sendWs', message => {
  cy.wrap(socketReady).then(() => {
    message = JSON.stringify(message);
    cy.log('ws: Sending message', message);
    mockServer.emit('message', message);
  });
});

Cypress.Commands.add('errorWs', () => {
  cy.wrap(socketReady).then(() => {
    cy.log('ws: Sending error');
    mockServer.simulate('error');
  });
});

Cypress.Commands.add('interceptWs', (name, callback) => {
  cy.wrap(socketReady).then(() => {
    return new Cypress.Promise(resolve => {
      messageHandlers[name] = resolve;
      if (callback) callback();
    });
  });
});
