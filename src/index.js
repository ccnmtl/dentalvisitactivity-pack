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

var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1));
    var sURLVariables = sPageURL.split('&');

    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

jQuery(document).ready(function() {

    if (!getUrlParameter('parent')) {
        jQuery('#cu-privacy-notice').addClass('required');
    }

    module.DentalVisitApp.initialize();
});
