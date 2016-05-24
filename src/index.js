/* global jQuery: true, Backbone: true */

// load css
require('../node_modules/bootstrap/dist/css/bootstrap.min.css');
require('../static/css/common.css');
require('../static/css/dentalvisit.css');

var jQuery = require('jquery');
var module = require('./dentalvisit.js');

jQuery(document).ready(function() {
    module.DentalVisitApp.initialize();
    Backbone.history.start();
});
