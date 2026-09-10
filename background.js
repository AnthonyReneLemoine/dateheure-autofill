// DateHeure AutoFill v1.2.0

const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
              'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

function getDateHeureString() {
  const now = new Date();
  const jour = JOURS[now.getDay()];
  const numero = now.getDate();
  const mois = MOIS[now.getMonth()];
  const heures = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `nous sommes le ${jour} ${numero} ${mois} et il est ${heures}h${minutes}`;
}

chrome.contextMenus.removeAll(() => {
  chrome.contextMenus.create({
    id: 'insert-dateheure',
    title: 'Insérer date et heure',
    contexts: ['editable']
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== 'insert-dateheure') return;

  const texte = getDateHeureString();

  // Injecter le content script s'il n'est pas encore présent
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });
  } catch (e) {
    // Peut échouer sur chrome:// ou pages protégées, on ignore
    console.warn('Injection impossible :', e.message);
    return;
  }

  // Petit délai pour laisser le script s'initialiser
  setTimeout(() => {
    chrome.tabs.sendMessage(tab.id, { action: 'insertDateHeure', texte });
  }, 100);
});
