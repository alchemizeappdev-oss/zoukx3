# Security Policy

## Reporting a Vulnerability

Do **not** open a public GitHub issue for security findings.

Email: info@zuok.ai (or your contact)

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested fix

You will receive a response within 48 hours. We ask that you give us reasonable time to remediate before any public disclosure.

## Scope

- Client-side code in `index.html` and `ios-frame.jsx`
- Server-side edge function in `api/chat.js`
- Deployment configuration in `vercel.json`

## Out of scope

- Third-party CDN libraries (report to their maintainers)
- Hugging Face Inference API (report to HuggingFace)
