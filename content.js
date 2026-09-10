// DateHeure AutoFill v1.2.0 — Content Script

// Éviter la double-injection
if (!window.__dateheureAutofillLoaded) {
  window.__dateheureAutofillLoaded = true;

  let lastEditableElement = null;
  let lastSelectionRange = null;

  document.addEventListener('focusin', (e) => {
    const el = e.target;
    if (
      el.tagName === 'INPUT' ||
      el.tagName === 'TEXTAREA' ||
      el.isContentEditable
    ) {
      lastEditableElement = el;
    }
  });

  document.addEventListener('contextmenu', () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      lastSelectionRange = sel.getRangeAt(0).cloneRange();
    }
  });

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action !== 'insertDateHeure') return;

    const el = lastEditableElement;
    if (!el) return;

    // Champs classiques : input, textarea
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      const start = el.selectionStart ?? el.value.length;
      const end = el.selectionEnd ?? el.value.length;
      const value = el.value;
      el.focus();
      el.value = value.slice(0, start) + msg.texte + value.slice(end);
      el.selectionStart = el.selectionEnd = start + msg.texte.length;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      return;
    }

    // Champs contenteditable (Gmail, Notion, etc.)
    if (el.isContentEditable) {
      el.focus();
      if (lastSelectionRange) {
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(lastSelectionRange);
      }
      document.execCommand('insertText', false, msg.texte);
    }
  });
}
