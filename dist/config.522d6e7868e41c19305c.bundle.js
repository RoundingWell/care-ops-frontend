(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["config"],{

/***/ "./src/js/config.js":
/*!**************************!*\
  !*** ./src/js/config.js ***!
  \**************************/
/*! exports provided: fetchConfig */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"fetchConfig\", function() { return fetchConfig; });\n/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! jquery */ \"./node_modules/jquery/dist/jquery.js\");\n/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(jquery__WEBPACK_IMPORTED_MODULE_0__);\n\n\nfunction fetchConfig(success, configVersion) {\n  jquery__WEBPACK_IMPORTED_MODULE_0___default.a.getJSON('/config.json').then(function (config) {\n    localStorage.setItem(\"config\".concat(configVersion), JSON.stringify(config));\n    success(config);\n  });\n}\n\n\n\n//# sourceURL=webpack:///./src/js/config.js?");

/***/ })

}]);