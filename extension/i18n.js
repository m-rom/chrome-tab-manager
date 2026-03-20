const translations = {
  en: {
    searchPlaceholder: 'Search tabs...',
    closeOld: 'Close old (>7d)',
    allWindows: 'All windows',
    windowLabel: 'Window',
    windowGrouping: 'Windows',
    windowGroupingOn: 'Window grouping on',
    windowGroupingOff: 'Window grouping off',
    themeToggle: 'Toggle theme',
    tabsInWindows: (tabs, windows) =>
      `${tabs} tabs in ${windows} ${windows === 1 ? 'window' : 'windows'}`,
    windowHeader: (index, count) => `Window ${index} — ${count} tabs`,
    noTabs: 'No tabs open',
    closeAll: 'Close all',
    closeTab: 'Close tab',
    confirmCloseAllDomain: (count, domain) =>
      `Close ${count} tabs from ${domain}?`,
    confirmCloseOld: (count) =>
      `Close ${count} tabs not visited in over 7 days?`,
    noOldTabs: 'No tabs found older than 7 days.',
    cancel: 'Cancel',
    close: 'Close',
    now: 'now',
    edgeBanner: 'Quick-open banner',
  },
  de: {
    searchPlaceholder: 'Tabs suchen...',
    closeOld: 'Alte schließen (>7d)',
    allWindows: 'Alle Fenster',
    windowLabel: 'Fenster',
    windowGrouping: 'Fenster',
    windowGroupingOn: 'Fenster-Gruppierung an',
    windowGroupingOff: 'Fenster-Gruppierung aus',
    themeToggle: 'Theme wechseln',
    tabsInWindows: (tabs, windows) =>
      `${tabs} Tabs in ${windows} ${windows === 1 ? 'Fenster' : 'Fenstern'}`,
    windowHeader: (index, count) => `Fenster ${index} — ${count} Tabs`,
    noTabs: 'Keine Tabs offen',
    closeAll: 'Alle schließen',
    closeTab: 'Tab schließen',
    confirmCloseAllDomain: (count, domain) =>
      `${count} Tabs von ${domain} schließen?`,
    confirmCloseOld: (count) =>
      `${count} Tabs schließen, die seit über 7 Tagen nicht besucht wurden?`,
    noOldTabs: 'Keine Tabs gefunden, die älter als 7 Tage sind.',
    cancel: 'Abbrechen',
    close: 'Schließen',
    now: 'jetzt',
    edgeBanner: 'Schnellöffner-Banner',
  },
  fr: {
    searchPlaceholder: 'Rechercher des onglets...',
    closeOld: 'Fermer anciens (>7j)',
    allWindows: 'Toutes les fenêtres',
    windowLabel: 'Fenêtre',
    windowGrouping: 'Fenêtres',
    windowGroupingOn: 'Groupement par fenêtre activé',
    windowGroupingOff: 'Groupement par fenêtre désactivé',
    themeToggle: 'Changer le thème',
    tabsInWindows: (tabs, windows) =>
      `${tabs} onglets dans ${windows} ${windows === 1 ? 'fenêtre' : 'fenêtres'}`,
    windowHeader: (index, count) => `Fenêtre ${index} — ${count} onglets`,
    noTabs: 'Aucun onglet ouvert',
    closeAll: 'Tout fermer',
    closeTab: 'Fermer l\'onglet',
    confirmCloseAllDomain: (count, domain) =>
      `Fermer ${count} onglets de ${domain} ?`,
    confirmCloseOld: (count) =>
      `Fermer ${count} onglets non visités depuis plus de 7 jours ?`,
    noOldTabs: 'Aucun onglet de plus de 7 jours trouvé.',
    cancel: 'Annuler',
    close: 'Fermer',
    now: 'maintenant',
    edgeBanner: 'Bandeau latéral',
  },
  es: {
    searchPlaceholder: 'Buscar pestañas...',
    closeOld: 'Cerrar antiguas (>7d)',
    allWindows: 'Todas las ventanas',
    windowLabel: 'Ventana',
    windowGrouping: 'Ventanas',
    windowGroupingOn: 'Agrupación por ventana activada',
    windowGroupingOff: 'Agrupación por ventana desactivada',
    themeToggle: 'Cambiar tema',
    tabsInWindows: (tabs, windows) =>
      `${tabs} pestañas en ${windows} ${windows === 1 ? 'ventana' : 'ventanas'}`,
    windowHeader: (index, count) => `Ventana ${index} — ${count} pestañas`,
    noTabs: 'No hay pestañas abiertas',
    closeAll: 'Cerrar todas',
    closeTab: 'Cerrar pestaña',
    confirmCloseAllDomain: (count, domain) =>
      `¿Cerrar ${count} pestañas de ${domain}?`,
    confirmCloseOld: (count) =>
      `¿Cerrar ${count} pestañas no visitadas en más de 7 días?`,
    noOldTabs: 'No se encontraron pestañas de más de 7 días.',
    cancel: 'Cancelar',
    close: 'Cerrar',
    now: 'ahora',
    edgeBanner: 'Banner lateral',
  },
};

function detectLanguage() {
  const lang = navigator.language.split('-')[0];
  return translations[lang] ? lang : 'en';
}

let currentLang = 'en';
let t = translations.en;

async function initI18n() {
  const { langPreference } = await chrome.storage.local.get('langPreference');
  currentLang = langPreference || detectLanguage();
  t = translations[currentLang] || translations.en;
}

async function setLanguage(lang) {
  currentLang = lang;
  t = translations[lang] || translations.en;
  await chrome.storage.local.set({ langPreference: lang });
}

function getAvailableLanguages() {
  return [
    { code: 'en', label: 'English' },
    { code: 'de', label: 'Deutsch' },
    { code: 'fr', label: 'Français' },
    { code: 'es', label: 'Español' },
  ];
}
