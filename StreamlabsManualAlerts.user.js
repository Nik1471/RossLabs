// ==UserScript==
// @name         Streamlabs Manual Alerts
// @namespace    Nikolai
// @version      0.5
// @description  Adds a smart button to trigger Streamlabs alerts manually
// @author       Nikolai
// @icon         https://streamlabs.com/images/favicons/favicon.svg
// @match        https://streamlabs.com/widgets/frame/alertbox/*
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min.js
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

/* global jQuery, $ */

var alertUrl = 'https://cdn.twitchalerts.com/twitch-bits/sounds/bits.ogg'
var alertAudio = new Audio(alertUrl);

var database = GM_getValue('database');
if (!database) {
    database = [];
    GM_setValue('database', database);
}

this.$ = jQuery.noConflict(true);

$(function() {
    var $div = $('#widget');
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'class') {
                var $target = $(mutation.target);
                var attr = $target.prop(mutation.attributeName);
                if (attr === 'widget-AlertBox') {
                    console.log('Arrived! ' + attr);

                    var message = JSON.stringify($target.find('#wrap').html());
                    var time = new Date().getTime();

                    database.push({
                        "t": time,
                        "m": message,
                        "s": 0
                    });

                    GM_setValue('database', database);
                    //alertAudio.play();
                }
            }
        });
    });

    observer.observe($div[0], {
        attributes: true
    });
});