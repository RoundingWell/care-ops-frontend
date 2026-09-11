import createWebStore from './web-store';

const localStore = createWebStore(() => window.localStorage);

export default localStore;
