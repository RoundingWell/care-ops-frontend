(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["formapp"],{

/***/ "./src/js/formapp.js":
/*!***************************!*\
  !*** ./src/js/formapp.js ***!
  \***************************/
/*! exports provided: loadForm */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"loadForm\", function() { return loadForm; });\n/* harmony import */ var formiojs_dist_formio_form_min__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! formiojs/dist/formio.form.min */ \"./node_modules/formiojs/dist/formio.form.min.js\");\n/* harmony import */ var formiojs_dist_formio_form_min__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(formiojs_dist_formio_form_min__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var formiojs_dist_formio_form_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! formiojs/dist/formio.form.css */ \"./node_modules/formiojs/dist/formio.form.css\");\n/* harmony import */ var formiojs_dist_formio_form_css__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(formiojs_dist_formio_form_css__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var bootstrap_dist_css_bootstrap_min_css__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! bootstrap/dist/css/bootstrap.min.css */ \"./node_modules/bootstrap/dist/css/bootstrap.min.css\");\n/* harmony import */ var bootstrap_dist_css_bootstrap_min_css__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(bootstrap_dist_css_bootstrap_min_css__WEBPACK_IMPORTED_MODULE_2__);\n/* global Formio */\n\n\n\n\nfunction loadForm(_ref) {\n  var token = _ref.token;\n  Formio.createForm(document.getElementById('root'), 'https://examples.form.io/example').then(function (form) {\n    // Defaults are provided as follows.\n    form.submission = {\n      data: {\n        firstName: 'Joe',\n        lastName: 'Smith'\n      }\n    };\n  });\n}\n\n\n\n//# sourceURL=webpack:///./src/js/formapp.js?");

/***/ })

}]);