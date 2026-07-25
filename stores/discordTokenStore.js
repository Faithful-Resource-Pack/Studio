import axios from "axios";
import { defineStore } from "pinia";

export const LEGACY_AUTH_STORAGE_KEY = "auth";
export const AUTH_STORAGE_KEY = "available_accounts";
export const CURRENT_USER_KEY = "current_user_id";

/** handles all the ugly discord stuff required to start logging in */
export default defineStore("discordToken", {
	state: () => ({
		/** @type {string} Discord access token used with the API */
		access_token: undefined,
		/** @type {string} Refresh token stored when the auth runs out */
		refresh_token: undefined,
		/** @type {Date} Expiry date used to auto-refresh the token when needed */
		expires_at: undefined,
	}),
	actions: {
		/**
		 * Authenticate with Discord, refreshing required tokens if needed
		 * @param {typeof this.$state} auth Auth from localstorage
		 */
		async authenticate(auth) {
			const lastLogin = this.isAuthExpired(auth) ? this.refreshLogin(auth) : auth;
			const { access_token, refresh_token, expires_at } = await lastLogin;
			this.$patch({ access_token, refresh_token, expires_at });
		},
		/**
		 * Refresh Discord login when expired
		 * @param {typeof this.$state} auth Invalidated auth
		 * @returns {Promise<typeof this.$state>} New valid auth
		 */
		async refreshLogin(auth = undefined) {
			if (auth === undefined) auth = this.$state;

			const json = await axios
				.post(`${window.apiURL}/auth/discord/refresh`, {
					refresh_token: auth.refresh_token,
				})
				.then((res) => res.data);

			return {
				access_token: json.access_token,
				refresh_token: json.refresh_token,
				expires_at: this.expiryDurationToTime(json.expires_in),
			};
		},
		/**
		 * Read incoming login response or localstorage to get required tokens for logging in
		 * @returns {Promise<typeof this.$state | null>} Found auth, or null if user was never logged in
		 */
		async getAuthMethod() {
			// api returns tokens through search params, so prioritize those for login
			let auth = this.parseSearchParams(location.search);

			// nothing in search params, try localstorage
			if (!this.isValidAuth(auth)) auth = this.parseLocalStorage();

			// both api and localstorage auth tried, user is definitely not logged in at this point
			if (!this.isValidAuth(auth)) return null;
			return auth;
		},
		/**
		 * Read incoming login response data from query parameters
		 * @private
		 * @param {string} search query params to read
		 * @returns {typeof this.$state} found auth
		 */
		parseSearchParams(search) {
			const params = new URLSearchParams(search);
			return {
				access_token: params.get("access_token"),
				refresh_token: params.get("refresh_token"),
				expires_at: this.expiryDurationToTime(params.get("expires_in")),
			};
		},
		/**
		 * Read stored login data from localstorage safely
		 * @private
		 * @returns {typeof this.$state | null} Found auth, or null if user was never logged in
		 */
		parseLocalStorage() {
			// todo: remove this once faithful studio migration is done (old localstorage is dead)
			const legacyAuthJSON = localStorage.getItem(LEGACY_AUTH_STORAGE_KEY);

			if (legacyAuthJSON !== null) {
				// convert to new format
				localStorage.removeItem(LEGACY_AUTH_STORAGE_KEY);
				let auth;
				try {
					auth = JSON.parse(legacyAuthJSON);
				} catch (err) {
					console.error(err);
					return null;
				}

				if (!this.isValidAuth(auth)) return null;

				// we can't set it at this point since we have no idea what account it's for
				return auth;
			}

			const authJSON = localStorage.getItem(AUTH_STORAGE_KEY);
			const currentID = localStorage.getItem(CURRENT_USER_KEY);

			let auth;
			try {
				auth = JSON.parse(authJSON)?.[currentID] ?? null;
			} catch (err) {
				console.error(err);
				return null;
			}

			if (!this.isValidAuth(auth)) return null;

			return auth;
		},
		/**
		 * Check whether provided auth is expired based on its date
		 * @private
		 * @param {typeof this.$state} auth auth to check
		 * @returns {boolean} whether auth is expired
		 */
		isAuthExpired(auth) {
			return Date.now() > new Date(auth.expires_at).getTime();
		},
		/**
		 * Check whether auth is a valid object (not necessarily valid)
		 * @private
		 * @param {typeof this.$state} auth auth to check
		 * @returns {boolean} whether auth is valid
		 */
		isValidAuth(auth) {
			return auth && auth.access_token && auth.expires_at;
		},
		/**
		 * Convert Discord login duration into a javascript date object
		 * @private
		 * @param {number} duration discord login duration
		 * @returns {Date} converted date object
		 */
		expiryDurationToTime(duration) {
			return new Date(Date.now() + duration * 1000 - 60000);
		},
	},
});
