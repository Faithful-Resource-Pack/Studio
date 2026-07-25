import { defineStore } from "pinia";

const LANG_KEY = "lang";
const DEFAULT_LANG_ID = "en_US";

// used for fallback translation
const { default: defaultLang } = await import(`../resources/strings/${DEFAULT_LANG_ID}.js`);

/** manages available/loaded/selected languages, guessing user language, and safe string getters */
export default defineStore("translation", {
	state: () => ({
		/** @type {Record<string, import("../resources/types").LangMetadata>} all languages */
		availableLangs: Object.entries(import.meta.glob("/resources/strings/*.js"))
			.map(([path, loadAsImport]) => {
				const name = path.split("/").pop().split(".")[0];
				return {
					id: name,
					display: name.includes("en") ? "en" : name.slice(-2).toLowerCase(),
					// automatically fetch default import
					load: () => loadAsImport().then((res) => res.default),
					bcp47: name.replace("_", "-"),
					file: path,
					iso3166: name.split("_")[1].toLowerCase(),
				};
			})
			.reduce((acc, cur) => {
				acc[cur.id] = cur;
				return acc;
			}, {}),
		loadedLangs: { [DEFAULT_LANG_ID]: defaultLang },
		selectedLang: DEFAULT_LANG_ID,
	}),
	actions: {
		/**
		 * Set up translations based on browser context/localstorage
		 */
		setup() {
			// incredible code
			this.setLang(this.getLang());
		},
		/**
		 * Get current lang based on browser language or overridden localstorage value
		 * @returns {string} current lang id
		 */
		getLang() {
			// localstorage overrides any automatic language detection (already visited site)
			const savedLangId = localStorage.getItem(LANG_KEY);
			if (this.supportedLang(savedLangId)) return savedLangId;

			// user hasn't ever interacted, try to figure out language from navigator.language
			const navigatorLangId = navigator.language.replace(/-/g, "_");
			if (this.supportedLang(navigatorLangId)) return navigatorLangId;

			// not directly supported, search for a close prefix
			const navigatorBase = navigatorLangId.split("_")[0];
			const bestMatch = Object.keys(this.availableLangs).find((l) => l.startsWith(navigatorBase));
			if (bestMatch) return bestMatch;

			// language isn't supported at all, just use english
			return DEFAULT_LANG_ID;
		},
		/**
		 * Set a new theme
		 * @param {string} id language id to set
		 */
		async setLang(id) {
			localStorage.setItem(LANG_KEY, id);
			if (!Object.keys(this.loadedLangs).includes(id)) await this.loadLanguage(id);
			this.$patch({ selectedLang: id });
		},
		/**
		 * Load a new language object into memory from JSON
		 * @param {string} id language id to load
		 */
		async loadLanguage(id) {
			const langObj = this.availableLangs[id];

			// already cached or doesn't exist, no need to try loading
			if (!langObj || this.loadedLangs[id]) return;

			const strings = await langObj.load();

			this.$patch((store) => {
				store.loadedLangs[langObj.id] = Object.merge({}, defaultLang, strings || {});
			});
		},
		/**
		 * Check whether a language is supported
		 * @param {string} id language id to check
		 * @returns {boolean} whether the language is support
		 */
		supportedLang(id) {
			return Object.keys(this.availableLangs).includes(id);
		},
	},
	getters: {
		/**
		 * Type information in {@link ../resources/types.d.ts} (there's several overloads)
		 * Returns callback to support both lang("my.path.here") and lang().my.path.here
		 */
		lang() {
			const allStrings = this.loadedLangs[this.selectedLang] || Object.values(this.loadedLangs)[0];
			return (path, raw = false) => {
				// no path, return all strings
				if (!path) return allStrings;

				// traverse object using path string
				const selectedData = path.split(".").reduce((acc, cur) => acc?.[cur], allStrings);

				// warns user if string not found
				if (selectedData === undefined)
					console.warn(`Cannot find ${raw ? "data" : "string"} for "${path}"`);

				// if raw we can use whatever's there (for partial paths)
				if (raw) return selectedData;

				// Force return type to prevent undefined breaking string methods
				return String(selectedData);
			};
		},
		/**
		 * Get current language object with all fields
		 * @returns {import("../resources/types").LangMetadata} language object
		 */
		current() {
			return this.availableLangs[this.selectedLang];
		},
	},
});
