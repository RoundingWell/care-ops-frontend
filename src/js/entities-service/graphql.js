import BaseEntity from 'js/base/entity-service';
import fetcher from 'js/base/fetch';

const Entity = BaseEntity.extend({
  radioRequests: {
    'fetch:icd:byTerm': 'fetchIcdByTerm',
  },
  fetchIcdByTerm(term) {
    const variables = { term };
    const query = `query ($term: String!) {
      icdCodes(term: $term) {
        code
        description
        hcc_v24
        hcc_v28
        parent {
          code
          description
        }
        children {
          code
          description
        }
      }
    }`;

    return fetcher('/api/graphql', {
      header: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({ query, variables }),
    })
      .then(response => response.json());
  },
});

export default new Entity();

