/* global jQuery: true */

require('!file?name=[name].[ext]!../static/index.html');
require('!file?name=[name].[ext]!../static/img/logo-cdm.png');
require('!file?name=[name].[ext]!../static/img/logo-ctl.png');

// load and apply css
require('!style!css!bootstrap/dist/css/bootstrap.min.css');
require('!style!css!bootstrap-arrow-buttons/dist/css/' +
        'bootstrap-arrow-buttons.css');
require('../static/css/common.css');
require('../static/css/steps.css');
require('../static/css/dentalvisit.css');

var jQuery = require('jquery');
var module = require('./dentalvisit.js');

jQuery(document).ready(function() {
    module.DentalVisitApp.initialize();
});
