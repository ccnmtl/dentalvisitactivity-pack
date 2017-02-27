/* global jQuery: true */

require('!file-loader?name=[name].[ext]!../static/index.html');
require('!file-loader?name=[name].[ext]!../static/img/logo-cdm.png');
require('!file-loader?name=[name].[ext]!../static/img/logo-ctl.png');

// load and apply css
require('!style-loader!css-loader!bootstrap/dist/css/bootstrap.min.css');
require('!style-loader!css-loader!bootstrap-arrow-buttons/dist/css/' +
        'bootstrap-arrow-buttons.css');
require('!style-loader!css-loader!../static/css/common.css');
require('!style-loader!css-loader!../static/css/steps.css');
require('!style-loader!css-loader!../static/css/dentalvisit.css');

var jQuery = require('jquery');
var module = require('./dentalvisit.js');

jQuery(document).ready(function() {
    module.DentalVisitApp.initialize();
});
