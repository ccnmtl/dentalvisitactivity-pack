/* global jQuery: true */
/* eslint security/detect-non-literal-require: 0 */

require('!file-loader?name=[name].[ext]!../static/index.html');
require('!file-loader?name=[name].[ext]!../static/img/logo-cdm.png');
require('!file-loader?name=[name].[ext]!../static/img/logo-ctl.png');

// load and apply css
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-arrow-buttons/dist/css/bootstrap-arrow-buttons.css';
import '../static/css/common.css';
import '../static/css/steps.css';
import '../static/css/dentalvisit.css';

var jQuery = require('jquery');
var module = require('./dentalvisit.js');

jQuery(document).ready(function() {
    module.DentalVisitApp.initialize();
});
