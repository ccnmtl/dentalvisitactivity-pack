/* global jQuery: true, module: true */

jQuery = require('jquery');
var Backbone = require('backbone');
var _ = require('underscore');

// load json data
var sessions = require('../static/json/counselingSessions.json');

var DentalVisitApp = {
    Models: {},
    Views: {},
    Router: {},
    inst: {},

    initialize: function(options) {
        if (!this.inst.hasOwnProperty('router')) {
            this.inst.router = new DentalVisitApp.Router();
        }
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
        countdown: null
    }
});

DentalVisitApp.Views.PatientChartView = Backbone.View.extend({
    initialize: function(options) {
        _.bindAll(this, 'render');

        this.chartTemplate =
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
        var $elt = jQuery(this.el).find('.patient-chart-text');
        var markup = this.chartTemplate({'topics': this.chart.toJSON()});
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
        this.chart = options.chart;
    },
    render: function() {
        // Only invoked once when the session model is instantiated
        this.$el.html(this.template(this.session.toJSON()));
        this.$el.show();
        this.renderTime(); // explicit
        this.renderState(); // explicit
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
        var $overlay = jQuery(this.el).find('.complete-overlay');
        if (availableTime <= 0 || enabled === 0) {
            // The Activity Is Complete
            if (availableTime > 0 && enabled === 0) {
                $overlay.find('h1').html('You\'ve completed your session!');
            } else {
                $overlay.find('h1').html('You\'ve run out of time!');
            }
            $overlay.show();
        } else {
            $overlay.hide();
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

        jQuery(this.el).find('.display_time').addClass('flash');
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
        this.chart.add(topic);
    }
});

DentalVisitApp.Router = Backbone.Router.extend({
    routes: {
        '': 'initial',
        'initial': 'initial',
        'followup': 'followup',
        'referral': 'referral'
    },
    initialize: function(options) {
        this.sessions =
            new DentalVisitApp.Models.CounselingSessionList(sessions);

        this.$parent = jQuery('.counseling-session');

        this.chartView = new DentalVisitApp.Views.PatientChartView({
            el: this.$parent
        });

        var page = jQuery('<div></div>');
        this.$parent.append(page);
        this.initialView = new DentalVisitApp.Views.CounselingSessionView({
            el: page,
            session: this.sessions.get(1),
            chart: this.chartView.chart
        });

        page = jQuery('<div></div>');
        this.$parent.append(page);
        this.followupView = new DentalVisitApp.Views.CounselingSessionView({
            el: page,
            session: this.sessions.get(2),
            chart: this.chartView.chart
        });

        //this.referralView = new DentalVisitApp.Views.ReferralView({
        //    el: jQuery('div.counseling-session')
        //});
    },
    turnPage: function(newView) {
        if (this.currentPage) {
            jQuery(this.currentPage.el).hide();
        }
        this.currentPage = newView;
        newView.render();
        this.chartView.render();
    },
    initial: function() {
        this.turnPage(this.initialView);
    },
    followup: function() {
        this.turnPage(this.followupView);
    },
    referral: function() {
        //this.turnPage(this.referralView);
    }
});

module.exports.DentalVisitApp = DentalVisitApp;
module.exports.sessions = sessions;
