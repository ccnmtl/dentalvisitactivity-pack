/* global jQuery: true, module: true */

jQuery = require('jquery');
var Backbone = require('backbone');
var _ = require('underscore');

var Step = Backbone.Model.extend({
    defaults: {
        view: null,
        idx: null,
        complete: false
    }
});

var StepCollection = Backbone.Collection.extend({
    model: Step
});

var CurrentStep = Backbone.Model.extend({
    defaults: {
        idx: null
    }
});

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

module.exports = Backbone.View.extend({
    events: {
        'click a[disabled="disabled"]': 'onDisabled',
        'click .btn-step': 'onStep',
        'click .btn-print': 'onPrint'
    },
    numbers: ['', 'one', 'two', 'three', 'four',
              'five', 'six', 'seven', 'eight', 'nine'],
    initialize: function(options) {
        _.bindAll(this, 'render', 'maybeEnableNext', 'beforeUnload',
                  'onComplete', 'onPrint', 'onStep');
        this.template = require('../static/templates/steps-template.html');
        this.steps = new StepCollection();

        for (var i = 0; i < options.views.length; i++) {
            var view = options.views[i];
            var step = new Step({view: view, idx: i, id: view.cid});
            step.bind('change:complete', this.render);
            this.steps.add(step);
            options.views[i].once('complete', this.onComplete, [view]);
        }

        this.currentStep = new CurrentStep();
        this.currentStep.bind('change', this.render);
        this.currentStep.set('idx', 0);

        var quiet = getUrlParameter('quiet') === '1';
        if (!quiet) {
            jQuery(window).on('beforeunload', this.beforeUnload);
        }
    },
    beforeUnload: function() {
        var finalIdx = this.steps.length - 1;
        if (!this.steps.at(finalIdx).get('complete')) {
            return 'The activity is not complete. ' +
                'Your progress will not be saved if you leave this page.';
        }
    },
    render: function() {
        var idx = this.currentStep.get('idx');
        var markup = this.template({
            'current': idx,
            'steps': this.steps.toJSON(),
            'numbers': this.numbers,
            'done': this.isDone()});
        this.$el.html(markup);

        for (var i = 0; i < this.steps.length; i++) {
            var view = this.steps.at(i).get('view');
            if (i === idx) {
                view.render();
            } else {
                view.$el.hide();
            }
        }
    },
    maybeEnableNext: function($btn, curIdx) {
        var $nextStep = $btn.next('.btn-step');
        if (!this.steps[curIdx].complete() || $nextStep.length < 1) {
            return;
        }

        $nextStep.removeAttr('disabled');
        var nextIdx = parseInt($nextStep.data('idx'), 10);
        if (!this.steps[nextIdx].complete()) {
            $nextStep.addClass('flash-next');
        }
    },
    onComplete: function(view) {
        var step = this.steps.get(view.cid);
        step.set('complete', true);
    },
    onDisabled: function(evt) {
        evt.stopImmediatePropagation();
        return false;
    },
    onPrint: function(evt) {
        window.print();
    },
    onStep: function(evt) {
        var nextIdx = parseInt(jQuery(evt.currentTarget).data('idx'), 10);
        if (this.currentStep.get('idx') !== nextIdx) {
            this.currentStep.set('idx', nextIdx);
        }
    },
    isDone: function() {
        for (var i = 0; i < this.steps.length; i++) {
            if (!this.steps.at(i).get('complete')) {
                return false;
            }
        }
        return true;
    }
});
