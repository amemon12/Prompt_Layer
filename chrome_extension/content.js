console.log("Prompt Layer content script loaded");

function getInputElement() {
  return (
    document.querySelector('#prompt-textarea') ||
    document.querySelector('div[contenteditable="true"]')
  );
}

function getPromptText() {
  const el = getInputElement();
  if (!el) return '';
  return el.innerText || el.value || '';
}

function setPromptText(text) {
  const el = getInputElement();
  if (!el) return;

  if (el.tagName === 'TEXTAREA') {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
    setter.call(el, text);
  } else {
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    range.deleteContents();
    range.insertNode(document.createTextNode(text));
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
  }

  el.dispatchEvent(new Event('input', { bubbles: true }));
}

function addRefineButton() {
  if (document.getElementById('pl-refine-btn')) return;

  const input = getInputElement();
  if (!input) return;

  // Find the mic button to insert before it
  const micBtn = document.querySelector(
    'button[aria-label*="voice" i], button[aria-label*="mic" i], button[data-testid*="voice" i], button[data-testid*="mic" i]'
  );

  const btn = document.createElement('button');
  btn.id = 'pl-refine-btn';
  btn.innerHTML = `<span style="font-size:11px;letter-spacing:0.03em;">✦ Refine</span>`;
  btn.style.cssText = `
    z-index: 9999;
    background: #1a1a1a;
    color: #f0f0f0;
    border: 1px solid #333;
    border-radius: 6px;
    padding: 5px 11px;
    cursor: pointer;
    font-size: 12px;
    font-family: sans-serif;
    box-shadow: 0 1px 6px rgba(0,0,0,0.4);
    transition: background 0.15s, color 0.15s;
    line-height: 1;
    margin-right: 4px;
    vertical-align: middle;
    flex-shrink: 0;
  `;

  btn.addEventListener('mouseenter', () => { btn.style.background = '#2e2e2e'; btn.style.color = '#fff'; });
  btn.addEventListener('mouseleave', () => { btn.style.background = '#1a1a1a'; btn.style.color = '#f0f0f0'; });

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    const prompt = getPromptText().trim();
    if (!prompt) {
      alert('Type a prompt first, then click Refine.');
      return;
    }

    btn.innerHTML = `<span style="font-size:11px;letter-spacing:0.03em;">· · ·</span>`;
    btn.disabled = true;

    try {
      if (!chrome.runtime?.id) {
        btn.innerHTML = `<span style="font-size:11px;letter-spacing:0.03em;">✦ Refine</span>`;
        btn.disabled = false;
        alert('Extension was reloaded — please refresh the page.');
        return;
      }

      chrome.runtime.sendMessage({ type: 'REFINE_PROMPT', prompt }, (response) => {
        btn.innerHTML = `<span style="font-size:11px;letter-spacing:0.03em;">✦ Refine</span>`;
        btn.disabled = false;

        if (chrome.runtime.lastError) {
          alert('Extension error: ' + chrome.runtime.lastError.message);
          return;
        }

        if (response?.error) {
          alert('Error: ' + response.error);
          return;
        }

        if (response?.refined) {
          setPromptText(response.refined);
        }
      });
    } catch (err) {
      btn.innerHTML = `<span style="font-size:11px;letter-spacing:0.03em;">✦ Refine</span>`;
      btn.disabled = false;
      alert('Extension error — please refresh the page.');
    }
  });

  if (micBtn) {
    micBtn.parentElement.insertBefore(btn, micBtn);
  } else {
    const container = input.closest('form') || input.parentElement;
    if (!container) return;
    container.appendChild(btn);
  }
}

// Re-inject button on DOM changes (ChatGPT is a SPA)
const observer = new MutationObserver(() => {
  if (getInputElement() && !document.getElementById('pl-refine-btn')) {
    addRefineButton();
  }
});

observer.observe(document.body, { childList: true, subtree: true });
addRefineButton();
