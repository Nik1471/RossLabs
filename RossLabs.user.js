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
            '#widget { right: 14vw !important; }',
            '#alert-text { vertical-align: bottom !important; }',
            '.hidden { opacity: 1 !important; }',
            '.animated { animation-duration: 0s !important; -webkit-animation-duration: 0s !important; }',

            '#wrap-copy { position: relative; height: 100%; width: 100%; display: flex; align-items: center; justify-content: center; }',
            '.wrap-block { position: fixed; top: 0; bottom: 0; right: 0; z-index: 9999; width: 14vw; padding: 1.3vw; box-sizing: border-box; display: flex; align-items: center; justify-content: flex-end; flex-direction: column; }',
            '#alert-btn { width: 100%; height: 8vw; }',
            '.alert-cnt { width: 100%; padding: 0.6vw; text-align: center; background-color: rgb(239 239 239 / 20%); border: 1px solid #767676; box-sizing: border-box; margin-bottom: 2vw; font-size: 2.4vw; color: #9e9e9e }',
            '#msg-cur, #msg-all { color: white; }',
            '#msg-all { font-weight: 600; }'
        ].join('\n');
        GM_addStyle(cssCode);

        var database = GM_getValue('database');
        if (!database) {
            database = [];
            GM_setValue('database', database);
        }

        var blockHtml = '<div class="wrap-block">' +
            '<div class="alert-cnt"><span id="msg-cur">0</span> / <span id="msg-all">0</span></div>' +
            '<button id="alert-btn">Next</button>' +
            '</div>';
        var $widget = $('#widget');
        $widget.after(blockHtml);
        $('#wrap').after('<div id="wrap-copy">');

        var updateCount = function() {
            if (database.length > 0) {
                $('#msg-all').text(database.length);
            }
        }

        updateCount();

        var updateCur = function() {
            $('#msg-cur').text(lastIndex);
        }

        var lastIndex = GM_getValue('last_index');
        if (lastIndex) {
            updateCur();
        }

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

                        updateCount();

                        GM_setValue('database', database);
                    }
                }
            });
        });

        observer.observe($widget[0], {
            attributes: true
        });

        $('#alert-btn').click(function() {
            var $wrapCopy = $('#wrap-copy');
            var next = _.findIndex(database, ['s', 0]);
            if (next !== -1) {
                alertAudio.pause();
                alertAudio.currentTime = 0;
                alertAudio.play();

                $wrapCopy.empty();
                $wrapCopy.append(database[next].m).hide().fadeIn();
                database[next].s = 1;

                lastIndex = next + 1;
                updateCur();

                GM_setValue('database', database);
                GM_setValue('last_index', lastIndex);
            }
        });
    }
});