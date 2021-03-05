// ==UserScript==
// @name         RossLabs
// @namespace    Nik1471
// @version      0.5
// @description  Streamlabs Alerts userscript for Louis Rossmann
// @author       Nik1471
// @icon         https://streamlabs.com/images/favicons/favicon.svg
// @match        https://streamlabs.com/alert-box/v*
// @match        https://streamlabs.com/widgets/frame/alertbox/*
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

/* global jQuery, $, _ */

var alertUrl = 'https://cdn.twitchalerts.com/twitch-bits/sounds/bits.ogg'

this.$ = jQuery.noConflict(true);

$(function() {
    if ($('#shield').length) {
        var cssCodeMain = [
            '#shield, #boombox, #gif, #attachments { display: none !important; }'
        ].join('\n');
        GM_addStyle(cssCodeMain);
    } else {
        var alertAudio = new Audio(alertUrl);

        var cssCode = [
            '#wrap { display: none !important; }',
            '#wrap-copy { position: relative; height: 100%; width: 100%; display: flex; align-items: center; justify-content: center; }',
            '#widget { right: 150px !important; }',
            '#wrap-btn { position: fixed; top: 0; bottom: 0; right: 0; z-index: 9999; width: 150px; display: flex; align-items: center; justify-content: center; }',
            '.hidden { opacity: 1 !important; }',
            '.animated { animation-duration: 0s !important; -webkit-animation-duration: 0s !important; }',
            '.alert-btn { width: 100px; height: 100px; }'
        ].join('\n');
        GM_addStyle(cssCode);

        var database = GM_getValue('database');
        if (!database) {
            database = [];
            GM_setValue('database', database);
        }

        var buttonHtml = '<div id="wrap-btn"><button id="alert-btn" class="alert-btn">Next</button></div>';
        var $widget = $('#widget');
        $widget.after(buttonHtml);
        $('#wrap').after('<div id="wrap-copy">');

        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.attributeName === 'class') {
                    var $target = $(mutation.target);
                    var attr = $target.prop(mutation.attributeName);
                    if (attr === 'widget-AlertBox') {
                        console.log('Arrived! ' + attr);

                        var message = $target.find('#wrap').html();
                        var time = new Date().getTime();

                        database.push({
                            "t": time,
                            "m": message,
                            "s": 0
                        });

                        GM_setValue('database', database);

                        console.log($('#wrap'));

                        //alertAudio.play();
                    }
                }
            });
        });

        observer.observe($widget[0], {
            attributes: true
        });

        $('#alert-btn').click(function() {
            var $wrapCopy = $('#wrap-copy');
            $wrapCopy.empty();
            var next = _.findIndex(database, ['s', 0]);
            if (next !== -1) {
                $wrapCopy.append(database[next].m);
                database[next].s = 1;
                GM_setValue('database', database);
            }
        });
    }
});