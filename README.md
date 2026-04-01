# AI Translator Widget (Supabase + OpenAI)

This repository contains an embeddable AI translation app you can drop into any website and connect to Supabase for storage.

## What you get

- **Embeddable translator widget** (plain JS + CSS, no framework required)
- **Supabase database schema** to store translation history
- **Supabase Edge Function** that calls OpenAI securely (API key stays server-side)
- **Example embed snippet** for any existing website

---

## 1) Create your Supabase table

Run the SQL in `supabase/schema.sql` inside the Supabase SQL editor.

This creates a `translations` table with:
- source text
- translated text
- source + target languages
- model used
- timestamp

---

## 2) Deploy the Edge Function

Function source: `supabase/functions/translate/index.ts`

### Required secrets

Set these in your Supabase project:

- `OPENAI_API_KEY` (your OpenAI key)

### Deploy

```bash
supabase functions deploy translate
```

---

## 3) Configure Row Level Security (RLS)

`schema.sql` enables RLS.

For quick start, this policy allows inserts + reads for anonymous users.
For production, you should tighten policies (for example, only allow access per authenticated user/session).

---

## 4) Add widget files to your site

Include these files from this repo:

- `widget/translator-widget.css`
- `widget/translator-widget.js`

### Embed HTML

```html
<link rel="stylesheet" href="/path/to/translator-widget.css" />
<div id="ai-translator-root"></div>
<script src="/path/to/translator-widget.js"></script>
<script>
  window.AITranslatorWidget.mount({
    rootId: "ai-translator-root",
    supabaseUrl: "https://YOUR_PROJECT.supabase.co",
    supabaseAnonKey: "YOUR_SUPABASE_ANON_KEY",
    edgeFunctionName: "translate",
    defaultSourceLang: "English",
    defaultTargetLang: "Spanish"
  });
</script>
```

---

## 5) How it works

1. User enters text + languages in widget.
2. Widget calls Supabase Edge Function (`/functions/v1/translate`).
3. Edge Function requests translation from OpenAI.
4. Edge Function stores translation in Supabase `translations` table.
5. Widget renders translated result + recent history.

---

## Notes

- This starter uses `gpt-4o-mini` by default for cost/speed balance.
- If you want auth-aware history, add Supabase Auth and tie records to `auth.uid()`.
- If you want glossaries or tone controls, extend the prompt in `index.ts`.
