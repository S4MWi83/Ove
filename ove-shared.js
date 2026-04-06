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
 *   - OVE.disclaimer()        — injects global compliance disclaimer into footer
 *
 * Usage:
 *   OVE.nav('concept');       // pass the active page key
 *   OVE.footer();             // standard footer
 *   OVE.footer({ disclaimer: true }); // footer with legal disclaimer (legacy)
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

    var DISCLAIMER_TRANSLATIONS = {
        en: 'Ové does not currently provide investment services. This website does not enable or invite users to invest. For illustrative purposes only and should not be relied upon for investment decisions. Investing involves risk. The value of investments can go down as well as up.',
        sv: 'Ové tillhandahåller för närvarande inga investeringstjänster. Denna webbplats möjliggör inte och uppmanar inte användare att investera. Endast i illustrativt syfte och bör inte ligga till grund för investeringsbeslut. Investeringar innebär risker. Värdet på investeringar kan både stiga och sjunka.',
        es: 'Ové no presta actualmente servicios de inversión. Este sitio web no permite ni invita a los usuarios a invertir. Solo con fines ilustrativos y no debe utilizarse como base para decisiones de inversión. Invertir conlleva riesgos. El valor de las inversiones puede tanto subir como bajar.',
        it: 'Ové attualmente non fornisce servizi di investimento. Questo sito web non consente né invita gli utenti a investire. Solo a scopo illustrativo e non deve essere utilizzato come base per decisioni di investimento. Investire comporta dei rischi. Il valore degli investimenti può aumentare o diminuire.'
    };

    // Keep for backward compat
    var FOOTER_DISCLAIMER = DISCLAIMER_TRANSLATIONS.en;

    // ─── SPLASH GUARD ─────────────────────────────────────────────────────────

    function splashGuard() {
        // Splash removed — no longer redirecting
    }

    // ─── NAV ──────────────────────────────────────────────────────────────────

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

    function footer(options) {
        options = options || {};
        var footerEl = document.querySelector('footer');
        if (!footerEl) return;

        var yr = new Date().getFullYear();
        var disc = options.disclaimer
            ? '<span style="font-size:0.75rem;color:var(--muted);opacity:0.7;">' + FOOTER_DISCLAIMER + '</span>'
            : '';

        var copy = options.allRights
            ? '&copy; ' + yr + ' Ov&eacute;. All rights reserved.'
            : '&copy; <span id="year">' + yr + '</span> Ov&eacute;. Currently in development. <a href="/privacy" style="color:var(--blue);text-decoration:none;">Privacy Policy</a>';

        var xLink = '<a href="https://x.com/BeginOve" target="_blank" style="color:var(--muted);text-decoration:none;">@BeginOve on X</a>';

        footerEl.innerHTML = (disc ? disc + ' ' : '') + '<span>' + copy + '</span> ' + xLink;
    }

    // ─── DISCLAIMER INJECTION ─────────────────────────────────────────────────

    /**
     * Injects the global compliance disclaimer into the footer of every page.
     * Reads the current language from localStorage (ove-lang) and updates
     * when the language changes via a MutationObserver on <html lang>.
     * The disclaimer element is never removable — it is always appended last.
     */
    function disclaimer() {
        var footerEl = document.querySelector('footer');
        if (!footerEl) return;

        // Don't inject twice
        if (document.getElementById('ove-global-disclaimer')) return;

        var el = document.createElement('p');
        el.id = 'ove-global-disclaimer';
        el.style.cssText = 'font-size:0.75rem;color:var(--muted);opacity:0.7;line-height:1.6;margin-top:0.75rem;width:100%;text-align:center;';
        footerEl.appendChild(el);

        function update() {
            var lang = 'en';
            try { lang = localStorage.getItem('ove-lang') || 'en'; } catch(e) {}
            if (!DISCLAIMER_TRANSLATIONS[lang]) lang = 'en';
            el.textContent = DISCLAIMER_TRANSLATIONS[lang];
        }

        update();

        // Re-run when language changes (pages store lang on <html lang>)
        try {
            new MutationObserver(function(mutations) {
                mutations.forEach(function(m) {
                    if (m.attributeName === 'lang') update();
                });
            }).observe(document.documentElement, { attributes: true });
        } catch(e) {}

        // Also listen for direct localStorage changes (same-tab lang switches)
        window.addEventListener('ove-lang-changed', update);
    }

    // ─── EMAIL INJECTION ──────────────────────────────────────────────────────

    function email() {
        var addr = EMAIL_USER + '\u0040' + EMAIL_DOMAIN;
        var href = 'mai' + 'lto:' + addr;

        document.querySelectorAll('[data-email="contact"]').forEach(function(el) {
            el.href = href;
            el.textContent = addr;
        });

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
        disclaimer();
    });

    // ─── PUBLIC API ───────────────────────────────────────────────────────────

    return {
        nav: nav,
        footer: footer,
        email: email,
        year: year,
        splashGuard: splashGuard,
        disclaimer: disclaimer,
        EMAIL: EMAIL_USER + '\u0040' + EMAIL_DOMAIN,
        FOOTER_DISCLAIMER: FOOTER_DISCLAIMER,
    };

})();
