/* global jQuery: true, module: true */

jQuery = require('jquery');
var Backbone = require('backbone');
var _ = require('underscore');

module.exports = Backbone.View.extend({
    events: {
        'click a[disabled="disabled"]': 'onDisabled'
    },
    numbers: ['', 'one', 'two', 'three', 'four',
              'five', 'six', 'seven', 'eight', 'nine'],
    initialize: function(options) {
        _.bindAll(this, 'render');
        this.template = require('../static/templates/steps-template.html');
        this.steps = options.steps;
        this.render();
        this.enableNext();
    },
    render: function() {
        var markup = this.template({
            'count': this.steps,
            'numbers': this.numbers});
        this.$el.html(markup);
    },
    enableNext: function() {
        this.$el.find('.btn-primary').toggleClass('btn-primary btn-info');

        this.$el.find('a[disabled="disabled"]')
            .first()
            .removeAttr('disabled')
            .addClass('flash-next');
    },
    next: function(btn) {
        // mark active button as done
        this.$el.find('.btn-primary').toggleClass('btn-primary btn-info');

        // mark next button as active
        this.$el.find('a[href="' + btn + '"]')
            .toggleClass('btn-primary btn-info')
            .removeClass('flash-next');
    },
    onDisabled: function(evt) {
        evt.stopImmediatePropagation();
        return false;
    }
});
