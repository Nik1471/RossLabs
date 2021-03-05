// ==UserScript==
// @name         Streamlabs Manual Alerts
// @namespace    RossmannGroup
// @version      0.5
// @description  Adds a smart button to trigger Streamlabs alerts manually
// @author       Nikolai
// @icon         https://streamlabs.com/images/favicons/favicon.svg
// @match        https://streamlabs.com/alert-box/v*
// @match        https://streamlabs.com/widgets/frame/alertbox/*
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

/* global jQuery, $ */

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
            '#widget { right: 150px !important; }',
            '#wrap-btn { position: fixed; top: 0; bottom: 0; right: 0; z-index: 9999; width: 150px; display: flex; align-items: center; justify-content: center; }',
            '.alert-btn { width: 100px; height: 100px; }'
        ].join('\n');
        GM_addStyle(cssCode);

        var database = GM_getValue('database');
        if (!database) {
            database = [];
            GM_setValue('database', database);
        }

        var buttonHtml = '<div id="wrap-btn"><button class="alert-btn">Next</button></div>';
        var $widget = $('#widget');
        $widget.after(buttonHtml);

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
    }
});