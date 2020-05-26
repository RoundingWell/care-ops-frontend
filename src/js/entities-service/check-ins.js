import BaseEntity from 'js/base/entity-service';
import { _Model, Model, Collection } from './entities/check-ins';

const Entity = BaseEntity.extend({
  Entity: { _Model, Model, Collection },
  radioRequests: {
    'checkIns:model': 'getModel',
    'fetch:checkIns:model': 'fetchCheckInModel',
  },
  fetchCheckInModel({ checkInId, patientId }) {
    // API needs patientId to verify clinician access
    const checkIn = this.getModel();
    const filter = { checkin: checkInId };
    return checkIn.fetch({
      url: `/api/patients/${ patientId }/checkins`,
      data: { filter },
    });
  },
});

export default new Entity();
