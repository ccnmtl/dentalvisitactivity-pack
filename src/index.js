/* global jQuery: true */

// load and apply css
require('../node_modules/bootstrap/dist/css/bootstrap.min.css');
require('../node_modules/bootstrap-arrow-buttons/dist/' +
        'css/bootstrap-arrow-buttons.css');
require('../static/css/common.css');
require('../static/css/steps.css');
require('../static/css/dentalvisit.css');

var jQuery = require('jquery');
var module = require('./dentalvisit.js');

jQuery(document).ready(function() {
    module.DentalVisitApp.initialize();
});
