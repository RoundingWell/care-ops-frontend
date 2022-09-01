import { debounce } from 'underscore';
import dayjs from 'dayjs';
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
  search(
    /* istanbul ignore next */
    search = '', searchType) {
    if (search.length < 3) {
      if (!search.length) this.reset();
      this.isSearching = false;
      return;
    }

    if (searchType === 'dob') {
      // strict valid date check: https://day.js.org/docs/en/parse/is-valid
      const isValidDate = dayjs(search, 'YYYY-MM-DD', true).isValid();

      if (!isValidDate) return;
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
