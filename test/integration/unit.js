// Cypress dev unit runner

const req = require.context('../unit/', true, /^(.*\.(js$))[^.]*$/i);

req.keys().forEach(req);
