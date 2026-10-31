'use strict';

// Light / dark switch.
//
// The attribute itself is set by the inline script in <head>, before the page
// paints, so there is no flash. This file only wires the button up and keeps
// the icon in step.
//
// A click is remembered in localStorage. Until someone clicks, the site simply
// follows the operating system and keeps following it if that changes.

(function () {
    var STORE = 'theme';
    var root = document.documentElement;

    function current() {
        return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    }

    function paintButtons() {
        var dark = current() === 'dark';
        var buttons = document.querySelectorAll('.js-theme-toggle');
        Array.prototype.forEach.call(buttons, function (btn) {
            var icon = btn.querySelector('.theme-toggle__icon');
            if (icon) {
                icon.classList.remove('mdi-weather-night', 'mdi-white-balance-sunny');
                icon.classList.add(dark ? 'mdi-white-balance-sunny' : 'mdi-weather-night');
            }
            btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
            btn.setAttribute('title', dark ? 'Switch to light mode' : 'Switch to dark mode');
        });
    }

    function apply(theme, remember) {
        root.setAttribute('data-theme', theme);
        if (remember) {
            try { localStorage.setItem(STORE, theme); } catch (e) {}
        }
        paintButtons();
    }

    function wire() {
        var buttons = document.querySelectorAll('.js-theme-toggle');
        Array.prototype.forEach.call(buttons, function (btn) {
            btn.addEventListener('click', function () {
                apply(current() === 'dark' ? 'light' : 'dark', true);
            });
        });
        paintButtons();
    }

    // Follow the system only while the visitor has not chosen for themselves.
    if (window.matchMedia) {
        var query = window.matchMedia('(prefers-color-scheme: dark)');
        var onChange = function (e) {
            var saved = null;
            try { saved = localStorage.getItem(STORE); } catch (err) {}
            if (!saved) apply(e.matches ? 'dark' : 'light', false);
        };
        if (query.addEventListener) query.addEventListener('change', onChange);
        else if (query.addListener) query.addListener(onChange);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', wire);
    } else {
        wire();
    }
})();
