# Zuok

Dark-luxury AI chat interface. Multiple intelligence modes powered by Hugging Face Inference API.

## Stack

- Static HTML + React (CDN) frontend
- Vercel Edge Function for AI proxy (`api/chat.js`)
- Hugging Face Inference API (Mistral, Llama, Qwen, Mixtral)

## Local development

Requires [Vercel CLI](https://vercel.com/docs/cli):

```bash
npm install -g vercel
vercel dev
```

Set `HF_KEY` in your Vercel project environment variables (server-side only — never in source).

## Deploy

1. Push to GitHub
2. Import repo at [vercel.com/new](https://vercel.com/new)
3. Add environment variable: `HF_KEY=hf_...`
4. Deploy

## Intelligence modes

| Mode | Model |
|---|---|
| Uncensored | Mistral-7B-Instruct-v0.3 |
| Prime | Llama-3.1-8B-Instruct |
| Code | Qwen2.5-Coder-7B-Instruct |
| Deep | Mixtral-8x7B-Instruct-v0.1 |
| Vision | Llama-3.2-11B-Vision-Instruct |

## Security

API keys are never in source code or build artifacts. All inference calls go through the server-side edge function. See [SECURITY.md](SECURITY.md) to report vulnerabilities.
