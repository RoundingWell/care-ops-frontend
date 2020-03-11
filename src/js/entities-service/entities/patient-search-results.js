import _ from 'underscore';
import BaseCollection from 'js/base/collection';
import BaseModel from 'js/base/model';

const TYPE = 'patients-search-results';

const Model = BaseModel.extend({
  type: TYPE,
});

const Collection = BaseCollection.extend({
  url: '/api/patients',
  model: Model,
  initialize() {
    this._debouncedSearch = _.debounce(this._debouncedSearch, 150);
  },
  search(
    /* istanbul ignore next */
    search = '') {
    if (search.length < 3) {
      if (!search.length) this.reset();
      this.isSearching = false;
      return;
    }

    this.isSearching = true;
    this._debouncedSearch(search);
  },
  _debouncedSearch(search) {
    const filter = { search };

    this.fetch({ data: { filter } }).then(() => {
      this.isSearching = false;
      this.trigger('search', this);
    });
  },
});

export {
  Collection,
  Model,
};
