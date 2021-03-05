// ==UserScript==
// @name         Streamlabs Manual Alerts
// @namespace    Nikolai
// @version      0.5
// @description  Adds a smart button to trigger Streamlabs alerts manually
// @author       Nikolai
// @icon         https://streamlabs.com/images/favicons/favicon.svg
// @match        https://streamlabs.com/widgets/frame/alertbox/*
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min.js
// @grant        none
// ==/UserScript==

/* global jQuery, $ */

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
                    console.log($target);
                }
            }
        });
    });

    observer.observe($div[0], {
        attributes: true
    });
});