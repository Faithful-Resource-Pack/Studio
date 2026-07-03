import { defineStore } from "pinia";

const THEME_KEY = "theme";
const DEFAULT_THEME_ID = "system";

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
		// need vue instance for snackbars
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
		getTheme() {
			const savedTheme = localStorage.getItem(THEME_KEY);
			if (savedTheme !== null && Object.keys(this.availableThemes).includes(savedTheme))
				return savedTheme;
			return DEFAULT_THEME_ID;
		},
		setTheme(id) {
			localStorage.setItem(THEME_KEY, id);
			this.$patch({
				selectedTheme: id,
				isDark: this.getDark(id),
			});
		},
		// can't be a getter since system theme changes need to force a rerender
		getDark(theme) {
			if (theme === "light") return false;
			return theme === "dark" || window.matchMedia("(prefers-color-scheme: dark)").matches;
		},
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
