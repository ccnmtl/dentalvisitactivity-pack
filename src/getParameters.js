/* global module: true */

function transformToAssocArray(prmstr) {
    var params = {};
    var prmarr = prmstr.split('&');
    for (var i = 0; i < prmarr.length; i++) {
        var tmparr = prmarr[i].split('=');
        params[tmparr[0]] = tmparr[1];
    }
    return params;
}

module.exports = function() {
    var prmstr = window.location.search.substr(1);
    return prmstr !== null &&
        prmstr !== '' ? transformToAssocArray(prmstr) : {};
};
