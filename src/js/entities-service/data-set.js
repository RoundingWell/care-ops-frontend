import $ from 'jquery';

import BaseEntity from 'js/base/entity-service';

const Entity = BaseEntity.extend({
  radioRequests: {
    'fetch:dataSet': 'fetchDataSet',
  },
  fetchDataSet(name, query) {
    return $.ajax({
      url: `/api/data/${ name }`,
      data: query,
    });
  },
});

export default new Entity();
