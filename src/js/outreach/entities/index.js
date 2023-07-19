import Radio from 'backbone.radio';
import fetcher, { handleJSON } from 'js/base/fetch';
import { v4 as uuid } from 'uuid';

function getRelationship(id, type) {
  return { data: { type, id } };
}

let token;

Radio.reply('auth', {
  setToken(tokenString) {
    token = tokenString;
  },
  getToken() {
    return token;
  },
});

function getToken({ dob, actionId }) {
  const data = {
    type: 'patient-tokens',
    id: uuid(),
    attributes: {
      reason: 'outreach',
      birth_date: dob,
    },
    relationships: {
      action: getRelationship(actionId, 'patient-actions'),
    },
  };

  return fetcher('/api/patient-tokens', {
    method: 'POST',
    data: JSON.stringify({ data }),
  })
    .then(handleJSON)
    .then(({ data: { attributes } }) => {
      Radio.request('auth', 'setToken', attributes.token);
      return Promise.resolve(attributes.token);
    });
}

function getPatientInfo({ actionId }) {
  return fetcher(`/api/outreach?filter[action]=${ actionId }`, {
    method: 'GET',
  })
    .then(handleJSON)
    .then(({ data }) => {
      return data;
    });
}

function createVerificationCode({ patientId }) {
  return fetcher(`/api/outreach/${ patientId }`, {
    method: 'POST',
    data: {},
  })
    .then(handleJSON);
}

function validateVerificationCode({ patientId, code }) {
  const data = {
    patient_id: patientId,
    otp: code,
  };

  return fetcher('/api/outreach/auth', {
    method: 'POST',
    data: JSON.stringify({ data }),
  })
    .then(handleJSON)
    .then(({ data: { attributes } }) => {
      Radio.request('auth', 'setToken', attributes.token);
      return Promise.resolve(attributes.token);
    });
}

function optInPostRequest({ inputData }) {
  const data = {
    first_name: inputData.get('firstName'),
    last_name: inputData.get('lastName'),
    birth_date: inputData.get('dob'),
    phone: inputData.get('phone'),
    email: inputData.get('email'),
  };

  return fetcher('/api/outreach', {
    method: 'POST',
    data: JSON.stringify({ data }),
  })
    .then(handleJSON);
}

function postResponse({ formId, actionId, response }) {
  const data = {
    type: 'form-responses',
    id: uuid(),
    attributes: { response },
    relationships: {
      action: getRelationship(actionId, 'patient-actions'),
      form: getRelationship(formId, 'forms'),
    },
  };

  return fetcher(`/api/actions/${ actionId }/relationships/form-responses`, {
    method: 'POST',
    data: JSON.stringify({ data }),
  })
    .then(handleJSON);
}

export {
  getToken,
  getPatientInfo,
  postResponse,
  optInPostRequest,
  createVerificationCode,
  validateVerificationCode,
};
