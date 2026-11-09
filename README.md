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

Rename the [`.env.example`](.env.example) file to `.env`. The defaults should work out of the box, but you may want to configure the port if it conflicts with an existing process.

Install the Studio project dependencies by running:

```bash
pnpm install
```

To start the app, run:

```bash
pnpm dev
```

## Building

```bash
pnpm build
```

You can preview the production build with `pnpm preview`.

If you're using Apache to serve the site, set `FallbackResource` to `./dist/index.html` so Vue's routing system works properly.

```xml
<VirtualHost *:80>
  DocumentRoot /your/site/path/here/dist
  FallbackResource /index.html
</VirtualHost>
```

## Authentication

> [!IMPORTANT]
> This process is only necessary if you need to access user-specific pages, such as the profile editor or add-on form. Public pages like the dashboard and texture gallery can be used with the public API.

Setting up local Faithful Studio authentication is a somewhat involved process, but it only has to be done once to work every time. This section assumes that you've already set up the Faithful Studio to work without logins as described above.

### Setting up OAuth with the Faithful API

Note that this does not require a Firestorm write token to work, so no special permission is needed to make this work.

1. Clone the [Faithful API](https://github.com/Faithful-Resource-Pack/API) repository, and follow its setup instructions as specified in the project README.
2. Log into the **[Discord Developer Portal](https://discord.com/developers/applications)**.
3. Create an application and navigate to the **OAuth2** tab in its settings.
4. Under **Client information**, copy the client ID and secret, and paste it in the API `.env` file you created after `DISCORD_CLIENT_ID=` and `DISCORD_CLIENT_SECRET=`, respectively.
5. Under **Redirects**, create a URI called `http://localhost:<PORT>/v2/auth/discord/callback/studio`, where `<PORT>` is the API `PORT` value in its `.env` file.
6. If you changed your Faithful Studio `PORT` for any reason, you should update the `studio` URL in `AUTH_URLS` to point to the new port.

### Connecting your OAuth back to the Faithful Studio

1. Now back in the Studio repository, open the `.env` file you created.
2. Set your `VITE_API_URL` to `http://localhost:<PORT>`, where `<PORT>` is again the port for the API. Make sure to not include a trailing slash in the URL.
3. Start your local copy of the Faithful API.

From here, you can start the app as normal. As long as your copy of the Faithful API is also online, logins should run through `http://localhost:<LOCAL_API_PORT>` and your custom-created Discord application rather than `https://api.faithfulpack.net`, letting you access user data.

## API Reference

This project uses the Faithful API for retrieving and writing most dynamic data, such as texture information, user contributions, and available resource packs. Check out our [API reference](https://api.faithfulpack.net/docs) for documentation about each API endpoint, its associated types, and user authentication.

## Translating

Many messages shown throughout the site can be translated into users' native languages for easier usage. Our translation service is powered by Crowdin, [and you can start translating there](https://faithful.crowdin.com/studio) by clicking on your language in the list. Please contact us on our Discord server if a language you want to translate isn't listed.
