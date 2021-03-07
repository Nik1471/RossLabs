// ==UserScript==
// @name         RossmannLabs
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

var alertUrl = 'https://cdn.twitchalerts.com/twitch-bits/sounds/bits.ogg';
var ratesUrl = 'https://www.floatrates.com/daily/usd.json';
var logoUrl = 'https://raw.githubusercontent.com/Nik1471/RossmannLabs/master/rossmann-logo.png';

this.$ = jQuery.noConflict(true);

$(function () {
    if ($('#shield').length) {
        var cssCodeMain = [
            '#shield, #boombox, #gif, #attachments { display: none !important; }'
        ].join('\n');
        GM_addStyle(cssCodeMain);
    } else {
        var alertAudio = new Audio(alertUrl);

        var cssCode = [
            '#wrap { display: none !important; }',
            '#widget { right: 15vw !important; animation-duration: 0s !important; -webkit-animation-duration: 0s !important; }',
            '#alert-text { vertical-align: bottom !important; }',
            '.hidden { opacity: 1 !important; }',

            '.my-button { font-size: 4.5vw; line-height: 1; color: white; background-color: transparent; border: 0; padding: 0; opacity: 0; z-index: 10; transition: opacity 0.2s; }',
            '.my-button:hover { opacity: 0.9; }',
            '.my-button:active { opacity: 0.6; }',
            '.my-button:focus { outline: 0; }',

            '#wrap-copy { position: relative; height: 100%; width: 100%; display: flex; align-items: flex-end; justify-content: center; }',
            '.wrap-block { position: fixed; top: 0; bottom: 0; right: 0; z-index: 9999; width: 15vw; padding: 0 2vw 2vw 0; box-sizing: border-box; display: flex; align-items: center; justify-content: flex-end; flex-direction: column; }',
            '.wrap-button { width: 100%; position: relative; text-align: center; }',
            '.wrap-button > .my-button { position: absolute; top: -5.5vw; left: -5.5vw; }',

            '.alert-counter, .alert-timer { width: 100%; padding: 0.35vw; text-align: center; background-color: rgb(239 239 239 / 20%); border: 1px solid #424242; box-sizing: border-box; font-size: 2.4vw; }',
            '.alert-counter { color: #bdbdbd; position: relative; margin-bottom: 1vw; }',
            '.alert-counter > .my-button { position: absolute; top: -0.1vw; left: -5.5vw; font-size: 3.7vw; }',
            '.alert-counter.pulse { -webkit-animation: pulse 2s; animation: pulse 2s; }',

            '.alert-timer { margin-bottom: 1.5vw; color: #e0e0e0; font-family: Consolas, monospace; font-size: 2.7vw; padding: 0.1vw; }',
            '#message-curr, #message-all { color: white; opacity: 0.8; }',
            '#message-all { font-weight: 600; opacity: 1; }',

            '.alert-nav { width: 100%; margin-bottom: 0.5vw; z-index: 100; }',
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
            '.btn-primary { background-color: rgba(255,0,0,0.3); }',

            '.new { background-color: rgba(50, 195, 166, 0.45); }',
            '.plus-sign { position: absolute; top: -6vw; left: calc(50% - 4vw); width: 8vw; font-size: 8vw; line-height: 0.7; color: rgb(50, 195, 166); display: none; }',
            '.plus-sign.animated { animation-duration: 2s; -webkit-animation-duration: 2s; }',

            '#converted { text-align: center; opacity: 0.8; font-size: 170% !important; margin-bottom: 0.5vw; }',
            '.dollars { color: rgb(50, 195, 166); }',

            '.my-logo { width: 90%; height: auto; }',
            '.my-logo:hover { cursor: pointer; opacity: 0.9 }',
            '@keyframes spin { 100% { transform: rotate(360deg); -webkit-transform: rotate(360deg);  } }',
            '.spin { animation: spin 0.5s ease-in-out; -webkit-animation: spin 0.5s ease-in-out; }'
        ].join('\n');
        GM_addStyle(cssCode);

        var database = GM_getValue('database');
        if (!database) {
            database = [];
            GM_setValue('database', database);
        }

        var blockHtml = '<div class="wrap-block">' +
            '<div class="alert-nav"><button id="prev-button" class="my-button">🡄</button><button id="next-button" class="my-button">🡆</button></div>' +
            '<div class="alert-counter"><span id="message-curr">0</span> / <span id="message-all">0</span><button id="erase-button" class="my-button" data-micromodal-trigger="modal-1">⌦</button><div class="plus-sign animated">✉</div></div>' +
            '<div id="alert-timer" class="alert-timer">00:00</div>' +
            '<div class="wrap-button"><img id="alert-button" class="my-logo" src="' + logoUrl + '"><button id="toggle-button" class="my-button">👁</button></div>' +
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
        var $counter = $('.alert-counter');
        var $msgAll = $('#message-all');
        var $plusSign = $('.plus-sign');

        var updateCount = function () {
            if (database.length > 0) {
                $msgAll.text(database.length);
            }
        };

        updateCount();

        var updateCurr = function () {
            $('#message-curr').text(lastIndex);
        };

        var lastIndex = GM_getValue('last_index');
        if (lastIndex) {
            updateCurr();
        }

        var observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.attributeName === 'class') {
                    var $target = $(mutation.target);
                    var attr = $target.prop(mutation.attributeName);
                    if (attr === 'widget-AlertBox') {
                        var message = $target.find('#wrap').html();
                        var time = new Date().getTime();

                        database.push({
                            't': time,
                            'm': message,
                            's': 0
                        });

                        updateCount();

                        $counter.addClass('new');
                        $plusSign.show().addClass('fadeOutUp');
                        setTimeout(function () {
                            $plusSign.removeClass('fadeOutUp').hide();
                        }, 2000);

                        GM_setValue('database', database);
                    }
                }
            });
        });

        observer.observe($widget[0], {
            attributes: true
        });

        var currRates = {};
        $.getJSON(ratesUrl, function (data) {
            if (data) {
                currRates = data;
            }
        });

        var dollarCodes = {'a': 'aud', 'ar': 'ars', 'au': 'aud', 'b': 'bnd', 'bd': 'bmd', 'bds': 'bbd', 'bs': 'bsd', 'bz': 'bzd', 'c': 'cad', 'ca': 'cad', 'cl': 'clp', 'col': 'cop', 'cu': 'cup', 'cuc': 'cuc', 'ec': 'xcd', 'fj': 'fjd', 'g': 'gyd', 'gy': 'gyd', 'hk': 'hkd', 'j': 'jmd', 'jm': 'jmd', 'l': 'lrd', 'ld': 'lrd', 'mop': 'mop', 'mx': 'mxn', 'n': 'nad', 'nt': 'twd', 'nz': 'nzd', 'r': 'brl', 'rd': 'dop', 's': 'sgd', 'sg': 'sgd', 'si': 'sbd', 'sr': 'srd', 't': 'top', 'tt': 'ttd', 'ws': 'wst'};

        var currSymbols = [['€', 'eur'], ['£', 'gbp'], ['₹', 'inr'], ['₽', 'rub'], ['₩', 'krw'], ['¥', 'jpy'], ['₪', 'ils'], ['kč', 'czk'], ['฿', 'thb'], ['₺', 'try'], ['zł', 'pln'], ['₱', 'php'], ['৳', 'bdt'], ['₡', 'crc'], ['₮', 'mnt'], ['₫', 'vnd'], ['₸', 'kzt'], ['₭', 'lak'], ['₦', 'ngn'], ['֏', 'amd'], ['₲', 'pyg'], ['₴', 'uah'], ['₾', 'gel'], ['лв', 'bgn'], ['₼', 'azn'], ['៛', 'khr']];

        var parseAmount = function (amount) {
            var sumCode, sumValue, parsed, abbr;

            if ($.isEmptyObject(currRates)) {
                return false;
            }

            amount = amount.replace(',', '');

            if (/^\$[\d.]+$/.test(amount)) {
                return false;
            }

            if (amount.indexOf('$') !== -1) {
                parsed = amount.split('$');
                abbr = parsed[0].toLowerCase();
                if (dollarCodes.hasOwnProperty(abbr)) {
                    sumCode = dollarCodes[abbr];
                    sumValue = parsed[1] * 1;
                } else {
                    return false;
                }
            } else if (/^[A-Za-z]{3} [\d.]+$/.test(amount)) {
                parsed = amount.split(' ');
                sumCode = parsed[0].toLowerCase();
                sumValue = parsed[1] * 1;
            } else {
                for (var i = 0; i < currSymbols.length; i++) {
                    var sign = currSymbols[i][0];
                    if (amount.indexOf(sign) !== -1) {
                        sumCode = currSymbols[i][1];
                        sumValue = amount.split(sign)[1] * 1;
                        break;
                    }
                }
            }

            if (sumCode && sumValue) {
                if (currRates.hasOwnProperty(sumCode)) {
                    var rate = currRates[sumCode].inverseRate;
                    var name = currRates[sumCode].name.trim();
                    var converted = _.round(sumValue * rate, 2);

                    return ['$' + converted, name];
                }
            }

            return false;
        };

        var showMessage = function (ind, fast) {
            var speed = 400;
            if (fast) {
                speed = 0;
            }
            timeago.cancel();
            $wrapCopy.empty();

            $wrapCopy.append(database[ind].m).hide(0).fadeIn(speed);
            $wrapCopy.find('#alert-message').append('<time class="time" datetime="' + database[ind].t + '">');
            timeago.render(document.querySelectorAll('.time'));

            var amount = $wrapCopy.find('[data-token="amount"]').text();
            var parsed = parseAmount(amount);
            if (parsed) {
                var msgStyle = $wrapCopy.find('#alert-message').attr('style');
                var amountHtml = '<div id="converted">[ ' + parsed[1] + ', <span class="dollars">' + parsed[0] + '</span> ]</div>';
                $wrapCopy.find('#alert-message').after(amountHtml);
                $('#converted').attr('style', msgStyle);
            }

            lastIndex = ind + 1;
            updateCurr();
            GM_setValue('last_index', lastIndex);

            $timer.timer('remove').text('00:00');

            if (lastIndex === database.length) {
                $counter.removeClass('new');
            }
        };

        $('#alert-button').click(function () {
            var next = _.findIndex(database, ['s', 0]);
            var $this = $(this);
            if (next !== -1) {
                alertAudio.pause();
                alertAudio.currentTime = 0;
                alertAudio.play();

                $this.addClass('spin');
                setTimeout(function () {
                    $this.removeClass('spin');
                }, 500);

                showMessage(next);

                database[next].s = 1;
                GM_setValue('database', database);

                $timer.timer('remove').timer({format: '%M:%S'});
            }
        });

        $('#prev-button').click(function () {
            if (lastIndex) {
                if ($wrapCopy.children().length === 0) {
                    showMessage(lastIndex - 1, true);
                } else if (lastIndex > 1) {
                    showMessage(lastIndex - 2, true);
                }
            }
        });

        $('#next-button').click(function () {
            if (lastIndex) {
                if ($wrapCopy.children().length === 0) {
                    showMessage(lastIndex - 1, true);
                } else if (database[lastIndex] && database[lastIndex].s === 1) {
                    showMessage(lastIndex, true);
                }
            }
        });

        $('#toggle-button').click(function () {
            $wrapCopy.find('#alert-text-wrap').toggle();
            $timer.timer('remove').text('00:00');
        });

        MicroModal.init();

        var updateValues = function (all) {
            updateCurr();
            GM_setValue('last_index', lastIndex);

            $wrapCopy.empty();
            $msgAll.text(all);
            $timer.timer('remove').text('00:00');
        };

        $('#remove-all').click(function () {
            database = [];
            GM_setValue('database', database);

            lastIndex = 0;
            updateValues(0);
            $counter.removeClass('new');

            MicroModal.close('modal-1');
        });

        $('#remove-old').click(function () {
            if (database.length > 0) {
                var today = new Date().setHours(0, 0, 0, 0);
                database = _.filter(database, function (o) {
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