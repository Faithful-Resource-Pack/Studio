// add injected methods to entire app
import "@helpers/utilityMethods.js";

// frameworks
import Vue from "vue";
import VueRouter from "vue-router";
import Vuetify from "vuetify";

// general dependencies
import axios from "axios";
import { DateTime } from "luxon";
import DOMPurify from "dompurify";
import { marked } from "marked";
import { createPinia, mapState } from "pinia";

// pinia stores
import authStore from "./stores/authStore.js";
import translationStore from "./stores/translationStore.js";
import themeStore from "./stores/themeStore.js";

// layout components and tabs
import ALL_TABS from "@helpers/tabs.js";
import NavAppBar from "@components/navbar/index.vue";
import NavSidebar from "@components/sidebar/index.vue";
import NavFooter from "@components/nav-footer.vue";
import SnackbarStatus from "@components/snackbar-status.vue";
import LoadingPage from "@layouts/loading-page.vue";
import MissingPage from "./pages/404/index.vue";

Vue.config.devtools = import.meta.env.MODE === "development";
Vue.use(Vuetify);
Vue.use(VueRouter);

const pinia = createPinia();
Vue.use(pinia);

/**
 * PWA REGISTRATION
 */

if ("serviceWorker" in navigator) {
	navigator.serviceWorker.register("/service-worker.js").catch((err) => {
		console.error("Failed to register PWA Service Worker:", err);
	});
}

/**
 * ROUTING
 */

const router = new VueRouter({
	mode: "history",
});

router.beforeEach((to, _from, next) => {
	Vue.nextTick(() => {
		if (to.name) document.title = `${to.name} - Faithful Studio`;
		else document.title = "Faithful Studio";
	});
	// redirect to dashboard if base url
	if (to.fullPath === "/") {
		next("/dashboard");
		return;
	}
	// replace hash router (legacy urls) with history router
	if (["/#", "/?#"].some((p) => to.fullPath.startsWith(p))) {
		const path = to.fullPath.replace("/#", "").replace("/?#", "");
		next(path);
		return;
	}

	next();
});

window.apiURL = import.meta.env.VITE_API_URL;
// fix trailing slash
if (apiURL.endsWith("/")) window.apiURL = window.apiURL.slice(0, -1);

function syncRoutes(routes) {
	// accepts any number of routes
	const curRoutes = router.getRoutes().map((r) => r.path);
	const diff = routes.filter((r) => !curRoutes.includes(r.path));
	diff.forEach((r) => router.addRoute(r));
}

// add all public routes
syncRoutes(
	ALL_TABS.filter((t) => t.roles === undefined)
		.flatMap((t) => t.subtabs)
		.filter((s) => s.public)
		.flatMap((s) => s.routes),
);

// add missing route last (prevents some weird fallback shenanigans)
router.addRoute({ path: "*", name: "404", component: MissingPage });

// needed for some pages to not completely die
window.settings = {};

const DARK_SIDEBAR_KEY = "sidebar_dark";
const SIDEBAR_OPEN_KEY = "sidebar_open";

/**
 * VUE INITIALIZATION
 */

const app = new Vue({
	el: "#app",
	components: {
		NavAppBar,
		NavSidebar,
		NavFooter,
		SnackbarStatus,
		LoadingPage,
	},
	data() {
		return {
			auth: authStore(),
			translation: translationStore(),
			theme: themeStore(),
			darkSidebar: localStorage.getItem(DARK_SIDEBAR_KEY) === "true" || false,
			sidebarOpen: localStorage.getItem(SIDEBAR_OPEN_KEY)
				? localStorage.getItem(SIDEBAR_OPEN_KEY) === "true"
				: !this.$vuetify.breakpoint.mobile,
			badgeData: {},
			settingsLoaded: false,
			loginResolved: false,
			showActions: false,
			snackbar: {
				show: false,
				message: "",
				color: "",
				timeout: 4000,
				json: undefined,
			},
		};
	},
	methods: {
		/** log reactive object */
		log(...objs) {
			const cleaned = structuredClone(objs);
			console.log(cleaned);
		},
		/** For debugging in sub-components */
		checkPermissions() {
			console.log(this.$route);
			console.log(this.$router.options.routes);
		},
		async loadBadge(cb, key) {
			if (!this.isAdmin) return;
			// use await to prevent sync callbacks not having a then() method
			const value = await cb(this);
			this.$set(this.badgeData, key, value);
			// since it's recursive you don't need setInterval
			return setTimeout(() => this.loadBadge(cb, key), 30000);
		},
		// reverse curried version of showSnackBar with json first
		makeJsonSnackBar(json = undefined) {
			return (...allArgs) => {
				if (allArgs.length < 2) allArgs.push("");
				if (allArgs.length < 3) allArgs.push(4000);
				allArgs.push(json);

				return this.showSnackBar(...allArgs);
			};
		},
		showSnackBar(message, color = "", timeout = undefined, json = undefined) {
			this.snackbar.show = true;
			this.snackbar.message = message;
			this.snackbar.color = color;
			this.snackbar.timeout = timeout;
			this.snackbar.json = json;
		},
		// this is such a common operation it should really be a macro
		async wrapSnackBar(promise, successMessage = "") {
			try {
				const result = await promise;
				this.showSnackBar(successMessage || this.lang().global.success_message, "success");
				// so it can still be used
				return result;
			} catch (err) {
				console.error(err);
				this.showSnackBar(err, "error");
				// re-throw so it doesn't accidentally trigger the .then handler
				throw err;
			}
		},
		compileMarkdown(rawText) {
			if (!rawText) return "";
			return DOMPurify.sanitize(marked(rawText));
		},
		// DATE_MED is the most common (e.g. Mar 15, 2026)
		formatDate(date, format = DateTime.DATE_MED) {
			// wrap the date so you can pass in anything the date constructor accepts
			// e.g. unix timestamps YMD dates etc
			return DateTime.fromJSDate(new Date(date))
				.setLocale(this.translation.current.bcp47)
				.toLocaleString(format);
		},
		syncRoutes(tabs) {
			return syncRoutes(tabs.flatMap((r) => r.subtabs).flatMap((s) => s.routes));
		},
		async reloadSettings() {
			this.settingsLoaded = false;
			try {
				window.settings = await axios.get(`${window.apiURL}/settings/raw`).then((res) => res.data);
				this.settingsLoaded = true;
			} catch (err) {
				this.showSnackBar(err, "error");
			}
		},
	},
	computed: {
		// the entire user store state becomes the user property
		...mapState(authStore, {
			user: (store) => store.$state,
		}),
		...mapState(translationStore, {
			lang: (store) => store.lang,
		}),
		loginURL() {
			// todo: permalink to /studio after migration is finished
			const target = location.host.startsWith("localhost") ? "webapp" : location.host.split(".")[0];
			return `${this.apiURL}/auth/discord/${target}`;
		},
		apiURL() {
			if (
				Vue.config.devtools &&
				window.apiURL &&
				window.apiURL.includes("localhost") &&
				location.host !== "localhost"
			)
				return window.apiURL.replace("localhost", location.host.split(":")[0]);
			return window.apiURL;
		},
		apiOptions() {
			// can be adjusted with new auth values as needed
			return {
				headers: { discord: this.user.access_token },
			};
		},
		/**
		 * Check user perms & add (or not) tabs & routes following user perms
		 * @returns all tabs to be added in the html
		 */
		availableTabs() {
			return (
				ALL_TABS
					// first filter categories
					.filter((tab) => !tab.roles || tab.roles.some((r) => this.userRoles.includes(r)))
					.map((tab) => ({
						// must create a new object so if the user logs in the old tabs aren't deleted
						...tab,
						subtabs: tab.subtabs
							.filter((subtab) => {
								if (subtab.public) return true;
								// if there's no roles then it's available to all logged in users
								if (!subtab.roles) return this.isLoggedIn;
								return subtab.roles.some((r) => this.userRoles.includes(r));
							})
							.map((s) => {
								s.to = s.routes[0].cleanPath || s.routes[0].path;
								return s;
							}),
					}))
					// then when subtabs are filtered filter again
					.filter((tab) => tab.subtabs.length)
			);
		},
		/**
		 * Tell if the user is logged in
		 */
		isLoggedIn() {
			return this.user && this.user.id && this.user.id !== undefined;
		},
		/**
		 * Tell if the user has administrator permissions (manager/dev)
		 */
		isAdmin() {
			// if not logged in
			if (!this.isLoggedIn) return false;

			// if user not loaded
			if (!this.user) return false;

			// check roles
			return this.user.roles.includes("Administrator");
		},
		/**
		 * Get user's roles in real time
		 * @returns user discord roles
		 */
		userRoles() {
			return this.user.roles;
		},
		appLoading() {
			return !this.settingsLoaded || !this.loginResolved;
		},
	},
	watch: {
		// bit more granular than subscribing to the whole store
		"theme.isDark": {
			handler(n) {
				const arr = ["theme--light", "theme--dark"];
				if (n) arr.reverse();
				this.$vuetify.theme.dark = n;
			},
			immediate: true,
			deep: true,
		},
		darkSidebar(n) {
			localStorage.setItem(DARK_SIDEBAR_KEY, String(n));
		},
		sidebarOpen(n) {
			// don't set preference on small screens (pointless)
			if (this.$vuetify.breakpoint.mobile) return;
			localStorage.setItem(SIDEBAR_OPEN_KEY, String(n));
		},
		userRoles(n) {
			if (!Array.isArray(n)) return;

			// add all routes with no role
			this.$nextTick(() => {
				this.availableTabs
					.flatMap((t) => t.subtabs)
					.filter((s) => s.badge)
					.forEach((s) => this.loadBadge(s.badge, s.id));
			});
		},
		availableTabs(n) {
			this.syncRoutes(n);
		},
	},
	created() {
		// can't load after five seconds, show error message
		setTimeout(() => {
			this.showActions = true;
		}, 5000);

		if (this.$vuetify.breakpoint.mdAndDown) this.sidebarOpen = false;
		this.reloadSettings();
		this.translation.setup();
		this.theme.setup(this);
		this.auth.login(this, Vue.config.devtools);
	},
	// plugins
	router,
	vuetify: new Vuetify({
		theme: {
			dark: true,
			themes: {
				dark: {
					primary: "#76c945",
					accent: "#00a2ff",
					success: "#22a831",
				},
				light: {
					primary: "#4ea229",
					// lightest fully accessible color (easier to style around)
					secondary: "#757575",
					accent: "#00a2ff",
					success: "#22a831",
				},
			},
		},
	}),
});

if (Vue.config.devtools) window.app = app;
