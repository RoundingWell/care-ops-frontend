/* global Formio */
import 'formiojs/dist/formio.form.min';
import 'formiojs/dist/formio.form.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function loadForm({ token }) {
  Formio.createForm(document.getElementById('root'), 'https://examples.form.io/example').then(function(form) {
    // Defaults are provided as follows.
    form.submission = {
      data: {
        firstName: 'Joe',
        lastName: 'Smith',
      },
    };
  });
}

export {
  loadForm,
};
