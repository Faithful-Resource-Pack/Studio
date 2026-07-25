import { defineStore } from "pinia";

const THEME_KEY = "theme";
const DEFAULT_THEME_ID = "system";

/**
 * manages current theme, watches for system changes, and provides useful data
 * NOTE: does not handle vuetify class switching, needs isDark watcher in index.js
 */
export default defineStore("theme", {
	state: () => ({
		availableThemes: {
			// this probably doesn't have to be an object but whatever
			dark: {
				id: "dark",
				icon: "mdi-weather-night",
			},
			system: {
				id: "system",
				icon: "mdi-desktop-tower-monitor",
			},
			light: {
				id: "light",
				icon: "mdi-white-balance-sunny",
			},
		},
		selectedTheme: DEFAULT_THEME_ID,
		isDark: true,
	}),
	actions: {
		/**
		 * Set up themes based on browser context/localstorage
		 * @param {import("vue/types/vue").Vue} app used for notification/snackbar access
		 */
		setup(app) {
			this.setTheme(this.getTheme());

			// watch color schemes for light and dark
			window
				.matchMedia("(prefers-color-scheme: dark)")
				.addEventListener("change", (ev) => ev.matches && this.onSystemThemeChange(app, "dark"));
			window
				.matchMedia("(prefers-color-scheme: light)")
				.addEventListener("change", (ev) => ev.matches && this.onSystemThemeChange(app, "light"));
		},
		/**
		 * Get current theme
		 * @returns {string} current theme
		 */
		getTheme() {
			const savedTheme = localStorage.getItem(THEME_KEY);
			if (savedTheme !== null && Object.keys(this.availableThemes).includes(savedTheme))
				return savedTheme;
			return DEFAULT_THEME_ID;
		},
		/**
		 * Set a new theme
		 * @param {keyof typeof this.availableThemes} theme theme to set
		 */
		setTheme(theme) {
			localStorage.setItem(THEME_KEY, theme);
			this.$patch({
				selectedTheme: theme,
				isDark: this.getDark(theme),
			});
		},
		/**
		 * Get whether the provided theme counts as "dark"
		 * - Basically if the theme is always dark or the user's system theme is set to prefer dark
		 * @private prefer the isDark getter
		 * @param {keyof typeof this.availableThemes} theme theme to check
		 * @returns {boolean} whether the theme counts as "dark"
		 */
		getDark(theme) {
			if (theme === "light") return false;
			return theme === "dark" || window.matchMedia("(prefers-color-scheme: dark)").matches;
		},
		/**
		 * What to do when the system theme changes (only matters when theme is system)
		 * @private
		 * @param {import("vue/types/vue").Vue} app used for notification snackbar message
		 * @param {keyof typeof this.availableThemes} theme theme to use
		 */
		onSystemThemeChange(app, theme) {
			// only if system theme
			if (this.selectedTheme !== "system") return;

			this.$patch({ isDark: this.getDark(theme) });
			const notificationString = app.lang().global.themes.notification;
			app.showSnackBar(
				notificationString.replace("%s", app.lang().global.themes.options[theme]),
				"success",
				2000,
			);
		},
	},
	getters: {
		prismURL() {
			return this.isDark
				? "https://cdn.jsdelivr.net/gh/PrismJS/prism-themes/themes/prism-vsc-dark-plus.css"
				: "https://cdn.jsdelivr.net/gh/PrismJS/prism-themes/themes/prism-ghcolors.css";
		},
	},
});
