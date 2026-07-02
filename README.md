<a href="https://studio.faithfulpack.net" target="_blank">
  <img
    src="https://database.faithfulpack.net/images/branding/logos/transparent/hd/main_logo.png?w=256"
    alt="Faithful Logo"
    height="256"
    align="right"
  >
</a>
<div align="center">
  <h1>Faithful Studio</h1>
  <h3>Web application for managing Faithful user-created content and profiles with ease.</h3>

  ![RepoSize](https://img.shields.io/github/repo-size/Faithful-Resource-Pack/Studio)
  ![Issues](https://img.shields.io/github/issues/Faithful-Resource-Pack/Studio)
  ![PullRequests](https://img.shields.io/github/issues-pr/Faithful-Resource-Pack/Studio)

  ![Status](https://status.faithfulpack.net/api/badge/4/status)
  ![Uptime](https://status.faithfulpack.net/api/badge/4/uptime/24?label=24h%20&labelSuffix=Uptime)
</div>

---

## Requirements

- Node.js v22+ (https://nodejs.org)
- pnpm (`corepack enable` + `corepack prepare pnpm@latest --activate`)

## Running

```bash
pnpm install
```

```bash
pnpm dev
```

## Building

```bash
pnpm build
```

You can preview the production build with `pnpm preview`.

If you're using Apache to serve the site, make sure to set `FallbackResource` to point to `./dist/index.html` so Vue routing works properly.

```xml
<VirtualHost *:80>
  DocumentRoot /your/site/path/here/dist
  FallbackResource /index.html
</VirtualHost>
```

## API Reference

This project uses the Faithful API for retrieving and writing most dynamic data, such as texture information, user contributions, and available resource packs. Check out our [API reference](https://api.faithfulpack.net/docs) for documentation about each API endpoint, its associated types, and user authentication.

## Translating

Many messages shown throughout the site can be translated into users' native languages for easier usage. Our translation service is powered by Crowdin, [and you can start translating there](https://faithful.crowdin.com/studio) by clicking on your language in the list. Please contact us on our Discord server if a language you want to translate isn't listed.
