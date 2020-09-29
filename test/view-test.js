/* global describe: true, before: true, it: true */

var chai = require('chai');
var assert = chai.assert;

var jQuery = require('jquery');
var module = require('../src/dentalvisit');

function waitFor(testFx, doneFx, millis) {
    var timeout = millis ? millis : 3000; // Default Max Timout is 10s
    var start = new Date().getTime();

    var interval = setInterval(function() {
        var condition = testFx();

        if (condition) {
            clearInterval(interval);
            doneFx();
        } else if ((new Date().getTime() - start >= timeout)) {
            clearInterval(interval);
            doneFx(new Error('timeout occurred'));
        }
    }, 250); //< repeat check every 250ms
}

function openDiscussion(done) {
    jQuery('.discuss:visible').first().click();
    waitFor(function() {
        return jQuery('.display_time_text').html() === '0';
    }, done, 6000);
}

function closeDiscussion() {
    var $elt = jQuery('.btn.complete')
        .not('.flash')
        .not('[disabled="disabled"]');
    assert.isTrue($elt.length > 0);
    $elt.click();
}

describe('CounselingSessionApp', function() {

    before(function() {
        var elt = jQuery('div.counseling-session');
        assert.isDefined(elt);
        jQuery(elt).html('');

        module.DentalVisitApp.initialize();
    });

    describe('interaction', function() {
        it('step 1: initialized', function() {
            assert.equal(jQuery('.btn-step').length, 5);
            assert.equal(jQuery('.btn-print').length, 1);

            assert.equal(jQuery('h3.step-1:visible').length, 1);
            assert.isTrue(
                jQuery('a[href="#one"]').hasClass('btn-primary'));
            assert.isTrue(
                jQuery('a[href="#two"]').hasClass('flash-next'));
            assert.equal(
                jQuery('a[href="#three"]').attr('disabled'), 'disabled');
            assert.equal(
                jQuery('a[href="#four"]').attr('disabled'), 'disabled');
            assert.equal(
                jQuery('a[href="#five"]').attr('disabled'), 'disabled');

            var $elt = jQuery('a[href="#two"]').not('[disabled="disabled"]');
            $elt.click();
        });

        it('step 2: initialized', function() {
            assert.equal(jQuery('h3.step-2:visible').length, 1);
            assert.isFalse(
                jQuery('a[href="#one"]').hasClass('btn-primary'));
            assert.isTrue(
                jQuery('a[href="#two"]').hasClass('btn-primary'));
            assert.equal(
                jQuery('a[href="#three"]').attr('disabled'), 'disabled');
            assert.equal(
                jQuery('a[href="#four"]').attr('disabled'), 'disabled');
            assert.equal(
                jQuery('a[href="#five"]').attr('disabled'), 'disabled');

            assert(jQuery('.available_time').is(':visible'));
            assert(jQuery('.patient-chart').is(':visible'));

            assert.equal(jQuery('.panel').length, 9);
        });

        it('step 2: open discussion', function(done) {
            this.timeout(6000);
            openDiscussion(done);
        });

        it('step 2: close discussion', function() {
            closeDiscussion();

            var $elt = jQuery('a[href="#three"]').not('[disabled="disabled"]');
            assert.isTrue($elt.length > 0, 'Active Step 3 button exists');
            assert.isTrue($elt.hasClass('flash-next'), 'Step 3 is blinking');

            assert(jQuery('.patient-chart-text').html().length > 0);

            // move on to step 3
            $elt.click();
        });
        it('step 3: initialized', function() {
            var $btn = jQuery('a[href="#two"]');
            assert.isFalse($btn.hasClass('btn-primary'), 'Step3 is primary');

            $btn = jQuery('a[href="#three"]');
            assert.isFalse($btn.hasClass('flash-next'), 'Step3 not blinking');
            assert.isFalse($btn.hasClass('btn-info'), 'Step3 is primary');
            assert.isTrue($btn.hasClass('btn-primary'), 'Step3 is primary');

            assert.equal(jQuery('h3.step-3:visible').length, 1);
        });

        it('step 3: open discussion', function(done) {
            this.timeout(6000);
            openDiscussion(done);
        });

        it('step 3: close discussion', function() {
            closeDiscussion();

            var $elt = jQuery('a[href="#four"]').not('[disabled="disabled"]');
            assert.isTrue($elt.length > 0, 'Active Step 4 button exists');
            assert.isTrue($elt.hasClass('flash-next'), 'Step 4 is blinking');

            // move on to step 3
            $elt.click();
        });

        it('step 4: initialized', function() {
            var $btn = jQuery('a[href="#three"]');
            assert.isFalse($btn.hasClass('btn-primary'), 'Step4 is primary');

            $btn = jQuery('a[href="#four"]');
            assert.isFalse($btn.hasClass('flash-next'), 'Step4 not blinking');
            assert.isFalse($btn.hasClass('btn-info'), 'Step4 is primary');
            assert.isTrue($btn.hasClass('btn-primary'), 'Step4 is primary');

            assert.equal(jQuery('h3.step-4:visible').length, 1);
        });

        it('step 4: fill out form', function() {
            var $elt = jQuery('.btn-refer');
            $elt.click();
            assert.equal(jQuery('.has-error').length, 5, 'Required fields');

            jQuery('[name="theDate"]').val('01/01/2016');
            jQuery('[name="to"]').val('John Smith');
            jQuery('[name="from"]').val('Jane Doe');
            jQuery('[name="reason"]').val('poor nutrition');
            jQuery('[name="medicalHistory"]').val('some medical history');
            $elt.click();

            assert.equal(jQuery('.has-error').length, 0, 'Required fields');
            assert.isTrue(jQuery('.alert-success').is(':visible'));

            $elt = jQuery('a[href="#five"]').not('[disabled="disabled"]');
            assert.isTrue($elt.length > 0, 'Active Step 5 button exists');
            assert.isTrue($elt.hasClass('flash-next'), 'Step 5 is blinking');

            // move on to step 5
            $elt.click();
        });

        it('step 5: initialized', function() {
            var $btn = jQuery('a[href="#four"]');
            assert.isFalse($btn.hasClass('btn-primary'), 'Step5 is primary');

            $btn = jQuery('a[href="#five"]');
            assert.isFalse($btn.hasClass('flash-next'), 'Step5 not blinking');
            assert.isFalse($btn.hasClass('btn-info'), 'Step5 is primary');
            assert.isTrue($btn.hasClass('btn-primary'), 'Step5 is primary');

            assert.equal(jQuery('h3.step-5:visible').length, 1);
        });
    });
});
