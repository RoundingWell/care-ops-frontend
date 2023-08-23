import Store from 'backbone.store';
import BaseCollection from 'js/base/collection';
import BaseModel from 'js/base/model';
import fetcher, { handleJSON } from 'js/base/fetch';

const TYPE = 'outreach';

const _Model = BaseModel.extend({
  type: TYPE,
  registerPatient(attributes) {
    return fetcher('/api/outreach', {
      method: 'POST',
      data: JSON.stringify({
        data: {
          type: 'patients',
          attributes,
        },
      }),
    })
      .then(handleJSON);
  },
  requestOtpCreation(actionId) {
    return fetcher('/api/outreach/otp', {
      method: 'POST',
      data: JSON.stringify({
        data: {
          type: 'patient-actions',
          id: actionId,
        },
      }),
    })
      .then(handleJSON);
  },
  requestOtpAuth(code) {
    const url = '/api/outreach/auth';

    return fetcher(url, {
      method: 'POST',
      data: JSON.stringify({
        data: {
          type: 'outreach',
          id: this.id,
          attributes: {
            code,
          },
        },
      }),
    })
      .then(handleJSON);
  },
});

const Model = Store(_Model, TYPE);
const Collection = BaseCollection.extend({
  model: Model,
});

export {
  _Model,
  Model,
  Collection,
};
