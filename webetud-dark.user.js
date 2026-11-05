// ==UserScript==
// @name         Webetud Dark Modern
// @namespace    https://webetud.iut-blagnac.fr/
// @version      2.1.0
// @description  Thème sombre moderne (accent indigo) pour Webetud (Moodle 4, thème classic)
// @match        https://webetud.iut-blagnac.fr/*
// @updateURL    https://raw.githubusercontent.com/VivienR67/Extension-Webetud-Dark---IUT-Blagnac/main/webetud-dark.user.js
// @downloadURL  https://raw.githubusercontent.com/VivienR67/Extension-Webetud-Dark---IUT-Blagnac/main/webetud-dark.user.js
// @homepageURL  https://github.com/VivienR67/Extension-Webetud-Dark---IUT-Blagnac
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
.border, .border-top, .border-bottom, .border-left, .border-right, .border-start, .border-end { border-color: var(--border) !important; }
.btn-close { filter: invert(1) grayscale(1) brightness(2); } /* Bootstrap 5 : croix noire en SVG */

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
#usernavigation .divider { background: var(--border) !important; }

/* Colonne de gauche : menu du script (remplace le bloc Navigation de Moodle 4) */
.wdm-menu { padding: 4px 0 !important; }
.wdm-burger { display: none !important; } /* bouton ☰ : téléphone seulement */
.wdm-menu .list-group + .list-group { margin-top: .5rem; }
.wdm-nav-title { padding: .5rem 1rem .25rem; font-size: .75rem; font-weight: 600; text-transform: uppercase; letter-spacing: .08em; color: var(--muted); }
.wdm-emoji { display: inline-block; width: 1.28571em; text-align: center; margin-right: .5rem; font-size: 1.05em; }
.list-group-item {
  background: var(--surface) !important;
  color: var(--text) !important;
  border-color: var(--border) !important;
}
.wdm-menu .list-group-item { background: transparent !important; border: none !important; margin: 2px 6px; padding: .45rem .7rem; border-radius: 8px !important; width: auto; font-size: .92rem; }
.wdm-menu .list-group-item-action:hover { background: var(--surface-2) !important; }
.wdm-menu .media { display: flex; align-items: center; } /* .media n'existe plus en Bootstrap 5 */
.wdm-menu .media-body { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.list-group-item.active {
  background: var(--accent-soft) !important;
  color: var(--accent-hover) !important;
  box-shadow: inset 3px 0 0 var(--accent);
}
.list-group-item.active * { color: var(--accent-hover) !important; }
/* Colonnes de blocs : la région pleine largeur (classic la fait flotter à droite) */
.blockcolumn > [data-region="blocks-column"] { float: none !important; width: auto !important; }

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
.course-section.hidden .section-item, .course-section.orphaned .section-item { background: transparent !important; } /* sections "Non disponible" : fond clair chez Moodle 4 */
.availabilityinfo { background: var(--surface-2) !important; border-radius: 8px; }
.availabilityinfo, .availabilityinfo * { color: var(--muted) !important; }
.resourcelinkdetails { color: var(--muted) !important; }
.btn-success { background: rgba(31,157,85,.2) !important; border-color: #1f9d55 !important; color: #4ade80 !important; } /* bouton "Terminé" (achèvement) */
.activity-header { background: var(--surface-2) !important; border-radius: 10px; } /* Moodle 4 : dates / achèvement en haut des activités */

/* Breadcrumb */
.breadcrumb { background: transparent !important; border: none !important; } /* Moodle ajoute une bordure claire sur téléphone */
.breadcrumb-item + .breadcrumb-item::before { color: var(--muted) !important; }

/* Buttons */
.btn { border-radius: 8px !important; transition: all .15s; color: var(--text); } /* boutons sans couleur (ex. listes du carnet de notes) : texte sombre sinon */
.btn-primary, .btn-primary:not(:disabled):not(.disabled):active {
  background: var(--accent) !important; border-color: var(--accent) !important; color: #fff !important;
}
.btn-primary:hover, .btn-primary:focus { background: var(--accent-hover) !important; border-color: var(--accent-hover) !important; }
.btn-secondary, .btn-light, .btn-outline-secondary, .btn-submit {
  background: var(--surface-2) !important; border-color: var(--border) !important; color: var(--text) !important;
}
.btn-secondary:hover, .btn-light:hover { background: var(--border) !important; }
.btn-link { color: var(--accent-hover) !important; }
.btn-icon { background: var(--surface-2) !important; color: var(--accent-hover) !important; } /* Moodle 4 : bouton replier une section */
.btn:focus, .form-control:focus, .custom-select:focus, .form-select:focus { box-shadow: 0 0 0 3px var(--accent-soft) !important; }

/* Forms */
.form-control, .custom-select, .form-select, input[type=text], input[type=search], input[type=password], input[type=email], textarea, select {
  background: var(--surface-2) !important;
  border: 1px solid var(--border) !important;
  color: var(--text) !important;
  border-radius: 8px !important;
}
.form-control:focus, .custom-select:focus, .form-select:focus { border-color: var(--accent) !important; }
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
.close, .close * { color: var(--text) !important; text-shadow: none !important; }
/* Moodle 4 : restes de fonds ou textes clairs/sombres (notes, cours, fichiers, participants) */
.user-report-container { background: transparent !important; }
.categoryname { color: var(--muted) !important; }
.fp-filename { background: transparent !important; }
.bg-secondary { background-color: var(--border) !important; }
.form-autocomplete-downarrow { color: var(--muted) !important; }

/* Tables */
.table, table.generaltable, table.flexible { color: var(--text) !important; background: transparent !important; }
.table th, .table td, .generaltable th, .generaltable td { border-color: var(--border) !important; background: transparent !important; }
.generaltable thead th, .table thead th { background: var(--surface-2) !important; }
.generaltable tbody tr:nth-of-type(2n) { background: transparent !important; } /* Moodle 4 : lignes paires en blanc */
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
.maincalendar .calendarmonth .clickable:hover { background-color: var(--surface-2) !important; } /* Moodle : gris clair au survol */
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
.login-container { background: var(--surface) !important; border: 1px solid var(--border); border-radius: var(--radius); box-shadow: var(--shadow) !important; }
.login-container .divider { background: var(--border) !important; }
.login-identityprovider-btn { background: var(--surface-2) !important; border: 1px solid var(--border) !important; color: var(--text) !important; }

/* Minuteur des QCM : fond blanc chez Moodle ; les paliers rouges (timeleftN) restent ceux de Moodle */
body #quiz-timer-wrapper #quiz-timer:not([class*="timeleft"]) { background-color: var(--surface-2); color: var(--text); }

/* Sélecteur de fichiers (dépôt de devoir, fichiers personnels) */
.file-picker .fp-content, .fp-panel-button, .fp-iconview .fp-thumbnail:hover,
body .filemanager .yui3-datatable-header, .filepicker-filelist .dndupload-target, .filemanager-container .dndupload-target,
.filemanager.fp-select .fp-reflist .fp-value { background: var(--surface) !important; color: var(--text) !important; border-color: var(--border) !important; }
/* "body" : Moodle met déjà !important sur ces cellules, il faut un sélecteur plus fort */
body .filemanager .yui3-datatable-odd .yui3-datatable-cell { background-color: var(--surface-2) !important; border-color: var(--surface-2) !important; }
body .filemanager .yui3-datatable-even .yui3-datatable-cell { background-color: var(--surface) !important; border-color: var(--surface) !important; }
.file-picker .fp-list .fp-repo.active, .file-picker .ygtvfocus, .filemanager .ygtvfocus { background: var(--accent-soft) !important; }
.fitem.disabled .filepicker-filelist, .fitem.disabled .filemanager-container { background-color: var(--surface-2) !important; }
input[type=file] { color: var(--muted); }
input[type=file]::file-selector-button { background: var(--surface-2); color: var(--text); border: 1px solid var(--border); border-radius: 8px; padding: .3rem .7rem; margin-right: .6rem; cursor: pointer; }

/* Simplification : blocs redondants masqués (arbre de navigation, liste de cours = déjà dans le menu, recherche forums) */
.block_navigation, .block_course_list, .block_search_forums { display: none !important; }
.block .card-title, .block h5 { font-size: .95rem; text-transform: uppercase; letter-spacing: .06em; color: var(--muted) !important; }
img { border-radius: 8px; }

/* Sommaire du cours (ajouté par le script, en bas de la colonne de droite) */
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
  #usernavigation { flex-wrap: nowrap !important; align-items: center; min-width: 0; }
  #usernavigation > * { flex-shrink: 0; }
  nav.navbar .nav-link, nav.navbar .popover-region-toggle { padding-left: .35rem !important; padding-right: .35rem !important; }
  /* Menu de gauche en tiroir ouvert par ☰, comme l'ancien Moodle (sinon Moodle 4 le met tout en bas de la page) */
  .wdm-burger { display: inline-flex !important; align-items: center; padding: .25rem .4rem !important; margin-right: .25rem; font-size: 1.1rem; }
  nav.navbar .navbar-brand, #usernavigation > .divider { display: none !important; } /* place pour ☰ + raccourcis ; Accueil est dans le menu */
  .block.wdm-menu { /* .block : passe devant le border-radius des cartes plus bas */
    position: fixed !important; top: 0; bottom: 0; left: 0; z-index: 1040; width: min(85vw, 300px);
    margin: 0 !important; border-radius: 0 16px 16px 0 !important; overflow-y: auto;
    transform: translateX(-105%); transition: transform .2s;
  }
  body.wdm-menu-open .block.wdm-menu { transform: none; }
  body.wdm-menu-open::after { content: ''; position: fixed; inset: 0; z-index: 1035; background: rgba(0,0,0,.55); }
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
    // Dans la colonne elle-même (haute comme la page) pour que le sticky tienne jusqu'en bas
    const region = document.querySelector('.columnright.has-blocks') || document.querySelector('.columnleft');
    if (!sections.length || !region || document.getElementById('wdm-toc')) return;

    const toc = document.createElement('nav');
    toc.id = 'wdm-toc';
    toc.className = 'block card';
    toc.innerHTML = '<h5>Sommaire</h5>';
    sections.forEach((sec) => {
      const name = sec.querySelector('.sectionname')?.textContent.trim();
      if (!name) return;
      const a = document.createElement('a');
      a.href = '#' + sec.id; // Moodle 4 : le titre mène à section.php, on reste sur la page du cours
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

  // Menu de gauche : pages générales, matières du S1 et pages de l'ancien bloc "Navigation".
  // ponytail: liens en dur pour BUT Info S1 ; au S2, remplacer les URLs (copiées du bloc Navigation).
  const BASE = 'https://webetud.iut-blagnac.fr';
  const MENU = [
    ['Navigation', [
      ['Accueil', '/', '🏠'],
      ['Tableau de bord', '/my/', '🧭'],
      ['Calendrier', '/calendar/view.php?view=month', '📅'],
      ['Fichiers personnels', '/user/files.php', '📁'],
    ]],
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
    const column = document.querySelector('.columnleft [data-region="blocks-column"]');
    if (!column || document.querySelector('.wdm-menu')) return;
    const here = location.href;
    // Dans un cours : ses pages Participants / Notes, comme l'ancien tiroir de Moodle 3
    const course = document.body.className.match(/\bcourse-(\d+)\b/)?.[1];
    const menu = course && course !== '1'
      ? [MENU[0], ['Ce cours', [
          ['Participants', '/user/index.php?id=' + course, '👥'],
          ['Notes', '/grade/report/index.php?id=' + course, '📝'],
        ]], ...MENU.slice(1)]
      : MENU;
    const block = document.createElement('section');
    block.className = 'block card mb-3 wdm-menu';
    menu.forEach(([title, items]) => {
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
      block.appendChild(nav);
    });
    column.prepend(block);

    // Téléphone : bouton ☰ dans la barre du haut ; un clic en dehors du menu le referme
    const burger = document.createElement('button');
    burger.type = 'button';
    burger.className = 'btn wdm-burger';
    burger.setAttribute('aria-label', 'Menu');
    burger.setAttribute('aria-expanded', 'false');
    burger.innerHTML = '<i class="icon fa fa-bars fa-fw m-0" aria-hidden="true"></i>';
    burger.onclick = () => burger.setAttribute('aria-expanded', document.body.classList.toggle('wdm-menu-open'));
    document.querySelector('nav.navbar .navbar-brand')?.before(burger);
    document.addEventListener('click', (e) => {
      if (e.target.closest('.wdm-menu, .wdm-burger')) return;
      document.body.classList.remove('wdm-menu-open');
      burger.setAttribute('aria-expanded', 'false');
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
      // Moodle 4 : une carte par tentative (table.quizreviewsummary, ligne "Statut | Terminée")
      const ok = [...doc.querySelectorAll('.quizreviewsummary tr')].some((tr) => /Terminée|Finished/i.test(tr.textContent));
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
    const right = document.getElementById('usernavigation');
    if (!right || right.querySelector('.wdm-quick')) return;
    const li = document.createElement('div');
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
    buildToc(); buildMenu(); markSubmitted(); addQuickLinks();
    // Le calendrier recharge ses mois en AJAX : on re-marque les nouveaux liens
    let t;
    new MutationObserver(() => { clearTimeout(t); t = setTimeout(markSubmitted, 200); })
      .observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();