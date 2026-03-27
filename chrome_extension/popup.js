document.addEventListener("DOMContentLoaded", () => {
  const settingsBtn = document.querySelector("#settingsBtn");
  const backBtn = document.querySelector("#backBtn");
  const saveBtn = document.querySelector("#saveBtn");

  const mainView = document.querySelector("#mainView");
  const settingsView = document.querySelector("#settingsView");

  const apiKeyInput = document.querySelector("#apiKeyInput");
  const enabledToggle = document.querySelector("#enabledToggle");

  const statusDot   = document.querySelector("#statusDot");
  const statusTitle = document.querySelector("#statusTitle");
  const statusText  = document.querySelector("#statusText");
  const saveMessage = document.querySelector("#saveMessage");

  function showMainView() {
    mainView.style.display = "block";
    settingsView.style.display = "none";
  }

  function showSettingsView() {
    mainView.style.display = "none";
    settingsView.style.display = "block";
  }

  function setStatus(state) {
    statusDot.className = 'status-dot';
    if (state === 'ready') {
      statusDot.classList.add('ready');
      statusTitle.textContent = 'Ready';
      statusText.textContent = 'Refine button is active';
    } else if (state === 'disabled') {
      statusDot.classList.add('disabled');
      statusTitle.textContent = 'Disabled';
      statusText.textContent = 'Enable in Settings';
    } else {
      statusDot.classList.add('warning');
      statusTitle.textContent = 'Setup required';
      statusText.textContent = 'Add your API key in Settings';
    }
  }

  function setSaveMessage(message) {
    saveMessage.textContent = message;
    setTimeout(() => {
      saveMessage.textContent = "";
    }, 2000);
  }

  function loadSettings() {
    chrome.storage.local.get(["apiKey", "enabled"], (result) => {
      const apiKey = result.apiKey || "";
      const enabled = result.enabled ?? true;

      apiKeyInput.value = apiKey;
      enabledToggle.checked = enabled;

      if (apiKey && enabled) {
        setStatus('ready');
      } else if (!apiKey) {
        setStatus('setup');
      } else {
        setStatus('disabled');
      }
    });
  }

  function saveSettings() {
    const apiKey = apiKeyInput.value.trim();
    const enabled = enabledToggle.checked;

    chrome.storage.local.set(
      {
        apiKey: apiKey,
        enabled: enabled
      },
      () => {
        if (apiKey && enabled) {
          setStatus('ready');
        } else if (!apiKey) {
          setStatus('setup');
        } else {
          setStatus('disabled');
        }

        setSaveMessage("Settings saved.");
      }
    );
  }

  settingsBtn.addEventListener("click", () => {
    showSettingsView();
  });

  backBtn.addEventListener("click", () => {
    showMainView();
  });

  saveBtn.addEventListener("click", () => {
    saveSettings();
  });

  showMainView();
  loadSettings();
});