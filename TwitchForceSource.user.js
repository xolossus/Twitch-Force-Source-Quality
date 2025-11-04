// ==UserScript==
// @name         Twitch - Force Source Quality (URL change only)
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Forces Twitch stream to Source (or optionally 1080p60) only when the URL changes (no repeated opening of settings). Also works when switching between streams on the sidebar.
// @author       xolossus
// @match        https://www.twitch.tv/*
// @match        https://player.twitch.tv/*
// @grant        none
// @run-at       document-idle
// @license      Unlicensed
// ==/UserScript==

(function () {
    'use strict';

    /***************** CONFIG *****************/
    // Default: prefer Source quality (1080p/Source/chunked)
    const PREFERRED_QUALITY_LABELS = ["Source", "1080p60", "1080p", "chunked"];

    // --- TWEAK OPTION ---
    // If you want to force only 1080p60, comment the line above and uncomment the line below:
    // const PREFERRED_QUALITY_LABELS = ["1080p60"];

    // Enable console logs for debugging
    const DEBUG = false;
    /******************************************/

    function log(...args) { if (DEBUG) console.log("[TwitchForceSource]", ...args); }

    // Helper: wait for an element to appear
    function waitFor(selector, timeout = 15000) {
        return new Promise((resolve, reject) => {
            const el = document.querySelector(selector);
            if (el) return resolve(el);
            const obs = new MutationObserver(() => {
                const e = document.querySelector(selector);
                if (e) {
                    obs.disconnect();
                    resolve(e);
                }
            });
            obs.observe(document.body, { childList: true, subtree: true });
            if (timeout > 0)
            {
                setTimeout(() => {
                obs.disconnect();
                reject(new Error("timeout waiting for " + selector));
            }, timeout);
            }
        });
    }

    // Detect the current selected quality
    function getSelectedQualityText() {
        const selAria = document.querySelector('[data-a-target="player-settings-submenu-quality-option"][aria-checked="true"]');
        if (selAria) return selAria.innerText.trim();

        const options = Array.from(document.querySelectorAll('[data-a-target="player-settings-submenu-quality-option"]'));
        for (const opt of options) {
            if (opt.getAttribute('aria-pressed') === 'true' || opt.className.includes('selected') || opt.innerHTML.includes('aria-checked="true"')) {
                return opt.innerText.trim();
            }
        }

        const settingsButton = document.querySelector('[data-a-target="player-settings-button"]');
        if (settingsButton) {
            const ariaLabel = settingsButton.getAttribute('aria-label') || settingsButton.innerText || "";
            if (ariaLabel && /quality/i.test(ariaLabel)) return ariaLabel.trim();
        }

        return null;
    }

    // Open Twitch settings and choose preferred quality
    async function openSettingsAndPickPreferred() {
        try {
            const settingsBtn = await waitFor('[data-a-target="player-settings-button"]', 3000);
            log("Opening settings menu...");
            settingsBtn.click();

            const qualityMenuItem = await waitFor('[data-a-target="player-settings-menu-item-quality"]', 3000).catch(() => null);
            if (!qualityMenuItem) {
                const menuCandidates = Array.from(document.querySelectorAll('[data-a-target^="player-settings-menu-item"], [role="menuitem"], button'))
                    .filter(el => /quality/i.test(el.innerText));
                if (menuCandidates.length) {
                    menuCandidates[0].click();
                } else {
                    settingsBtn.click();
                    return false;
                }
            } else {
                qualityMenuItem.click();
            }

            await waitFor('[data-a-target="player-settings-submenu-quality-option"]', 3000);
            const options = Array.from(document.querySelectorAll('[data-a-target="player-settings-submenu-quality-option"]'));
            if (!options.length) {
                log("No quality options found");
                settingsBtn.click();
                return false;
            }

            const selected = options.find(o => o.getAttribute('aria-checked') === 'true' || o.className.includes('selected') || /aria-checked="true"/i.test(o.outerHTML));
            if (selected) {
                const txt = selected.innerText || selected.textContent || "";
                for (const pref of PREFERRED_QUALITY_LABELS) {
                    if (txt.includes(pref)) {
                        log("Preferred already selected:", txt);
                        settingsBtn.click();
                        return true;
                    }
                }
            }

            let toClick = null;
            for (const pref of PREFERRED_QUALITY_LABELS) {
                toClick = options.find(opt => (opt.innerText || "").includes(pref));
                if (toClick) break;
            }

            if (!toClick) {
                log("Preferred quality not available:", options.map(o => o.innerText.trim()));
                settingsBtn.click();
                return false;
            }

            log("Selecting quality:", toClick.innerText.trim());
            toClick.click();

            // Close settings after a short delay
            setTimeout(() => settingsBtn.click(), 300);
            return true;
        } catch (err) {
            log("openSettingsAndPickPreferred error:", err);
            return false;
        }
    }

    // Only check when page changes (e.g. switching to another channel)
    async function ensurePreferredQuality() {
        try {
            const playerRoot = document.querySelector('[data-a-target="video-player"], .player') || document.querySelector('video');
            if (!playerRoot) {
                log("No player found");
                return;
            }

            const current = getSelectedQualityText();
            log("Current quality:", current);
            if (current) {
                const match = PREFERRED_QUALITY_LABELS.some(pref => current.includes(pref));
                if (match) return; // already preferred
            }

            await openSettingsAndPickPreferred();
        } catch (e) {
            log("ensurePreferredQuality error:", e);
        }
    }

    function startWatcher() {
        // Initial check
        setTimeout(ensurePreferredQuality, 1500);

        // Detect URL change (Twitch is a single-page app)
        let lastHref = location.href;
        new MutationObserver(() => {
            if (location.href !== lastHref) {
                lastHref = location.href;
                log("URL changed → checking quality");
                setTimeout(ensurePreferredQuality, 1000);
            }
        }).observe(document, { subtree: true, childList: true });
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        startWatcher();
    } else {
        window.addEventListener('DOMContentLoaded', startWatcher);
    }

})();
