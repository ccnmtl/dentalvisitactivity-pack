var assert = require('chai').assert;

var module = require('../src/dentalvisit');

describe('CounselingSessionList', function () {
    var app = module.DentalVisitApp;
    var list = null;

    beforeEach(function() {
        list = new app.Models.CounselingSessionList(module.sessions);
    });

    it('initialize', function() {
        assert.equal(list.length, 2);
    });

    it('get', function() {
        var session = list.get(1);
        assert(session !== undefined);
        assert.equal(session.get('available_time'), 6);

        var topics = session.get('topics');
        assert.equal(topics.length, 9);

        var topic = topics.at(0);
        assert.equal(topic.get('actual_time'), 6);
        assert.equal(
            topic.get('summary_text'),
            'Obtain food recall from previous day');
    });
});
