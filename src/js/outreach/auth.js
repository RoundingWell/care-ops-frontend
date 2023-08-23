import Radio from 'backbone.radio';

let token;

Radio.reply('auth', {
  setToken(tokenString) {
    token = tokenString;
  },
  getToken() {
    return token;
  },
});
