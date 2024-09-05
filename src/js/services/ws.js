import { each, values, isArray } from 'underscore';
import Backbone from 'backbone';
import Radio from 'backbone.radio';

import App from 'js/base/app';

export default App.extend({
  channelName: 'ws',

  radioRequests: {
    'send': 'send',
    'subscribe': 'subscribe',
    'subscribe:persist': 'subscribePersist',
    'unsubscribe': 'unsubscribe',
  },

  initialize({ url }) {
    this.resources = new Backbone.Collection();
    this.persistent = {};
    this.ws = {};
    this.url = url;
  },

  beforeStart() {
    Radio.request('auth', 'getToken');
  },

  onStart({ data }, token) {
    this.ws = new WebSocket(this.url, token);
    this.ws.addEventListener('open', () => this.ws.send(data));
    this.ws.addEventListener('message', this._onMessage.bind(this));
    this.ws.addEventListener('error', this._onError.bind(this));
  },

  _subscribe() {
    this.send({ name: 'Subscribe', data: { resources: this.resources.toJSON() } });
  },

  send(data) {
    if (!this.url) return;

    data = JSON.stringify(data);

    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(data);
      return;
    }

    if (this.ws.readyState !== WebSocket.CONNECTING) {
      this.start({ data });
      return;
    }

    this.ws.addEventListener('open', () => this.ws.send(data));
  },

  // TODO: handle message
  _onMessage(event) {
    const channel = this.getChannel();

    const data = JSON.parse(event.data);

    channel.trigger('message', data);
  },

  _onError(event) {
    // eslint-disable-next-line no-console
    console.error(event);
  },

  subscribe(resources) {
    this.resources.reset(resources);
    this.resources.add(values(this.persistent));
    this._subscribe();
  },

  subscribePersist(resources) {
    resources = isArray(resources) ? resources : [resources];
    each(resources, ({ id, type }) => {
      this.persistent[id] = { id, type };
    });
    this.resources.add(resources);
    this._subscribe();
  },

  unsubscribe(resources) {
    resources = isArray(resources) ? resources : [resources];
    each(resources, ({ id }) => {
      delete this.persistent[id];
    });
    this.resources.remove(resources);
    this._subscribe();
  },
});