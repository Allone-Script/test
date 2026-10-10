/**
 * DolaBypass - Cinematic Liquid Glass Splash Screen for dola.com
 * Author: By Fikus
 * 
 * Features:
 * - Liquid glass aesthetic matching the purple Möbius logo
 * - Smooth intro animation of logo, "Dola bypass" title and "By Fikus" badge
 * - Non-blocking: pointer-events: none so clicks NEVER get intercepted
 * - Auto-skips if account deletion/recreation flow is active
 * - Smoothly fades out and cleans up DOM completely after ~1.6 seconds
 */

(function () {
    'use strict';

    // 1. Safety check: DO NOT display during account deletion or recreation flows
    try {
        const href = (window.location.href || '').toLowerCase();
        const isDeleteFlow = href.includes('delete-account') || 
                             href.includes('delete') || 
                             href.includes('from_logout') ||
                             sessionStorage.getItem('dolabypass_reset_in_progress') ||
                             localStorage.getItem('delete_in_progress');

        if (isDeleteFlow) {
            return;
        }

        // Show once per tab session (or reset after 2 minutes)
        const lastSeen = Number(sessionStorage.getItem('dolabypass_splash_time') || 0);
        if (Date.now() - lastSeen < 120000) {
            return;
        }
        sessionStorage.setItem('dolabypass_splash_time', String(Date.now()));
    } catch (_) {}

    function injectSplash() {
        if (document.getElementById('dolabypass-splash-screen')) return;

        // Container
        const splash = document.createElement('div');
        splash.id = 'dolabypass-splash-screen';

        // Get logo URL from extension
        let logoUrl = '';
        try {
            if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
                logoUrl = chrome.runtime.getURL('brand-icon.png');
            }
        } catch (_) {}

        splash.innerHTML = `
            <style>
                #dolabypass-splash-screen {
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100vw !important;
                    height: 100vh !important;
                    z-index: 2147483640 !important;
                    pointer-events: none !important;
                    user-select: none !important;
                    -webkit-user-select: none !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    background: radial-gradient(circle at 50% 45%, rgba(147, 51, 234, 0.32) 0%, rgba(10, 8, 18, 0.94) 60%, #07060d 100%) !important;
                    backdrop-filter: blur(32px) saturate(200%) !important;
                    -webkit-backdrop-filter: blur(32px) saturate(200%) !important;
                    opacity: 1;
                    transition: opacity 0.55s cubic-bezier(0.16, 1, 0.3, 1), transform 0.55s cubic-bezier(0.16, 1, 0.3, 1) !important;
                    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
                    box-sizing: border-box !important;
                    overflow: hidden !important;
                }

                #dolabypass-splash-screen * {
                    pointer-events: none !important;
                    box-sizing: border-box !important;
                }

                #dolabypass-splash-screen.dolabypass-splash-exit {
                    opacity: 0 !important;
                    transform: scale(1.03) !important;
                }

                /* Flowing Ambient Liquid Glow Orbs */
                .dolabypass-splash-orb {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(75px);
                    opacity: 0.65;
                    animation: dolabypass-splash-orb-float 6s ease-in-out infinite alternate;
                }
                .dolabypass-splash-orb-1 {
                    width: 320px;
                    height: 320px;
                    top: 20%;
                    left: 25%;
                    background: radial-gradient(circle, rgba(168, 85, 247, 0.5) 0%, rgba(124, 58, 237, 0.2) 70%, transparent 100%);
                }
                .dolabypass-splash-orb-2 {
                    width: 360px;
                    height: 360px;
                    bottom: 20%;
                    right: 25%;
                    background: radial-gradient(circle, rgba(192, 132, 252, 0.45) 0%, rgba(99, 102, 241, 0.18) 70%, transparent 100%);
                    animation-delay: -3s;
                }

                @keyframes dolabypass-splash-orb-float {
                    0% { transform: translate(0, 0) scale(1); }
                    100% { transform: translate(25px, -20px) scale(1.12); }
                }

                /* Centered Content Card */
                .dolabypass-splash-card {
                    position: relative;
                    z-index: 2;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 16px;
                    padding: 34px 44px;
                    border-radius: 28px;
                    background: rgba(18, 14, 32, 0.65);
                    border: 1px solid rgba(255, 255, 255, 0.14);
                    box-shadow: inset 0 1px 1px 0 rgba(255, 255, 255, 0.35), 0 24px 60px -10px rgba(0, 0, 0, 0.8), 0 0 35px rgba(168, 85, 247, 0.35);
                    animation: dolabypass-card-intro 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }

                @keyframes dolabypass-card-intro {
                    0% {
                        opacity: 0;
                        transform: translateY(18px) scale(0.92);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                /* Glowing Möbius Logo */
                .dolabypass-splash-logo-wrap {
                    position: relative;
                    width: 90px;
                    height: 90px;
                }

                .dolabypass-splash-logo-img {
                    width: 100%;
                    height: 100%;
                    border-radius: 22px;
                    object-fit: cover;
                    border: 1.5px solid rgba(192, 132, 252, 0.65);
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7), 0 0 30px rgba(168, 85, 247, 0.65);
                    animation: dolabypass-logo-glow 3s ease-in-out infinite alternate;
                }

                .dolabypass-splash-logo-sheen {
                    position: absolute;
                    inset: 0;
                    border-radius: 22px;
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.45) 0%, transparent 60%);
                }

                @keyframes dolabypass-logo-glow {
                    0% {
                        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7), 0 0 25px rgba(168, 85, 247, 0.5);
                    }
                    100% {
                        box-shadow: 0 12px 35px rgba(0, 0, 0, 0.7), 0 0 45px rgba(192, 132, 252, 0.85);
                    }
                }

                /* Text Headings */
                .dolabypass-splash-text-wrap {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 6px;
                }

                .dolabypass-splash-title {
                    margin: 0;
                    font-size: 26px;
                    font-weight: 850;
                    letter-spacing: -0.025em;
                    background: linear-gradient(135deg, #ffffff 0%, #f3e8ff 45%, #c084fc 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    filter: drop-shadow(0 0 14px rgba(168, 85, 247, 0.5));
                }

                .dolabypass-splash-author-pill {
                    display: inline-flex;
                    align-items: center;
                    padding: 3px 14px;
                    border-radius: 9999px;
                    background: rgba(168, 85, 247, 0.2);
                    border: 1px solid rgba(192, 132, 252, 0.45);
                    box-shadow: 0 0 14px rgba(168, 85, 247, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.3);
                    color: #c084fc;
                    font-size: 11.5px;
                    font-weight: 750;
                    letter-spacing: 0.04em;
                    text-shadow: 0 0 10px rgba(192, 132, 252, 0.5);
                }

                /* Sleek Animated Liquid Beam Loader */
                .dolabypass-splash-loader {
                    width: 140px;
                    height: 3.5px;
                    border-radius: 9999px;
                    background: rgba(255, 255, 255, 0.1);
                    position: relative;
                    overflow: hidden;
                    margin-top: 4px;
                }

                .dolabypass-splash-loader::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 70%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, #c084fc 50%, #e879f9 80%, transparent);
                    border-radius: inherit;
                    animation: dolabypass-loader-beam 1.4s ease-in-out infinite;
                }

                @keyframes dolabypass-loader-beam {
                    0% { left: -70%; }
                    100% { left: 100%; }
                }
            </style>

            <div class="dolabypass-splash-orb dolabypass-splash-orb-1"></div>
            <div class="dolabypass-splash-orb dolabypass-splash-orb-2"></div>

            <div class="dolabypass-splash-card">
                <div class="dolabypass-splash-logo-wrap">
                    <img src="${logoUrl}" class="dolabypass-splash-logo-img" alt="DolaBypass">
                    <div class="dolabypass-splash-logo-sheen"></div>
                </div>
                <div class="dolabypass-splash-text-wrap">
                    <h1 class="dolabypass-splash-title">Dola bypass</h1>
                    <span class="dolabypass-splash-author-pill">By Fikus</span>
                </div>
                <div class="dolabypass-splash-loader"></div>
            </div>
        `;

        const root = document.documentElement || document.body;
        if (root) {
            root.appendChild(splash);
        } else {
            document.addEventListener('DOMContentLoaded', () => {
                (document.documentElement || document.body).appendChild(splash);
            }, { once: true });
        }

        // Auto dismiss after 1.6s
        setTimeout(() => {
            splash.classList.add('dolabypass-splash-exit');
            setTimeout(() => {
                try { splash.remove(); } catch (_) {}
            }, 550);
        }, 1600);
    }

    // Run as early as possible
    if (document.readyState === 'loading') {
        injectSplash();
    } else {
        injectSplash();
    }
})();
