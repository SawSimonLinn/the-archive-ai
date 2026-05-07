# Security Policy

The Archive.ai handles private documents, authentication, billing, and AI provider credentials. Please report security issues privately.

## Supported Versions

Security fixes target the current `main` branch.

## Reporting a Vulnerability

Email `support@thearchiveai.xyz` with:

- A short summary of the issue.
- Reproduction steps or proof of concept details.
- The affected route, API endpoint, dependency, or configuration.
- Any logs or screenshots that help verify the impact.

Do not open a public GitHub issue for vulnerabilities involving document access, account access, service role keys, Stripe billing, webhook validation, authentication redirects, prompt injection data leakage, or exposed secrets.

## Secret Handling

- Use `.env.example` only as a template.
- Never commit `.env` or real production credentials.
- Rotate any key that may have been exposed in logs, screenshots, commits, issues, or pull requests.
