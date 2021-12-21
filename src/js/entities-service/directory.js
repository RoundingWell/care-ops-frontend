import $ from 'jquery';

import BaseEntity from 'js/base/entity-service';

const Entity = BaseEntity.extend({
  radioRequests: {
    'fetch:directory': 'fetchDirectory',
  },
  fetchDirectory(name, query) {
    return $.ajax({
      url: `/api/directory/${ name }`,
      data: query,
    });
  },
});

export default new Entity();
