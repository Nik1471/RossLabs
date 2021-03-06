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
// @require      https://cdnjs.cloudflare.com/ajax/libs/timeago.js/4.0.2/timeago.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/micromodal/0.4.6/micromodal.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/timer.jquery/0.9.0/timer.jquery.min.js
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

/* global jQuery, $, _, timeago, MicroModal */

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

            '.alert-counter, .alert-timer { width: 100%; padding: 0.6vw; text-align: center; background-color: rgb(239 239 239 / 20%); border: 1px solid #767676; box-sizing: border-box; font-size: 2.4vw; }',
            '.alert-counter { color: #9e9e9e; position: relative; margin-bottom: 1vw; }',
            '.alert-timer { margin-bottom: 2vw; color: #e0e0e0; }',
            '#message-curr, #message-all { color: white; opacity: 0.8; }',
            '#message-all { font-weight: 600; opacity: 1; }',
            '.alert-counter > .my-button { position: absolute; top: 0.1vw; left: -5.5vw; font-size: 3.7vw; }',
            '.alert-timer { font-family: Consolas, monospace; }',

            '.my-button { font-size: 4.5vw; line-height: 1; color: white; background-color: transparent; border: 0; padding: 0; opacity: 0; z-index: 10; transition: opacity 0.2s; }',
            '.my-button:hover { opacity: 0.9; }',
            '.my-button:active { opacity: 0.6; }',
            '.my-button:focus { outline: 0; }',

            '.alert-nav { width: 100%; margin-bottom: 0.5vw; }',
            '.alert-nav > .my-button { width: 50%; }',

            '.time { margin-left: 0.5em; font-size: 70%; opacity: 0.7; }',

            '.modal { display: none; position: fixed; z-index: 10000; }',
            '.modal.is-open { display: block; }',
            '.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); display: flex; justify-content: center; align-items: center; }',
            '.modal-container { background-color: #fff; padding: 1.1vw; max-width: 30vw; max-height: 100vh; border-radius: 1vw; overflow-y: auto; box-sizing: border-box; }',
            '.modal-header { display: flex; justify-content: space-between; align-items: center; }',
            '.modal-title { margin-top: 0; margin-bottom: 0; font-weight: bold; line-height: 1.25; color: #00449e; box-sizing: border-box; font-size: 1.7vw; }',
            '.modal-close { background: transparent; border: 0; font-size: 1.7vw; margin-left: 1vw; }',
            '.modal-header .modal-close::before { content: "✕"; font-weight: bold; }',
            '.modal-header .modal-close:hover, .modal-btn:hover { opacity: 0.7; }',
            '.modal-footer { margin-top: 1vw; }',
            '.modal-btn { margin-right: 1vw; padding: 0.5vw 1vw; background-color: rgba(255,0,0,0.1); border: 1px solid #9e9e9e; font-size: 1.3vw; }',
            '.btn-primary { background-color: rgba(255,0,0,0.3); }'
        ].join('\n');
        GM_addStyle(cssCode);

        var database = GM_getValue('database');
        if (!database) {
            database = [];
            GM_setValue('database', database);
        }

        var blockHtml = '<div class="wrap-block">' +
            '<div class="alert-nav"><button id="prev-button" class="my-button">🡄</button><button id="next-button" class="my-button">🡆</button></div>' +
            '<div class="alert-counter"><span id="message-curr">0</span> / <span id="message-all">0</span><button id="erase-button" class="my-button" data-micromodal-trigger="modal-1">⌦</div>' +
            '<div id="alert-timer" class="alert-timer">00:00</div>' +
            '<div class="wrap-button"><button id="alert-btn">Next</button><button id="toggle-button" class="my-button">👁</button></div>' +
            '</div>';

        var modalHtml = '<div id="modal-1" class="modal" aria-hidden="true">' +
            '<div tabindex="-1" class="modal-overlay" data-micromodal-close>' +
            '<div class="modal-container" role="dialog" aria-modal="true" aria-labelledby="modal-1-title">' +
            '<header class="modal-header"><h2 id="modal-1-title" class="modal-title">Remove saved messages</h2>' +
            '<button class="modal-close" aria-label="Close" data-micromodal-close></button></header>' +
            '<footer class="modal-footer"><button id="remove-old" class="modal-btn">All except today</button>' +
            '<button id="remove-all" class="modal-btn btn-primary">All messages</button></footer>' +
            '</div></div></div>';

        var $widget = $('#widget');
        $widget.after(blockHtml).before(modalHtml);
        $('#wrap').after('<div id="wrap-copy">');

        var $wrapCopy = $('#wrap-copy');
        var $timer = $('#alert-timer');
        var $msgAll = $('#message-all');

        var updateCount = function() {
            if (database.length > 0) {
                $msgAll.text(database.length);
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

        var showMessage = function(ind, fast) {
            var speed = 'fast';
            if (fast) {
                speed = 0;
            }
            timeago.cancel();
            $wrapCopy.empty();
            $wrapCopy.append(database[ind].m).hide(0).fadeIn(speed);
            $wrapCopy.find('#alert-message').append('<time class="time" datetime="' + database[ind].t + '">');
            timeago.render(document.querySelectorAll('.time'));
            lastIndex = ind + 1;
            updateCurr();
            GM_setValue('last_index', lastIndex);

            $timer.timer('pause');
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

                $timer.timer('remove');
                $timer.timer({ format: '%M:%S' });
            }
        });

        $('#prev-button').click(function() {
            if (lastIndex) {
                if ($wrapCopy.children().length === 0) {
                    showMessage(lastIndex - 1, true);
                } else if (lastIndex > 1) {
                    showMessage(lastIndex - 2, true);
                }
            }
        });

        $('#next-button').click(function() {
            if (lastIndex) {
                if ($wrapCopy.children().length === 0) {
                    showMessage(lastIndex - 1, true);
                } else if (database[lastIndex] && database[lastIndex].s === 1) {
                    showMessage(lastIndex, true);
                }
            }
        });

        $('#toggle-button').click(function() {
            $wrapCopy.find('#alert-text-wrap').toggle();
            $timer.timer('pause');
        });

        MicroModal.init();

        var updateValues = function(all) {
            updateCurr();
            GM_setValue('last_index', lastIndex);

            $wrapCopy.empty();
            $msgAll.text(all);
            $timer.timer('remove');
            $timer.text('00:00');
        }

        $('#remove-all').click(function() {
            database = [];
            GM_setValue('database', database);

            lastIndex = 0;
            updateValues(0);

            MicroModal.close('modal-1');
        });

        $('#remove-old').click(function() {
            if (database.length > 0) {
                var today = new Date().setHours(0, 0, 0, 0);
                database = _.filter(database, function(o) {
                    return (o.t >= today) || (o.s === 0)
                });
                GM_setValue('database', database);

                if (database.length) {
                    lastIndex = 1;
                } else {
                    lastIndex = 0;
                }

                updateValues(database.length);
            }

            MicroModal.close('modal-1');
        });
    }
});