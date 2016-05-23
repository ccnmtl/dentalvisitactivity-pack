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

    initialize: function() {
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
        answered: [],
        elapsed_time: null,
        current_topic: null
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
        this.chartTemplate =
            require('../static/templates/patientchart-template.html');

        // empty state object
        this.state = new DentalVisitApp.Models.CounselingSessionState();
        this.state.bind('change:elapsed_time', this.renderTime);
        this.state.bind('change:countdown', this.renderCountdown);

        this.session = options.session;
    },
    render: function() {
        // Only invoked once when the session model is instantiated
        this.el.innerHTML = this.template(this.session.toJSON());

        this.renderTime(); // explicit
        this.renderState(); // explicit
    },
    renderState: function() {
        var discussed = 'Discussed';

        // patient chart + enable/disable
        jQuery('#patient-chart-text').html('');
        var json = this.state.toJSON();
        json.topics = [];
        var answered = this.state.get('answered');

        for (var i = 0; i < answered.length; i++)  {
            // hydrate the 'answer' topic with full attributes
            var topic = this.session.get('topics').get(answered[i]);
            json.topics.push(topic.toJSON());

            // Disable the topic's button
            var btn =  jQuery('#' + answered[i]).find('.btn.discuss');
            jQuery(btn).removeClass('btn-info')
                .addClass('btn-success')
                .attr('disabled', 'disabled')
                .html(discussed);
        }
        jQuery('#patient-chart-text').append(this.chartTemplate(json));

        var availableTime = this.session.get('available_time') -
            this.state.get('elapsed_time');
        var enabled = 0;
        var notimeleft = 'No time left!';

        this.session.get('topics').forEach(function(topic) {
            if (topic.get('estimated_time') > availableTime) {
                var btn = jQuery('#' + topic.get('id')).find('.btn.discuss');
                jQuery(btn).removeClass('btn-info')
                    .addClass('btn-danger')
                    .attr('disabled', 'disabled')
                    .html(notimeleft);
            } else {
                jQuery('#' + topic.get('id')).find('.btn.discuss')
                    .removeAttr('disabled');
                enabled++;
            }
        });

        // Show the 'next' icon if
        // 1. The available time <= 0
        // 2. All topics are discussed
        // 3. Remaining topics estimated_time > available_time
        if (availableTime <= 0 || enabled === 0) {
            // The Activity Is Complete
            if (availableTime > 0 && enabled === 0) {
                jQuery('#complete-overlay h1').html(
                    'You\'ve completed your session!');
            } else {
                jQuery('#complete-overlay h1').html(
                    'You\'ve run out of time!');
            }
            jQuery('#complete-overlay').show();
        } else {
            jQuery('#complete-overlay').hide();
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

        var dataId = jQuery(elt).data('id');
        var topic = this.session.get('topics').get(dataId);

        jQuery('#display_time').addClass('flash');
        jQuery(parent).find('.btn.complete')
           .attr('disabled', 'disabled').addClass('flash');

        this.state.get('answered').push(topic.id);
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
    }
});

DentalVisitApp.Router = Backbone.Router.extend({
    routes: {
        '': 'initial',
        'initial': 'initial',
        'followup': 'followup',
        'referral': 'referral'
    },
    initialize: function() {
        this.sessions =
            new DentalVisitApp.Models.CounselingSessionList(sessions);

        this.initialView = new DentalVisitApp.Views.CounselingSessionView({
            el: jQuery('div.counseling-session'),
            session: this.sessions.get(1)
        });

        this.followupView = new DentalVisitApp.Views.CounselingSessionView({
            el: jQuery('div.counseling-session'),
            session: this.sessions.get(2)
        });

        //this.referralView = new DentalVisitApp.Views.ReferralView({
        //    el: jQuery('div.counseling-session')
        //});

        jQuery('#reset').click(function(e) {
            DentalVisitApp.initialize();
            DentalVisitApp.inst.router.navigate('initial', {trigger: true});
        });
    },
    initial: function() {
        this.initialView.render();
    },
    followupView: function() {
        this.followupView.render();
    },
    referral: function() {
        this.referralView.show();
    }
});

module.exports.DentalVisitApp = DentalVisitApp;
module.exports.sessions = sessions;
