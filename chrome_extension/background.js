console.log("Prompt Layer background loaded");

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'REFINE_PROMPT') {
    refinePrompt(message.prompt).then(sendResponse);
    return true; // keep message channel open for async response
  }
});

async function refinePrompt(prompt) {
  try {
    const { apiKey } = await chrome.storage.local.get(['apiKey']);

    if (!apiKey) {
      return { error: 'No API key set. Open the extension and add your Claude API key in Settings.' };
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: `You are a prompt refinement expert. Improve the following prompt to be clearer, more specific, and more likely to get a great response. Return ONLY the refined prompt text, no explanation, no preamble.\n\nOriginal prompt:\n${prompt}`
        }]
      })
    });

    if (!response.ok) {
      const err = await response.json();
      return { error: err.error?.message || `API error ${response.status}` };
    }

    const data = await response.json();
    return { refined: data.content[0].text.trim() };
  } catch (err) {
    return { error: err.message };
  }
}
