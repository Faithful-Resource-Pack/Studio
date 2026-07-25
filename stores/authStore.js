import { defineStore } from "pinia";
import discordTokenStore, { AUTH_STORAGE_KEY, CURRENT_USER_KEY } from "./discordTokenStore.js";
import axios from "axios";

/**
 * @callback Listener Auth listener type
 * @param {ReturnType<defineStore>} store Entire store instance with latest updates
 * @returns {void}
 */

/** handles user login, logout, and account switching */
export default defineStore("auth", {
	state: () => ({
		/** @type {import("vue/types/vue").Vue} keep app reference for snackbar access etc */
		app: null,
		/** @type {Listener[]} callbacks to fire whenever an auth change occurs */
		authListeners: [],

		// user information
		access_token: undefined,

		id: undefined,
		discordUsername: undefined,
		avatar: undefined,
		banner: undefined,

		username: undefined,
		uuid: undefined,
		roles: [],
		anonymous: false,
	}),
	actions: {
		/**
		 * Log into the application
		 * @param {import("vue/types/vue").Vue} app used for snackbar access etc
		 * @param {*} isDev used for good dev logging when diagnosing login issues
		 */
		async login(app, isDev) {
			this.app = app;
			const discordToken = discordTokenStore();

			discordToken.$subscribe(() => {
				const { access_token } = discordToken;
				const id = localStorage.getItem(CURRENT_USER_KEY);
				// logged out
				if (access_token === undefined) return this.updateAccounts(id);
				if (isDev) console.log(`Discord Token: ${access_token}`);
				// defer localStorage write to authStore mutation (has access to discord id)
				setTimeout(
					() => this.updateAccounts(id, discordToken.refreshLogin()),
					new Date(discordToken.expires_at).getTime() - Date.now(),
				);

				Promise.all([
					this.loadDiscordProfile(access_token).catch((err) => app.showSnackBar(err, "error")),
					this.loadFaithfulProfile(access_token).catch((err) => app.showSnackBar(err, "error")),
				]).then(() => {
					app.loginResolved = true;
				});
			});

			const authMethod = await discordToken.getAuthMethod();

			// not logged in, resolve immediately
			if (!authMethod) {
				app.loginResolved = true;
				return;
			}

			await discordToken.authenticate(authMethod).catch((err) => app.showSnackBar(err, "error"));

			// https://stackoverflow.com/a/41061471/20327257
			if (new URLSearchParams(location.search).has("access_token"))
				history.replaceState(null, "", window.location.pathname);
		},
		/**
		 * Switch to a new account from an existing one
		 * @param {string} id Discord ID of account to switch to
		 */
		async switchAccount(id) {
			// fetch auth immediately from localstorage since it has the access/refresh tokens already
			const auth = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY))[id];
			try {
				await discordTokenStore().authenticate(auth);
			} catch (err) {
				this.app.showSnackBar(err, "error");
				console.error(err);
			}
		},
		/**
		 * Log out of current account or a specific account if provided
		 * @param {string} [logoutId] log out of another account that isn't the current one
		 */
		logout(logoutId) {
			const currentId = this.id;
			// not logged into account being logged out of; remove it from localStorage and update
			if (logoutId && logoutId !== currentId) return this.updateAccounts(logoutId);

			const discordToken = discordTokenStore();
			discordToken.$reset();

			// try to get next available account and log into that
			const accounts = Object.entries(JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY)));
			const nextAccountCandidate = accounts.find(([id]) => id !== currentId);
			if (nextAccountCandidate) {
				return discordToken.authenticate(nextAccountCandidate[1]).catch((err) => {
					this.app.showSnackBar(err, "error");
					console.error("err");
				});
			}

			// no more accounts, fully reset everything
			localStorage.removeItem(CURRENT_USER_KEY);
			this.$reset();
		},
		/**
		 * Register a new change listener
		 * @param {Listener} cb
		 */
		addChangeListener(cb) {
			this.authListeners.push(cb);
		},
		/**
		 * Write account information to localstorage safely (doesn't affect other accounts)
		 * @private
		 * @param {string} id user ID to write to
		 * @param {unknown} payload payload to write
		 */
		updateAccounts(id, payload) {
			const cur = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || "{}") || {};
			if (payload) cur[id] = payload;
			else delete cur[id];
			localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(cur));

			// only emit once localStorage is updated
			this.authListeners.forEach((cb) => cb(this));
		},
		/**
		 * Load full Discord profile from access token
		 * @private
		 * @param {string} accessToken token to get data for
		 */
		async loadDiscordProfile(accessToken) {
			if (accessToken === undefined) return this.$reset();
			const res = await axios.get("https://discord.com/api/users/@me", {
				headers: { authorization: `Bearer ${accessToken}` },
			});

			const { id, global_name, username, avatar, banner } = res.data;
			localStorage.setItem(CURRENT_USER_KEY, id);

			this.$patch({
				// queue access token update here to prevent unnecessary rerenders
				access_token: accessToken,

				id,
				// if there's already a username prioritize that (getFaithfulProfile resolved first)
				username: this.username || global_name,
				discordUsername: username,
				avatar: avatar ? `https://cdn.discordapp.com/avatars/${id}/${avatar}?size=1024` : null,
				banner: banner ? `https://cdn.discordapp.com/banners/${id}/${banner}?size=1024` : null,
			});

			this.updateAccounts(id, discordTokenStore().$state);
		},
		/**
		 * Load full Faithful profile from access token
		 * @private
		 * @param {string} accessToken token to get data for
		 */
		async loadFaithfulProfile(accessToken) {
			const res = await axios.get(`${window.apiURL}/users/account`, {
				headers: {
					discord: accessToken,
				},
			});
			this.$patch({
				username: res.data.username,
				uuid: res.data.uuid,
				roles: res.data.roles || [],
				anonymous: res.data.anonymous || false,
			});
		},
	},
});
