import { debounce, get, isBoolean, noop } from 'underscore';
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
    this._debouncedSearch = debounce(this._debouncedSearch, 150);
  },
  prevSearch: '',
  fetcher: { abort: noop },
  search(
    /* istanbul ignore next */
    search = '') {
    if (search.length < 3) {
      if (!search.length || !this.prevSearch.includes(search)) {
        delete this._hasIdentifiers;
        this.reset();
        this.prevSearch = '';
      }
      this._debouncedSearch.cancel();
      this.fetcher.abort();
      return;
    }

    this.prevSearch = search;
    this.isSearching = true;
    this._debouncedSearch(search);
  },
  hasIdentifiers() {
    if (isBoolean(this._hasIdentifiers)) return this._hasIdentifiers;

    this._hasIdentifiers = !!this.find(model => {
      return get(model.get('identifiers'), 'length');
    });

    return this._hasIdentifiers;
  },
  _debouncedSearch(search) {
    const filter = { search };

    delete this._hasIdentifiers;
    this.fetcher = this.fetch({ data: { filter } });

    this.fetcher.then(() => {
      this.isSearching = false;
      this.trigger('search', this);
    });
  },
});

export {
  Collection,
  Model,
};
