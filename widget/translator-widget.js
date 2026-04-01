(function () {
  async function callTranslate({ supabaseUrl, supabaseAnonKey, edgeFunctionName, sourceText, sourceLang, targetLang }) {
    const endpoint = `${supabaseUrl}/functions/v1/${edgeFunctionName}`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseAnonKey}`,
        apikey: supabaseAnonKey,
      },
      body: JSON.stringify({ sourceText, sourceLang, targetLang }),
    });

    const data = await res.json();
    if (!res.ok && res.status !== 207) {
      throw new Error(data.error || "Translation request failed");
    }

    return data;
  }

  async function fetchHistory({ supabaseUrl, supabaseAnonKey }) {
    const url = `${supabaseUrl}/rest/v1/translations?select=source_text,translated_text,source_lang,target_lang,created_at&order=created_at.desc&limit=5`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${supabaseAnonKey}`,
        apikey: supabaseAnonKey,
      },
    });

    if (!res.ok) {
      return [];
    }

    return res.json();
  }

  function renderHistory(history, historyListEl) {
    historyListEl.innerHTML = "";
    history.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = `[${item.source_lang} → ${item.target_lang}] ${item.source_text} => ${item.translated_text}`;
      historyListEl.appendChild(li);
    });
  }

  function mount(config) {
    const {
      rootId,
      supabaseUrl,
      supabaseAnonKey,
      edgeFunctionName = "translate",
      defaultSourceLang = "English",
      defaultTargetLang = "Spanish",
    } = config;

    const root = document.getElementById(rootId);
    if (!root) {
      throw new Error(`Root element #${rootId} not found.`);
    }

    root.innerHTML = `
      <div class="ai-translator">
        <h3>AI Translator</h3>
        <div class="ai-translator__row">
          <select id="ai-source-lang">
            <option>English</option><option>Spanish</option><option>French</option><option>German</option><option>Japanese</option><option>Arabic</option><option>Indonesian</option><option>Malay</option><option>Thai</option><option>Vietnamese</option><option>Filipino (Tagalog)</option><option>Burmese (Myanmar)</option><option>Khmer (Cambodian)</option><option>Lao</option><option>Javanese</option><option>Sundanese</option>
          </select>
          <select id="ai-target-lang">
            <option>Spanish</option><option>English</option><option>French</option><option>German</option><option>Japanese</option><option>Arabic</option><option>Indonesian</option><option>Malay</option><option>Thai</option><option>Vietnamese</option><option>Filipino (Tagalog)</option><option>Burmese (Myanmar)</option><option>Khmer (Cambodian)</option><option>Lao</option><option>Javanese</option><option>Sundanese</option>
          </select>
        </div>
        <textarea id="ai-source-text" placeholder="Type text to translate..."></textarea>
        <div class="ai-translator__row">
          <button id="ai-translate-btn">Translate</button>
        </div>
        <div id="ai-error" class="ai-translator__error"></div>
        <div id="ai-output" class="ai-translator__output"></div>
        <div class="ai-translator__history">
          <strong>Recent translations</strong>
          <ul id="ai-history-list"></ul>
        </div>
      </div>
    `;

    const sourceLangEl = root.querySelector("#ai-source-lang");
    const targetLangEl = root.querySelector("#ai-target-lang");
    const sourceTextEl = root.querySelector("#ai-source-text");
    const translateBtnEl = root.querySelector("#ai-translate-btn");
    const outputEl = root.querySelector("#ai-output");
    const errorEl = root.querySelector("#ai-error");
    const historyListEl = root.querySelector("#ai-history-list");

    sourceLangEl.value = defaultSourceLang;
    targetLangEl.value = defaultTargetLang;

    async function refreshHistory() {
      const history = await fetchHistory({ supabaseUrl, supabaseAnonKey });
      renderHistory(history, historyListEl);
    }

    translateBtnEl.addEventListener("click", async () => {
      errorEl.textContent = "";
      outputEl.textContent = "";

      const sourceText = sourceTextEl.value.trim();
      if (!sourceText) {
        errorEl.textContent = "Please enter text to translate.";
        return;
      }

      translateBtnEl.disabled = true;
      translateBtnEl.textContent = "Translating...";

      try {
        const data = await callTranslate({
          supabaseUrl,
          supabaseAnonKey,
          edgeFunctionName,
          sourceText,
          sourceLang: sourceLangEl.value,
          targetLang: targetLangEl.value,
        });

        outputEl.textContent = data.translatedText || "No translation returned.";

        if (data.error && data.details) {
          errorEl.textContent = `${data.error}: ${data.details}`;
        }

        await refreshHistory();
      } catch (err) {
        errorEl.textContent = err.message || "Unexpected error";
      } finally {
        translateBtnEl.disabled = false;
        translateBtnEl.textContent = "Translate";
      }
    });

    refreshHistory();
  }

  window.AITranslatorWidget = { mount };
})();
