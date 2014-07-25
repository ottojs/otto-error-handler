
'use strict';

// Modules
var response = require('otto-response');

// Exports
module.exports = function (app) {

  // Catch-All Route (Not Found)
  app.use(response.not_found);

  // Error Handler
  app.use(response.failure);

};
