import BaseEntity from 'js/base/entity-service';
import fetcher, { handleJSON } from 'js/base/fetch';

const Entity = BaseEntity.extend({
  radioRequests: {
    'fetch:icd': 'fetchIcd',
  },
  fetchIcd({ term, prefixes }) {
    const variables = { term, prefixes };
    const query = `query ($term: String!, $prefixes: [String!]) {
      icdCodes(term: $term, prefixes: $prefixes) {
        code
        description
        hcc_v24
        hcc_v28
        isSpecific
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
      .then(handleJSON);
  },
});

export default new Entity();

