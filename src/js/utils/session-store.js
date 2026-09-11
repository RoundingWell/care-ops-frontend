import createWebStore from './web-store';

const sessionStore = createWebStore(() => window.sessionStorage);

export default sessionStore;
