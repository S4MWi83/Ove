/**
 * ove-shared.js
 * Single source of truth for shared Ové site elements.
 * Include this script in every page: <script src="/ove-shared.js"></script>
 *
 * Provides:
 *   - OVE.nav(activePage)     — renders the standard nav
 *   - OVE.footer(options)     — renders the standard footer
 *   - OVE.email()             — injects email addresses (Cloudflare-proof)
 *   - OVE.splashGuard()       — redirects to / if splash not seen
 *   - OVE.year()              — sets current year on #year elements
 *
 * Usage:
 *   OVE.nav('concept');       // pass the active page key
 *   OVE.footer();             // standard footer
 *   OVE.footer({ disclaimer: true }); // footer with legal disclaimer (home page)
 */

var OVE = (function() {

    // ─── CONSTANTS ────────────────────────────────────────────────────────────

    var EMAIL_USER = 'info';
    var EMAIL_DOMAIN = 'meetove.pro';

    var NAV_LINKS = [
        { key: 'concept',    href: '/concept',    label: 'Ové' },
        { key: 'vision',     href: '/vision',     label: 'Vision' },
        { key: 'regulatory', href: '/regulatory', label: 'Regulatory' },
    ];

    var FOOTER_DISCLAIMER = 'Ové does not currently provide investment services. This website does not enable or invite users to invest. For illustrative purposes only and should not be relied upon for investment decisions. Investing involves risk. The value of investments can go down as well as up.';

    // ─── SPLASH GUARD ─────────────────────────────────────────────────────────

    function splashGuard() {
        try {
            if (!localStorage.getItem('ove-splash')) {
                window.location.replace('/');
            }
        } catch(e) {}
    }

    // ─── NAV ──────────────────────────────────────────────────────────────────

    /**
     * Renders the standard nav into the first <nav> element on the page,
     * or inserts one after <body> if none exists.
     * @param {string} activePage - key from NAV_LINKS (e.g. 'concept')
     */
    function nav(activePage) {
        var navEl = document.querySelector('nav');
        if (!navEl) {
            navEl = document.createElement('nav');
            document.body.insertBefore(navEl, document.body.firstChild);
        }

        var links = NAV_LINKS.map(function(link) {
            var isActive = link.key === activePage;
            return '<a href="' + link.href + '" class="nav-link' + (isActive ? ' active' : '') + '">' + link.label + '</a>';
        }).join('\n            ');

        navEl.innerHTML = '\n        <a href="/" class="nav-logo">Ové<span></span></a>\n        <div class="nav-links">\n            ' + links + '\n        </div>\n    ';
    }

    // ─── FOOTER ───────────────────────────────────────────────────────────────

    /**
     * Renders the standard footer into the first <footer> element on the page.
     * @param {object} options
     *   options.disclaimer {boolean} - include legal disclaimer (default: false)
     *   options.allRights  {boolean} - use "All rights reserved" text (default: false)
     */
    function footer(options) {
        options = options || {};
        var footerEl = document.querySelector('footer');
        if (!footerEl) return;

        var year = new Date().getFullYear();
        var disclaimer = options.disclaimer
            ? '<span style="font-size:0.75rem;color:var(--muted);opacity:0.7;">' + FOOTER_DISCLAIMER + '</span>'
            : '';

        var copy = options.allRights
            ? '&copy; ' + year + ' Ov&eacute;. All rights reserved.'
            : '&copy; <span id="year">' + year + '</span> Ov&eacute;. Currently in development. <a href="/privacy" style="color:var(--blue);text-decoration:none;">Privacy Policy</a>';

        var xLink = '<a href="https://x.com/BeginOve" target="_blank" style="color:var(--muted);text-decoration:none;">@BeginOve on X</a>';

        footerEl.innerHTML = (disclaimer ? disclaimer + ' ' : '') + '<span>' + copy + '</span> ' + xLink;
    }

    // ─── EMAIL INJECTION ──────────────────────────────────────────────────────

    /**
     * Injects info@meetove.pro into any element with data-email="contact".
     * Cloudflare-proof — no plain email in HTML.
     *
     * Usage in HTML: <a data-email="contact" style="color:var(--blue);"></a>
     */
    function email() {
        var addr = EMAIL_USER + '\u0040' + EMAIL_DOMAIN;
        var href = 'mai' + 'lto:' + addr;

        // Support both data-email attribute and legacy id-based approach
        document.querySelectorAll('[data-email="contact"]').forEach(function(el) {
            el.href = href;
            el.textContent = addr;
        });

        // Legacy: specific IDs used across pages
        var legacyIds = [
            'email-contact-1',
            'email-contact-2',
            'email-contact-reg',
            'email-cta-1',
            'email-cta-2'
        ];
        legacyIds.forEach(function(id) {
            var el = document.getElementById(id);
            if (el) { el.href = href; el.textContent = addr; }
        });
    }

    // ─── YEAR ─────────────────────────────────────────────────────────────────

    function year() {
        document.querySelectorAll('#year, .ove-year').forEach(function(el) {
            el.textContent = new Date().getFullYear();
        });
    }

    // ─── AUTO-INIT ────────────────────────────────────────────────────────────

    document.addEventListener('DOMContentLoaded', function() {
        year();
        email();
    });

    // ─── PUBLIC API ───────────────────────────────────────────────────────────

    return {
        nav: nav,
        footer: footer,
        email: email,
        year: year,
        splashGuard: splashGuard,
        EMAIL: EMAIL_USER + '\u0040' + EMAIL_DOMAIN,
        FOOTER_DISCLAIMER: FOOTER_DISCLAIMER,
    };

})();
