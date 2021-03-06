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

            '#wrap-copy { position: relative; height: 100%; width: 100%; display: flex; align-items: flex-end; justify-content: center; }',
            '.wrap-block { position: fixed; top: 0; bottom: 0; right: 0; z-index: 9999; width: 14vw; padding: 1.3vw; box-sizing: border-box; display: flex; align-items: center; justify-content: flex-end; flex-direction: column; }',
            '.wrap-button { width: 100%; position: relative; }',
            '#alert-btn { width: 100%; height: 8vw; }',
            '.wrap-button > .my-button { position: absolute; top: 1.6vw; left: -5.5vw; }',

            '.alert-counter { width: 100%; padding: 0.6vw; text-align: center; background-color: rgb(239 239 239 / 20%); border: 1px solid #767676; box-sizing: border-box; margin-bottom: 2vw; font-size: 2.4vw; color: #9e9e9e }',
            '#message-curr, #message-all { color: white; }',
            '#message-all { font-weight: 600; }',

            '.my-button { font-size: 4.5vw; line-height: 1; color: white; background-color: transparent; border: 0; padding: 0; opacity: 0; z-index: 10; }',
            '.my-button:hover { opacity: 0.9; }',
            '.my-button:active { opacity: 0.6; }',
            '.my-button:focus { outline: 0; }',

            '.alert-nav { width: 100%; margin-bottom: 1vw; }',
            '.alert-nav > .my-button { width: 50%; }'
        ].join('\n');
        GM_addStyle(cssCode);

        var database = GM_getValue('database');
        if (!database) {
            database = [];
            GM_setValue('database', database);
        }

        var blockHtml = '<div class="wrap-block">' +
            '<div class="alert-nav"><button id="prev-button" class="my-button">🡄</button><button id="next-button" class="my-button">🡆</button></div>' +
            '<div class="alert-counter"><span id="message-curr">0</span> / <span id="message-all">0</span></div>' +
            '<div class="wrap-button"><button id="alert-btn">Next</button><button id="toggle-button" class="my-button">👁</button></div>' +
            '</div>';
        var $widget = $('#widget');
        $widget.after(blockHtml);
        $('#wrap').after('<div id="wrap-copy">');
        var $wrapCopy = $('#wrap-copy');

        var updateCount = function() {
            if (database.length > 0) {
                $('#message-all').text(database.length);
            }
        }

        updateCount();

        var updateCurr = function() {
            $('#message-curr').text(lastIndex);
        }

        var lastIndex = GM_getValue('last_index');
        if (lastIndex) {
            updateCurr();
        }

        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.attributeName === 'class') {
                    var $target = $(mutation.target);
                    var attr = $target.prop(mutation.attributeName);
                    if (attr === 'widget-AlertBox') {
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

        var showMessage = function(ind) {
            $wrapCopy.empty();
            $wrapCopy.append(database[ind].m).hide(0).fadeIn('fast');
            lastIndex = ind + 1;
            updateCurr();
            GM_setValue('last_index', lastIndex);
        }

        $('#alert-btn').click(function() {
            var next = _.findIndex(database, ['s', 0]);
            if (next !== -1) {
                alertAudio.pause();
                alertAudio.currentTime = 0;
                alertAudio.play();

                showMessage(next);

                database[next].s = 1;
                GM_setValue('database', database);
            }
        });

        $('#prev-button').click(function() {
            if (lastIndex) {
                if ($wrapCopy.children().length === 0) {
                    showMessage(lastIndex - 1);
                } else if (lastIndex > 1) {
                    showMessage(lastIndex - 2);
                }
            }
        });

        $('#next-button').click(function() {
            if (lastIndex) {
                if ($wrapCopy.children().length === 0) {
                    showMessage(lastIndex - 1);
                } else if (database[lastIndex] && database[lastIndex].s === 1) {
                    showMessage(lastIndex);
                }
            }
        });

        $('#toggle-button').click(function() {
            $wrapCopy.find('#alert-text-wrap').toggle();
        });
    }
});