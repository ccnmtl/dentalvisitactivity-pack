/* global jQuery: true, module: true */

jQuery = require('jquery');
var Backbone = require('backbone');
var _ = require('underscore');
var NumberedStepsView = require('./steps.js');

// load json data
var sessions = require('../static/json/counselingSessions.json');

var DentalVisitApp = {
    Models: {},
    Views: {},
    inst: {},

    initialize: function(options) {
        var $parent = jQuery('.counseling-session');

        this.inst.sessions =
            new DentalVisitApp.Models.CounselingSessionList(sessions);

        this.inst.chartView = new DentalVisitApp.Views.PatientChartView({
            el: $parent
        });

        var views = [];

        // Step 1
        var page = jQuery('<div></div>');
        $parent.append(page);
        var view = new DentalVisitApp.Views.CounselingSessionView({
            el: page,
            session: this.inst.sessions.get(1),
            chartView: this.inst.chartView
        });
        views.push(view);

        // Step 2
        page = jQuery('<div></div>');
        $parent.append(page);
        view = new DentalVisitApp.Views.CounselingSessionView({
            el: page,
            session: this.inst.sessions.get(2),
            chartView: this.inst.chartView
        });
        views.push(view);

        // Step 3
        page = jQuery('<div></div>');
        $parent.append(page);
        view = new DentalVisitApp.Views.ReferralView({
            el: page,
            chartView: this.inst.chartView
        });
        views.push(view);

        // Step 4
        page = jQuery('<div></div>');
        $parent.append(page);
        view = new DentalVisitApp.Views.ReferralVisitView({el: page});
        views.push(view);

        this.inst.steps = new NumberedStepsView({
            el: jQuery('.steps'),
            views: views
        });

        jQuery('.interactive-container').show();
    }
};

DentalVisitApp.Models.DiscussionTopic = Backbone.Model.extend({
    toTemplate: function() {
        return _(this.attributes).clone();
    }
});

DentalVisitApp.Models.DiscussionTopicList = Backbone.Collection.extend({
    model: DentalVisitApp.Models.DiscussionTopic
});

DentalVisitApp.Models.CounselingSession = Backbone.Model.extend({
    initialize: function(attrs) {
        if (attrs) {
            this.set(
                'topics',
                new DentalVisitApp.Models.DiscussionTopicList(attrs.topics));
        }
    }
});

DentalVisitApp.Models.CounselingSessionList = Backbone.Collection.extend({
    model: DentalVisitApp.Models.CounselingSession,
});

DentalVisitApp.Models.CounselingSessionState = Backbone.Model.extend({
    defaults: {
        elapsed_time: null,
        countdown: null,
        complete: false
    }
});

DentalVisitApp.Models.Referral = Backbone.Model.extend({
    defaults: {
        date: null,
        to: null,
        from: null,
        medicalHistory: null,
        reason: null,
        complete: false
    }
});

DentalVisitApp.Views.PatientChartView = Backbone.View.extend({
    initialize: function(options) {
        _.bindAll(this, 'render');

        this.template =
            require('../static/templates/patientchart-template.html');
        this.chart = new DentalVisitApp.Models.DiscussionTopicList();
        this.chart.bind('add', this.render);
    },
    render: function() {
        for (var i = 0; i < this.chart.length; i++)  {
            var topic = this.chart.at(i);
            var q = '.panel[data-id="' + topic.get('id') + '"]';
            var $btn = jQuery(q).find('.btn.discuss');

            $btn.removeClass('btn-info btn-danger')
                .addClass('btn-success')
                .attr('disabled', 'disabled')
                .html('Discussed');
        }
        var $elt = this.$el.find('.patient-chart-text');
        var markup = this.template({'topics': this.chart.toJSON()});
        $elt.html(markup);
    }
});

DentalVisitApp.Views.CounselingSessionView = Backbone.View.extend({
    events: {
        'click .btn.discuss': 'onDiscussion',
        'click .btn.complete': 'onCloseDiscussion'
    },
    initialize: function(options) {
        _.bindAll(this, 'render', 'renderState',
                  'renderTime', 'renderCountdown',
                  'onDiscussion', 'onCloseDiscussion');

        this.template =
            require('../static/templates/session-template.html');

        // empty state object
        this.state = new DentalVisitApp.Models.CounselingSessionState();
        this.state.bind('change:elapsed_time', this.renderTime);
        this.state.bind('change:countdown', this.renderCountdown);

        this.session = options.session;
        this.chartView = options.chartView;
    },
    render: function() {
        // Only invoked once when the session model is instantiated
        this.$el.html(this.template(this.session.toJSON()));
        this.$el.show();
        this.renderTime(); // explicit
        this.renderState(); // explicit

        this.chartView.render();
    },
    renderState: function() {
        var availableTime = this.session.get('available_time') -
            this.state.get('elapsed_time');
        var enabled = 0;
        var notimeleft = 'No time left!';

        this.session.get('topics').forEach(function(topic) {
            var q = '.panel[data-id="' + topic.get('id') + '"]';
            var $btn = jQuery(q).find('.btn.discuss');

            if (topic.get('estimated_time') > availableTime) {
                $btn.removeClass('btn-info')
                    .addClass('btn-danger')
                    .attr('disabled', 'disabled')
                    .html(notimeleft);
            } else {
                $btn.removeAttr('disabled');
                enabled++;
            }
        });

        // Show the 'next' icon if
        // 1. The available time <= 0
        // 2. All topics are discussed
        // 3. Remaining topics estimated_time > available_time
        var $status = this.$el.find('.time_remaining');
        var $statusalert = this.$el.find('.time-status');
        if (availableTime <= 0 || enabled === 0) {
            // The Activity Is Complete
            if (availableTime > 0 && enabled === 0) {
                $statusalert.show();
                $statusalert.html('<h1>This session is completed.</h1>'+
                    'All information was recorded in your patient\'s chart.');
                $statusalert.addClass('in-time');
                $status.html('Session completed');
                $status.addClass('alert-success');
            } else {
                $statusalert.show();
                $statusalert.html('<h1>You have run out of time!</h1>'+
                    'All information was recorded in your patient\'s chart.');
                $statusalert.addClass('out-of-time');
                $status.html('Out of time!');
                $status.addClass('alert-danger');
            }
            this.state.set('complete', true);
        }
    },
    renderCountdown: function() {
        var self = this;
        var state = this.state;

        var countdown = state.get('countdown');
        if (countdown !== undefined) {
            // unbind for the moment, the timer will take care of this
            state.unbind('change:countdown', this.renderCountdown);

            // Decrement the counter,
            countdown -= 1;
            state.set('countdown', countdown);

            // Increment elapsed time >> triggers display time update
            state.set('elapsed_time', state.get('elapsed_time') + 1);

            // All discussion buttons are disabled,
            // the class gets a selected icon
            jQuery('.btn.discuss').attr('disabled', 'disabled');

            // Make the background div blink
            if (countdown > 0) {
                // continue countdown
                setTimeout(self.renderCountdown, 1000);
            } else {
                // all done
                jQuery('.flash').removeAttr('disabled').removeClass('flash');
                state.set('countdown', undefined);
                state.bind('change:countdown', self.renderCountdown);
            }
        }
    },
    renderTime: function() {
        var tm = this.session.get('available_time') -
            this.state.get('elapsed_time');
        jQuery('.display_time_text').html(tm);
    },
    onDiscussion: function(evt) {
        evt.stopImmediatePropagation();
        var elt = evt.currentTarget;
        var parent = jQuery(elt).parents('.panel-default');
        jQuery(parent).addClass('selected');
        jQuery(parent).find('.panel-collapse').addClass('in');

        this.$el.find('.display_time').addClass('flash');
        jQuery(parent).find('.btn.complete')
           .attr('disabled', 'disabled').addClass('flash');

        var dataId = jQuery(parent).data('id');
        var topic = this.session.get('topics').get(dataId);
        this.state.set({
            'countdown': topic.get('actual_time')
        });
    },
    onCloseDiscussion: function(evt) {
        evt.stopImmediatePropagation();

        var parent = jQuery(evt.currentTarget).parents('.panel-default');
        jQuery(parent).removeClass('selected');
        jQuery(parent).find('.panel-collapse').removeClass('in');
        this.renderState();

        var dataId = jQuery(parent).data('id');
        var topic = this.session.get('topics').get(dataId);
        this.chartView.chart.add(topic);

        if (this.state.get('complete')) {
            this.trigger('complete', this);
        }
    }
});

DentalVisitApp.Views.ReferralView = Backbone.View.extend({
    events: {
        'click .btn-refer': 'onRefer'
    },
    initialize: function(options) {
        _.bindAll(this, 'render', 'onRefer');

        this.template = require('../static/templates/referral-template.html');
        this.referral = new DentalVisitApp.Models.Referral();
        this.referral.bind('change:complete', this.render);
        this.chartView = options.chartView;
    },
    render: function() {
        var markup = this.template({'referral': this.referral.toJSON()});
        this.$el.html(markup);
        this.$el.show();
        this.chartView.render();
    },
    onRefer: function(evt) {
        evt.preventDefault();

        this.$el.find('.form-group').removeClass('has-error');

        var valid = true;
        var self = this;
        // validate fields are not empty
        this.$el.find('input,textarea').each(function() {
            if (jQuery(this).val() === '') {
                jQuery(this).parents('.form-group').addClass('has-error');
                valid = false;
            } else {
                self.referral.set(
                    jQuery(this).attr('name'), jQuery(this).val());
            }
        });

        if (valid) {
            this.referral.set('complete', true);
            this.trigger('complete', this);
        }

        return false;
    }
});

DentalVisitApp.Views.ReferralVisitView = Backbone.View.extend({
    initialize: function(options) {
        _.bindAll(this, 'render');

        this.template = require(
            '../static/templates/referral-visit-template.html');
    },
    render: function() {
        this.$el.html(this.template({}));
        this.$el.show();
        this.trigger('complete', this);
    }
});

module.exports.DentalVisitApp = DentalVisitApp;
module.exports.sessions = sessions;
