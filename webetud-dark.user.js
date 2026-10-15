// ==UserScript==
// @name         Webetud Dark Modern
// @namespace    https://webetud.iut-blagnac.fr/
// @version      1.17.0
// @description  Thème sombre moderne (accent indigo) pour Webetud (Moodle Boost 3.x)
// @match        https://webetud.iut-blagnac.fr/*
// @updateURL    https://raw.githubusercontent.com/VivienR67/webetud-dark/main/webetud-dark.user.js
// @downloadURL  https://raw.githubusercontent.com/VivienR67/webetud-dark/main/webetud-dark.user.js
// @homepageURL  https://github.com/VivienR67/webetud-dark
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  // Ajoute un <style> même si <html> n'existe pas encore (document-start très tôt)
  const addStyle = (el) => {
    const t = document.head || document.documentElement;
    if (t) return t.appendChild(el);
    new MutationObserver((_, o) => {
      if (document.documentElement) { o.disconnect(); document.documentElement.appendChild(el); }
    }).observe(document, { childList: true });
  };

  // Fichiers déposés par les profs (HTML avec leurs propres couleurs) : même fond que le thème,
  // encadrés clairs passés en foncé, texte trop pâle éclairci en gardant sa teinte.
  if (/^\/(pluginfile|draftfile)\.php\//.test(location.pathname)) {
    if (document.contentType !== 'text/html') return; // images, PDF... : on ne touche pas
    const s = document.createElement('style');
    s.textContent = `
      html, body { background: #0f1117 !important; color: #e4e6ef !important; color-scheme: dark; }
      ::selection { background: #7c6cf2; color: #fff; }`;
    addStyle(s);

    const rgb = (c) => (c.match(/[\d.]+/g) || []).map(Number);
    const opaque = (c) => c.length === 3 || c[3] > 0.5;
    const lum = ([r, g, b]) => [r, g, b].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; })
      .reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0);
    const bgOf = (el) => {
      for (; el; el = el.parentElement) { const c = rgb(getComputedStyle(el).backgroundColor); if (opaque(c)) return c; }
      return [15, 17, 23];
    };
    // Garde la teinte (rouge reste rouge), seule la luminosité monte
    const lighten = ([r, g, b]) => {
      const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
      const sat = d / (255 - Math.abs(max + min - 255) || 1);
      if (sat < 0.15) return '#e4e6ef';
      const h = d === 0 ? 0 : max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
      return `hsl(${Math.round(h * 60 + 360) % 360}, ${Math.round(sat * 100)}%, 75%)`;
    };
    const fix = () => {
      const els = document.querySelectorAll('body *');
      els.forEach((el) => { // 1. encadrés clairs -> surface du thème
        const c = rgb(getComputedStyle(el).backgroundColor);
        if (opaque(c) && lum(c) > 0.4) el.style.setProperty('background-color', '#171a23', 'important');
      });
      els.forEach((el) => { // 2. texte peu lisible sur son (nouveau) fond -> éclairci
        if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) return;
        const col = rgb(getComputedStyle(el).color);
        const L1 = lum(col), L2 = lum(bgOf(el));
        if ((Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05) < 4.5) el.style.setProperty('color', lighten(col), 'important');
      });
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fix);
    else fix();
    return;
  }

  const css = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
:root {
  --bg: #0f1117;
  --surface: #171a23;
  --surface-2: #1e2230;
  --border: #2a2f3f;
  --text: #e4e6ef;
  --muted: #9aa0b4;
  --accent: #7c6cf2;
  --accent-hover: #9587ff;
  --accent-soft: rgba(124,108,242,.15);
  --radius: 16px;
  --shadow: 0 4px 20px rgba(0,0,0,.35);
  color-scheme: dark;
}

/* Base */
html, body, #page-wrapper, #page, #page-content { background: var(--bg) !important; color: var(--text) !important; }
body { font-family: "Plus Jakarta Sans", "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif !important; }
a { color: var(--accent-hover) !important; transition: color .15s; }
a:hover { color: #b9b0ff !important; text-decoration: none; }
h1, h2, h3, h4, h5, h6, .h1, .h2, .h3, .h4, .h5 { color: var(--text) !important; font-weight: 600; letter-spacing: -.01em; }
.text-muted, .dimmed_text, .dimmed, small { color: var(--muted) !important; }
hr { border-color: var(--border) !important; }
::selection { background: var(--accent); color: #fff; }

/* Scrollbar */
* { scrollbar-width: thin; scrollbar-color: var(--border) transparent; }
::-webkit-scrollbar { width: 10px; height: 10px; }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; border: 2px solid var(--bg); }
::-webkit-scrollbar-track { background: transparent; }

/* Bootstrap overrides */
.bg-white, .bg-light, .bg-dark, .bg-faded { background: var(--surface) !important; }
.text-dark, .text-body { color: var(--text) !important; }
.border, .border-top, .border-bottom, .border-left, .border-right { border-color: var(--border) !important; }

/* Top navbar */
nav.navbar {
  background: rgba(23,26,35,.85) !important;
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border) !important;
  box-shadow: none !important;
}
nav.navbar, nav.navbar .navbar-brand, nav.navbar .nav-link, nav.navbar .usertext { color: var(--text) !important; }
nav.navbar .btn, nav.navbar .icon { color: var(--text) !important; background: transparent !important; border-color: transparent !important; }
.count-container { background: var(--accent) !important; border-radius: 10px; }

/* Left drawer */
#nav-drawer { background: var(--bg) !important; border-right: 1px solid var(--border); display: flex; flex-direction: column; }
/* Menu général (Accueil, Tableau de bord, cours...) en premier, menu du cours ensuite */
#nav-drawer > nav.list-group:last-of-type { order: -1; margin-top: 0 !important; }
#nav-drawer > nav.list-group { flex-shrink: 0; }
#nav-drawer > nav.wdm-nav, #nav-drawer > nav.wdm-site { order: -1; }
/* "Mes cours" + cours inscrits : remplacés par le menu complet du script */
#nav-drawer > nav.list-group:not(.wdm-nav) [data-key="mycourses"],
#nav-drawer > nav.list-group:not(.wdm-nav) a[data-type="20"] { display: none !important; }
.wdm-nav-title { padding: .5rem 1rem .25rem; font-size: .75rem; font-weight: 600; text-transform: uppercase; letter-spacing: .08em; color: var(--muted); }
.wdm-emoji { display: inline-block; width: 1.28571em; text-align: center; margin-right: .5rem; font-size: 1.05em; }
#nav-drawer .list-group { margin-bottom: 1rem; border-radius: var(--radius); overflow: hidden; }
.list-group-item {
  background: var(--surface) !important;
  color: var(--text) !important;
  border-color: var(--border) !important;
}
#nav-drawer .list-group { background: var(--surface) !important; border: 1px solid var(--border); padding: 4px 0; }
#nav-drawer .list-group-item { background: transparent !important; border: none !important; margin: 2px 6px; border-radius: 8px !important; width: auto; }
#nav-drawer .list-group-item-action:hover { background: var(--surface-2) !important; }
.list-group-item.active, #nav-drawer .list-group-item.active, #nav-drawer .list-group-item[data-isactive="1"] {
  background: var(--accent-soft) !important;
  color: var(--accent-hover) !important;
  box-shadow: inset 3px 0 0 var(--accent);
}
#nav-drawer .list-group-item.active * { color: var(--accent-hover) !important; }

/* Cards / blocks */
.card, .block, #region-main, .moremenu, .dashboard-card {
  background: var(--surface) !important;
  border: 1px solid var(--border) !important;
  border-radius: var(--radius) !important;
  box-shadow: var(--shadow);
  color: var(--text) !important;
}
.card .card { box-shadow: none; background: var(--surface-2) !important; }
.card-header, .card-footer { background: var(--surface-2) !important; border-color: var(--border) !important; }
#page-header .card { background: linear-gradient(135deg, #2a2160 0%, var(--surface) 70%) !important; }

/* Course page */
.course-content ul.topics li.section, .course-content ul.weeks li.section {
  border-bottom: 1px solid var(--border) !important;
  padding: 1rem 0;
}
.course-content .section .activity { border-radius: 8px; padding: 4px 6px; transition: background .15s; }
.course-content .section .activity:hover { background: var(--surface-2); }
.course-content .current { box-shadow: inset 3px 0 0 var(--accent) !important; }
.course-content .current::before { border-color: var(--accent) !important; }
.activityicon, .iconlarge.activityicon { filter: brightness(1.15); }
.section-summary, .section .summary { color: var(--text) !important; }

/* Breadcrumb */
.breadcrumb { background: transparent !important; border: none !important; } /* Moodle ajoute une bordure claire sur téléphone */
.breadcrumb-item + .breadcrumb-item::before { color: var(--muted) !important; }

/* Buttons */
.btn { border-radius: 8px !important; transition: all .15s; }
.btn-primary, .btn-primary:not(:disabled):not(.disabled):active {
  background: var(--accent) !important; border-color: var(--accent) !important; color: #fff !important;
}
.btn-primary:hover, .btn-primary:focus { background: var(--accent-hover) !important; border-color: var(--accent-hover) !important; }
.btn-secondary, .btn-light, .btn-outline-secondary {
  background: var(--surface-2) !important; border-color: var(--border) !important; color: var(--text) !important;
}
.btn-secondary:hover, .btn-light:hover { background: var(--border) !important; }
.btn-link { color: var(--accent-hover) !important; }
.btn:focus, .form-control:focus, .custom-select:focus { box-shadow: 0 0 0 3px var(--accent-soft) !important; }

/* Forms */
.form-control, .custom-select, input[type=text], input[type=search], input[type=password], input[type=email], textarea, select {
  background: var(--surface-2) !important;
  border: 1px solid var(--border) !important;
  color: var(--text) !important;
  border-radius: 8px !important;
}
.form-control:focus, .custom-select:focus { border-color: var(--accent) !important; }
.form-control::placeholder { color: var(--muted) !important; }
.input-group-text { background: var(--surface-2) !important; border-color: var(--border) !important; color: var(--muted) !important; }

/* Dropdowns / modals / popovers */
.dropdown-menu, .popover, .modal-content, .moodle-dialogue-base .moodle-dialogue-wrap {
  background: var(--surface) !important; border: 1px solid var(--border) !important;
  border-radius: var(--radius) !important; box-shadow: var(--shadow); color: var(--text) !important;
}
.dropdown-item { color: var(--text) !important; }
.dropdown-item:hover, .dropdown-item:focus { background: var(--accent-soft) !important; color: var(--accent-hover) !important; }
.dropdown-divider { border-color: var(--border) !important; }
.modal-header, .modal-footer, .popover-header { border-color: var(--border) !important; background: transparent !important; }
.popover-body { color: var(--text) !important; }
.close { color: var(--text) !important; text-shadow: none !important; }

/* Tables */
.table, table.generaltable, table.flexible { color: var(--text) !important; background: transparent !important; }
.table th, .table td, .generaltable th, .generaltable td { border-color: var(--border) !important; background: transparent !important; }
.generaltable thead th, .table thead th { background: var(--surface-2) !important; }
.table-striped tbody tr:nth-of-type(odd), .generaltable tbody tr:nth-of-type(odd) { background: rgba(255,255,255,.02) !important; }
.table-hover tbody tr:hover, .generaltable tbody tr:hover { background: var(--accent-soft) !important; }

/* Forum posts */
.forumpost { background: var(--surface-2) !important; border: 1px solid var(--border) !important; border-radius: var(--radius) !important; }
.forumpost .row.header, .forumpost .topic { background: transparent !important; }
.forumpost .posting img, .forumpost .content img { border-radius: 8px; }

/* Alerts / badges */
.alert { border-radius: var(--radius) !important; border: 1px solid var(--border) !important; }
.alert-info { background: rgba(80,140,255,.12) !important; color: #b5ccff !important; }
.alert-success { background: rgba(60,200,120,.12) !important; color: #a6e9c0 !important; }
.alert-warning { background: rgba(255,190,60,.12) !important; color: #ffdd9a !important; }
.alert-danger { background: rgba(255,90,90,.12) !important; color: #ffb3b3 !important; }
.badge { border-radius: 6px !important; }
.badge-primary, .badge-info { background: var(--accent) !important; }

/* Pagination / nav tabs */
.page-link { background: var(--surface-2) !important; border-color: var(--border) !important; color: var(--text) !important; }
.page-item.active .page-link { background: var(--accent) !important; border-color: var(--accent) !important; }
.nav-tabs { border-color: var(--border) !important; }
.nav-tabs .nav-link { color: var(--muted) !important; border: none !important; }
.nav-tabs .nav-link.active { background: transparent !important; color: var(--accent-hover) !important; box-shadow: inset 0 -2px 0 var(--accent); }

/* Calendar */
.calendarmonth td, .calendarmonth th { border-color: var(--border) !important; }
.calendarmonth td.today .day-number-circle { background: var(--accent) !important; }
.calendar_event_course { background: var(--accent-soft) !important; }

/* Messaging drawer */
.drawer, [data-region="message-drawer"], .message-app { background: var(--surface) !important; color: var(--text) !important; }
.message-app .message.received { background: var(--surface-2) !important; }
.message-app .message.send { background: var(--accent-soft) !important; }

/* Editors (Atto) */
.editor_atto_toolbar { background: var(--surface-2) !important; border-color: var(--border) !important; }
.editor_atto_content { background: var(--surface-2) !important; color: var(--text) !important; }
.editor_atto_toolbar button { background: transparent !important; color: var(--text) !important; }

/* Footer */
#page-footer { background: var(--surface) !important; border-top: 1px solid var(--border); color: var(--muted) !important; }
#page-footer a { color: var(--accent-hover) !important; }

/* Login page */
#page-login-index .card { max-width: 720px; margin: 8vh auto; }

/* Simplification : blocs redondants masqués (arbre de navigation, liste de cours = déjà dans le menu, recherche forums) */
.block_navigation, .block_course_list, .block_search_forums { display: none !important; }
.block .card-title, .block h5 { font-size: .95rem; text-transform: uppercase; letter-spacing: .06em; color: var(--muted) !important; }
img { border-radius: 8px; }

/* Colonne de blocs aussi haute que le contenu (flex au lieu de float), sinon le sommaire sticky décroche */
@media (min-width: 1200px) {
  #region-main-box { display: flex; gap: 15px; }
  #region-main-box > #region-main { flex: 1; min-width: 0; }
  #region-main-box > [data-region="blocks-column"] { float: none; flex: 0 0 360px; }
}

/* Sommaire du cours (ajouté par le script) */
#wdm-toc { position: sticky; top: 70px; display: block !important; padding: 1rem; margin-bottom: 1rem; max-height: calc(100vh - 90px); overflow-y: auto; }
#wdm-toc h5 { margin: 0 0 .6rem; }
#wdm-toc a {
  display: block; padding: .45rem .7rem; margin: 2px 0; border-radius: 10px;
  color: var(--text) !important; font-size: .9rem; line-height: 1.3;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
#wdm-toc a:hover { background: var(--surface-2); }
#wdm-toc a.wdm-current { background: var(--accent-soft); color: var(--accent-hover) !important; box-shadow: inset 3px 0 0 var(--accent); }

/* Devoir rendu : vert bien visible (page du devoir + calendrier) */
.generaltable td.submissionstatussubmitted, .submissionstatussubmitted {
  background: #1f9d55 !important; color: #fff !important; font-weight: 600;
}
.generaltable td, .generaltable th { color: var(--text) !important; }
.generaltable td.earlysubmission { color: #4ade80 !important; }
.generaltable td.overdue, .generaltable td.latesubmission { color: #ff8a8a !important; }
.wdm-done { display: inline-block; margin-right: .35em; font-style: normal; }
a.wdm-is-done { color: #4ade80 !important; }
a.wdm-is-open { color: #fbbf24 !important; }
a.wdm-is-late { color: #f87171 !important; }
.wdm-event-open { background: rgba(245,158,11,.18) !important; border-radius: 6px; box-shadow: inset 3px 0 0 #f59e0b; }
.wdm-event-late { background: rgba(239,68,68,.18) !important; border-radius: 6px; box-shadow: inset 3px 0 0 #ef4444; }
/* QCM (relecture / tentative) : cases claires de Moodle passées en sombre */
.que .info { background: var(--surface-2) !important; border: 1px solid var(--border) !important; border-radius: 10px; }
.que .info, .que .info * { color: var(--text) !important; }
.que .info .state, .que .info .grade, .que .info .questionflag { color: var(--muted) !important; }
.que .formulation { background: rgba(80,140,255,.10) !important; border: 1px solid rgba(80,140,255,.30) !important; color: var(--text) !important; border-radius: 10px; }
.que .outcome, .que .comment { background: rgba(255,190,60,.10) !important; border: 1px solid rgba(255,190,60,.30) !important; color: #ffdd9a !important; border-radius: 10px; }
.que .answer .correct { background: rgba(31,157,85,.18) !important; }
.que .answer .incorrect { background: rgba(239,68,68,.15) !important; }

/* Notifications (page complète + menu de la cloche) */
.popover-region-container, .popover-region-header-container, .popover-region-footer-container,
.notification-area, .notification-area .control-area, .notification-area .content-area {
  background: var(--surface) !important; border-color: var(--border) !important; color: var(--text) !important;
}
.content-item-container { background: var(--surface) !important; border-color: var(--border) !important; }
.content-item-container, .content-item-container .notification-message { color: var(--text) !important; }
.content-item-container.unread { background: var(--surface-2) !important; box-shadow: inset 3px 0 0 var(--accent); }
.content-item-container:hover, .content-item-container.selected { background: var(--accent-soft) !important; }

/* Tableaux Bootstrap colorés (ex. page des absences) : le thème avait effacé leurs couleurs */
.table td, .table th, .navbar-text { color: var(--text) !important; }
.table tr.table-success > *, .table td.table-success, .table th.table-success { background: rgba(31,157,85,.18) !important; color: #4ade80 !important; }
.table tr.table-danger > *, .table td.table-danger, .table th.table-danger { background: rgba(239,68,68,.15) !important; color: #f87171 !important; }
.table tr.table-warning > *, .table td.table-warning, .table th.table-warning { background: rgba(245,158,11,.15) !important; color: #fbbf24 !important; }
.table tr.table-info > *, .table td.table-info, .table th.table-info { background: rgba(80,140,255,.12) !important; color: #93c5fd !important; }

/* Raccourcis ENT / Mail dans la barre du haut */
.wdm-quick { display: flex; align-items: center; gap: .4rem; margin-right: .5rem; }
.wdm-quick a {
  display: inline-flex; align-items: center; gap: .4rem; padding: .3rem .65rem; border-radius: 999px;
  background: var(--surface-2); border: 1px solid var(--border); color: var(--text) !important; font-size: .85rem; font-weight: 500;
}
.wdm-quick a:hover { border-color: var(--accent); background: var(--accent-soft); }
/* Après un clic, Moodle applique son style de focus (fond blanc) : on le remplace */
.wdm-quick a:focus, .wdm-quick a:active { background: var(--surface-2) !important; color: var(--text) !important; outline: none !important; box-shadow: none !important; }
.wdm-quick a:focus-visible { box-shadow: 0 0 0 2px var(--accent) !important; }
.wdm-quick img { width: 16px; height: 16px; border-radius: 3px; }
.wdm-grade { display: inline-block; margin-right: .35em; padding: 0 .35em; border-radius: 5px; background: #1f9d55; color: #fff; font-size: .78em; font-weight: 700; line-height: 1.5; }
.wdm-event-done { background: rgba(31,157,85,.22) !important; border-radius: 6px; box-shadow: inset 3px 0 0 #1f9d55; }

/* Écran pas assez large pour 5 raccourcis avec texte (tablette, petit PC, téléphone) : icônes seules */
@media (max-width: 1199.98px) {
  .wdm-quick a { font-size: 0; gap: 0; padding: .4rem; }
  .wdm-quick a img, .wdm-quick a .icon { width: 18px; height: 18px; font-size: 16px; margin: 0 !important; }
}

/* Téléphone : barre du haut sur une seule ligne, raccourcis en icônes seules, marges réduites */
@media (max-width: 767.98px) {
  nav.navbar { padding: .35rem .5rem !important; flex-wrap: nowrap !important; }
  nav.navbar [data-region="drawer-toggle"] { margin-right: .25rem !important; }
  nav.navbar ul.navbar-nav.ml-auto { flex-wrap: nowrap !important; align-items: center; min-width: 0; }
  nav.navbar ul.navbar-nav.ml-auto > li { flex-shrink: 0; }
  nav.navbar .nav-link, nav.navbar .popover-region-toggle { padding-left: .35rem !important; padding-right: .35rem !important; }
  .wdm-quick { gap: .25rem; margin-right: .15rem; }
  #page { padding-left: .5rem !important; padding-right: .5rem !important; }
  .card, .block, #region-main { border-radius: 12px !important; }
  .card-body, #region-main { padding: .85rem !important; }
  #page-header h1, #page-header .h1 { font-size: 1.5rem !important; }
  .page-header-image img, #page-header .userpicture { width: 64px !important; height: 64px !important; }
  .content-item-container .notification-image img { width: 22px; height: 22px; }
  /* Calendrier mois : Moodle cache les événements sur téléphone -> on les affiche en pastilles (✅ / ⏳ / note) */
  .calendarmonth td > .d-none.d-md-block { display: block !important; }
  .calendarmonth td > .d-md-none { display: none !important; }
  .calendarmonth td { padding: 3px 1px !important; }
  .calendarmonth [data-region="day-content"] ul { padding: 0; margin: 0; list-style: none; }
  .calendarmonth [data-region="event-item"] { margin: 2px 0 !important; padding: 1px 0 !important; box-shadow: none !important; text-align: center; }
  .calendarmonth [data-region="event-item"] { overflow: visible !important; }
  .calendarmonth [data-region="event-item"] a { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 1px; white-space: normal !important; overflow: visible !important; text-overflow: clip !important; }
  .calendarmonth [data-region="event-item"] .eventname, .calendarmonth [data-region="event-item"] img.icon { display: none !important; }
  .calendarmonth .wdm-event-done .badge-circle, .calendarmonth .wdm-event-open .badge-circle, .calendarmonth .wdm-event-late .badge-circle { display: none !important; }
  .calendarmonth [data-region="event-item"] .wdm-done { margin: 0; font-size: 12px; }
  .calendarmonth [data-region="event-item"] .wdm-grade { margin: 0; padding: 0 2px; font-size: 9px; }
  .wdm-quick { gap: .2rem; }
  .wdm-quick a { padding: .35rem; }
}
`;

  const style = document.createElement('style');
  style.id = 'webetud-dark-modern';
  style.textContent = css;
  addStyle(style);

  // Sommaire compact des sections, à la place de l'arbre "Navigation"
  function buildToc() {
    const sections = document.querySelectorAll('.course-content li.section');
    const region = document.querySelector('[data-region="blocks-column"] .block-region, [data-region="blocks-column"]');
    if (!sections.length || !region || document.getElementById('wdm-toc')) return;

    const toc = document.createElement('nav');
    toc.id = 'wdm-toc';
    toc.className = 'block card';
    toc.innerHTML = '<h5>Sommaire</h5>';
    sections.forEach((sec) => {
      const link = sec.querySelector('.sectionname a');
      const name = (link || sec.querySelector('.sectionname'))?.textContent.trim();
      if (!name) return;
      const a = document.createElement('a');
      a.href = link ? link.href : '#' + sec.id;
      a.textContent = name;
      a.title = name;
      if (sec.classList.contains('current')) a.classList.add('wdm-current');
      toc.appendChild(a);
    });
    region.append(toc); // en dernier : sticky sans recouvrir d'autres blocs
  }

  // Émoji par matière (d'après le nom du cours) à la place de l'icône chapeau
  const EMOJIS = [
    [/mathsinfo/i, '🔢'], [/math/i, '📐'], [/dev/i, '💻'], [/web/i, '🌐'], [/archi/i, '🧮'], [/syst/i, '🐧'],
    [/\bbdd?\b|donn[ée]es/i, '🗄️'], [/proj/i, '📋'], [/[ée]co\b/i, '📊'],
    [/english|anglais/i, '🗣️'] /* pas de drapeau : Windows affiche « GB » */, [/\bcom\b|communication/i, '💬'], [/ppp/i, '🎯'],
    [/^s\d|sa[ée]/i, '🛠️'], [/orga/i, '🗂️'], [/altern/i, '💼'], [/r[ée]seau/i, '📡'],
  ];
  const emojiFor = (name) => (EMOJIS.find(([re]) => re.test(name)) || [])[1];

  function addEmojis() {
    document.querySelectorAll('#nav-drawer a[href*="/course/view.php"]').forEach((a) => {
      const icon = a.querySelector('.icon.fa-graduation-cap');
      const emoji = emojiFor(a.querySelector('.media-body')?.textContent.trim() || '');
      if (!icon || !emoji) return; // matière inconnue = icône d'origine, ajouter une ligne dans EMOJIS
      const span = document.createElement('span');
      span.className = 'wdm-emoji';
      span.textContent = emoji;
      icon.replaceWith(span);
    });
  }

  // Menu de gauche : toutes les matières du S1 + pages de l'ancien bloc "Navigation".
  // ponytail: liens en dur pour BUT Info S1 ; au S2, remplacer les URLs (copiées du bloc Navigation).
  const BASE = 'https://webetud.iut-blagnac.fr';
  const MENU = [
    ['BUT Info · S1', [
      ['R1.01-Dev1', '/course/view.php?id=550'],
      ['R1.01-Dev2', '/course/view.php?id=551'],
      ['R1.02-Web', '/course/view.php?id=553'],
      ['R1.03-Archi', '/course/view.php?id=554'],
      ['R1.04-Système', '/course/view.php?id=552'],
      ['R1.05-BD', '/course/view.php?id=542'],
      ['R1.06-MathsInfo', '/course/view.php?id=543'],
      ['R1.07-Maths', '/course/view.php?id=544'],
      ['R1.08-ProjOrg', '/course/view.php?id=545'],
      ['R1.09-Éco', '/course/view.php?id=546'],
      ['R1.10-English', '/course/view.php?id=555'],
      ['R1.11-Com', '/course/view.php?id=548'],
      ['R1.12-PPP', '/course/view.php?id=549'],
      ['SAé - S1', '/course/index.php?categoryid=154'],
      ['Orga_But_Inf_S1', '/course/view.php?id=531'],
      ['Alternance', '/course/index.php?categoryid=358'],
    ]],
    ['Plus', [
      ['Brèves', '/mod/forum/view.php?id=4092', '📰'],
      ['Blogs du site', '/blog/index.php', '✍️'],
      ['Tags', '/tag/search.php', '🏷️'],
      ['Tous les cours INFO', '/course/index.php?categoryid=3', '🗃️'],
      ['Cours', '/course/index.php', '📚'],
    ]],
  ];

  function buildMenu() {
    const drawer = document.getElementById('nav-drawer');
    const siteNav = drawer?.querySelector(':scope > nav.list-group:last-of-type');
    if (!siteNav || drawer.querySelector('.wdm-nav')) return;
    siteNav.classList.add('wdm-site'); // garde l'ordre une fois nos menus ajoutés après lui
    const here = location.href;
    let anchor = siteNav;
    MENU.forEach(([title, items]) => {
      const nav = document.createElement('nav');
      nav.className = 'list-group wdm-nav';
      nav.setAttribute('aria-label', title);
      nav.innerHTML = `<div class="wdm-nav-title">${title}</div>`;
      items.forEach(([name, path, emoji]) => {
        const a = document.createElement('a');
        a.className = 'list-group-item list-group-item-action';
        a.href = BASE + path;
        if (here === a.href || here.startsWith(a.href + '&') || here.startsWith(a.href + '#')) a.classList.add('active');
        a.innerHTML = '<div class="media"><span class="wdm-emoji"></span><span class="media-body"></span></div>';
        a.querySelector('.wdm-emoji').textContent = emoji || emojiFor(name) || '📘';
        a.querySelector('.media-body').textContent = name;
        nav.appendChild(a);
      });
      anchor.after(nav);
      anchor = nav;
    });
  }

  // Calendrier / blocs d'événements : ✅ devoirs rendus et QCM terminés (+ note), ⏳ devoirs pas rendus et QCM ouverts, ❌ devoirs/QCM fermés non faits.
  // On lit la page de l'activité. Devoirs "rendu" mis en cache ; QCM relus à chaque fois (la note peut changer).
  const DONE_KEY = 'wdm-done';
  const done = new Set(JSON.parse(localStorage.getItem(DONE_KEY) || '[]'));
  const checked = new Map(); // url -> Promise<{ok, grade}>, une seule requête par activité et par page
  const parse = {
    assign: (doc) => {
      if (doc.querySelector('.submissionstatussubmitted')) return { ok: true };
      // Pas rendu : rouge seulement si la page dit que le dépôt est fermé, sinon orange
      const closed = /a été fermé|n'accepte plus/i.test(doc.querySelector('#region-main')?.textContent || '');
      return { ok: false, state: closed ? 'late' : 'open' };
    },
    quiz: (doc) => {
      const ok = [...doc.querySelectorAll('.quizattemptsummary tbody tr')].some((tr) => /Terminée|Finished/i.test(tr.textContent));
      const m = (doc.querySelector('#feedback')?.textContent || '').match(/(\d+(?:[.,]\d+)?)\s*\/\s*(\d+(?:[.,]\d+)?)/);
      const clean = (n) => n.replace(/([.,]\d*?)0+$/, '$1').replace(/[.,]$/, ''); // 10,00 -> 10, 7,50 -> 7,5
      if (!ok) {
        // Pas terminé : bouton "Faire le test" -> ouvert ; "a été fermé" -> raté ; sinon pas encore ouvert (neutre)
        if (doc.querySelector('.quizstartbuttondiv, form[action*="startattempt.php"]')) return { ok, state: 'open' };
        if (/a été fermé|has closed|was closed/i.test(doc.querySelector('.quizinfo')?.textContent || '')) return { ok, state: 'late' };
        return { ok };
      }
      return { ok, grade: m ? `${clean(m[1])}/${clean(m[2])}` : '' };
    },
  };
  const status = (url, type) => {
    const id = type + ':' + new URL(url).searchParams.get('id');
    if (type === 'assign' && done.has(id)) return Promise.resolve({ ok: true });
    if (!checked.has(url)) {
      checked.set(url, fetch(url, { credentials: 'include' }).then((r) => r.text()).then((html) => {
        const res = parse[type](new DOMParser().parseFromString(html, 'text/html'));
        if (res.ok && type === 'assign') { done.add(id); try { localStorage.setItem(DONE_KEY, JSON.stringify([...done])); } catch (e) {} }
        return res;
      }).catch(() => ({ ok: false })));
    }
    return checked.get(url);
  };
  function markSubmitted() {
    const scopes = ['[data-region="event-item"]', '.block_calendar_upcoming', '[data-type="event"]'];
    const sel = scopes.flatMap((s) => [`${s} a[href*="/mod/assign/view.php"]`, `${s} a[href*="/mod/quiz/view.php"]`]).join(', ');
    document.querySelectorAll(sel).forEach((a) => {
      if (a.dataset.wdm) return;
      a.dataset.wdm = '1';
      const type = a.href.includes('/mod/quiz/') ? 'quiz' : 'assign';
      status(a.href, type).then(({ ok, grade, state }) => {
        const item = a.closest('[data-region="event-item"], [data-type="event"]');
        if (!ok) {
          if (!state) return; // QCM pas encore ouvert : rien
          const quiz = type === 'quiz';
          const [icon, label] = state === 'open' ? ['⏳', quiz ? 'à faire' : 'pas rendu'] : ['❌', quiz ? 'non fait, fermé' : 'non rendu, fermé'];
          a.classList.add(`wdm-is-${state}`);
          item?.classList.add(`wdm-event-${state}`);
          a.title = (a.title ? a.title + ' ' : '') + `(${label})`;
          a.insertAdjacentHTML('afterbegin', `<span class="wdm-done" aria-label="${label}">${icon}</span>`);
          return;
        }
        a.classList.add('wdm-is-done');
        item?.classList.add('wdm-event-done');
        a.title = (a.title ? a.title + ' ' : '') + (type === 'quiz' ? `(terminé${grade ? ', ' + grade : ''})` : '(rendu)');
        a.insertAdjacentHTML('afterbegin', `<span class="wdm-done" aria-label="fait">✅</span>${grade ? `<span class="wdm-grade">${grade}</span>` : ''}`);
      });
    });
  }

  // Bug Moodle : passer d'un cours à "Tous les cours" garde la catégorie du cours (seuls ses événements restent).
  // On recharge donc la page avec le bon filtre au lieu de laisser Moodle rafraîchir en AJAX.
  document.addEventListener('change', (e) => {
    if (!e.target.matches('select.cal_courses_flt')) return;
    e.stopImmediatePropagation();
    const u = new URL(location.href);
    u.searchParams.set('course', e.target.value);
    location.href = u.href;
  }, true);

  // Boutons ENT, Mail, FlopStudent, Absences, Notes dans la barre du haut (icône du site, sinon icône FontAwesome)
  const QUICK = [
    ['ENT', 'https://ent.univ-tlse2.fr/', 'https://www.google.com/s2/favicons?domain=ent.univ-tlse2.fr&sz=32', 'fa-university'],
    ['Mail', 'https://scout.univ-toulouse.fr/flatx/#tool=mail&folderoid=1245692295', 'https://scout.univ-toulouse.fr/favicon.ico', 'fa-envelope'],
    ['FlopStudent', 'https://flopstudent.belucraft.fr/schedule', null, 'fa-calendar'], // son favicon est transparent
    ['Absences', 'https://webetud.iut-blagnac.fr/gestabs/etudiant.php?dpt=INFO', 'https://webetud.iut-blagnac.fr/gestabs/assets/icon.png', 'fa-user-times'],
    ['Notes', 'https://scodocetudiant.iut-blagnac.fr/', 'https://scodocetudiant.iut-blagnac.fr/favicon.ico', 'fa-graduation-cap'],
  ];
  function addQuickLinks() {
    const right = document.querySelector('nav.navbar ul.navbar-nav.ml-auto');
    if (!right || right.querySelector('.wdm-quick')) return;
    const li = document.createElement('li');
    li.className = 'nav-item wdm-quick';
    QUICK.forEach(([label, href, icon, fa]) => {
      const a = document.createElement('a');
      a.href = href; a.target = '_blank'; a.rel = 'noopener'; a.title = label; a.setAttribute('aria-label', label); // texte masqué sur téléphone
      const faIcon = () => Object.assign(document.createElement('i'), { className: `icon fa ${fa} fa-fw` });
      if (!icon) { a.append(faIcon(), label); li.appendChild(a); return; } // pas d'icône exploitable : FontAwesome
      const img = document.createElement('img');
      img.src = icon; img.alt = '';
      img.onerror = () => img.replaceWith(faIcon());
      setTimeout(() => { if (!img.naturalWidth) img.onerror(); }, 3000); // site injoignable (hors réseau univ) : pas d'attente infinie
      a.append(img, label);
      li.appendChild(a);
    });
    right.prepend(li);
  }

  function init() {
    buildToc(); buildMenu(); addEmojis(); markSubmitted(); addQuickLinks();
    // Le calendrier recharge ses mois en AJAX : on re-marque les nouveaux liens
    let t;
    new MutationObserver(() => { clearTimeout(t); t = setTimeout(markSubmitted, 200); })
      .observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();