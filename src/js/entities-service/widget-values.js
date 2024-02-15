import { isEmpty } from 'underscore';
import Radio from 'backbone.radio';
import BaseEntity from 'js/base/entity-service';
import { _Model, Model } from './entities/widget-values';
import { v5 as uuid } from 'uuid';

const Entity = BaseEntity.extend({
  Entity: { _Model, Model },
  radioRequests: {
    'get:widgetValues:model': 'getByPatient',
    'fetch:widgetValues:byPatient': 'fetchByPatient',
  },
  fetchByPatient(widgetName, patientId) {
    const model = this.getByPatient(widgetName, patientId);

    const widgets = Radio.request('bootstrap', 'sidebarWidgets');

    // Uses find as widgets have a modelId on the collection
    const requestValues = widgets.find({ id: widgetName }).get('values');

    // If not expecting values don't fetch them
    if (isEmpty(requestValues)) return model;

    const data = { filter: { patient: patientId } };
    return model.fetch({ url: `/api/widgets/${ widgetName }/values`, data });
  },
  getByPatient(widgetName, patientId) {
    return new Model({
      id: uuid(widgetName, patientId),
      name: widgetName,
    });
  },
});

export default new Entity();
