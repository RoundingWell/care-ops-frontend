import Store from 'backbone.store';
import BaseModel from 'js/base/model';

const TYPE = 'organizations';

const _Model = BaseModel.extend({
  getStates() {
    return this.get('states').clone();
  },
  getActiveTeams() {
    const teams = this.getTeams();

    teams.reset(teams.filter(team => {
      return team.hasClinicians();
    }));

    return teams;
  },
  getTeams() {
    return this.get('teams').clone();
  },
  getForms() {
    return this.get('forms').clone();
  },
  getSetting(id) {
    return this.get('settings').get(id);
  },
  getDirectories() {
    return this.get('directories').clone();
  },
  type: TYPE,
});

const Model = Store(_Model, TYPE);

export {
  _Model,
  Model,
};
