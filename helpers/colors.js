/**
 * @type {Record<string, Record<string, string>>}
 * Record<ColorName, Record<ColorVariant, HEX>>
 */
const colors = (await import("https://cdn.jsdelivr.net/npm/vuetify@2.6.4/lib/util/colors.min.js"))
	.default;

/** @param {string} color */
const colorToHex = (color) => {
	if (color.startsWith("#")) return color;
	const colorArr = color.trim().split(" ");

	// to camel case
	const colorName = colorArr[0].replace(/-./g, (x) => x[1].toUpperCase());
	// remove hyphens
	const variant = colorArr.length > 1 ? colorArr[1].replace("-", "") : "base";
	if (colors[colorName]?.[variant]) return colors[colorName][variant];
	return "inherit";
};

/**
 * Generate page style CSS for a given color
 * @param {string} pageColor - Vuetify or hex color
 * @returns {string} CSS style tag to apply
 */
export function generatePageStyles(pageColor) {
	const hex = colorToHex(pageColor);

	// taken from resources/css/scrollbar.scss
	const lightBg = "#fafafa";
	const darkBg = "#191919";
	const lightFg = "#ffffff";
	const darkFg = "#1e1e1e";
	const lightCard = "#ffffff";
	const darkCard = "#272727";

	return `
	<style>
		@supports (scrollbar-color: auto) {
			.v-main.theme--light {
				scrollbar-color: ${hex} ${lightBg} !important;
			}
			.v-main.theme--dark {
				scrollbar-color: ${hex} ${darkBg} !important;
			}

			/* menus get mounted outside of the colored div so they need separate targeting */
			.theme--light .colored,
			.theme--light .colored *,
			.theme--light .v-menu__content {
				scrollbar-color: ${hex} ${lightFg} !important;
			}
			.theme--dark .colored,
			.theme--dark .colored *,
			.theme--dark .v-menu__content {
				scrollbar-color: ${hex} ${darkFg} !important;
			}

			.theme--light .main-container,
			.theme--light .main-container * {
				scrollbar-color: ${hex} ${lightCard} !important;
			}

			.theme--dark .main-container,
			.theme--dark .main-container * {
				scrollbar-color: ${hex} ${darkCard} !important;
			}
		}

		@supports selector(::-webkit-scrollbar) {
			/* separate selectors for the thumb/track so you only need to change the one property */
			.v-main::-webkit-scrollbar-thumb,
			.v-main *::-webkit-scrollbar-thumb,
			.main-container::-webkit-scrollbar-thumb,
			.main-container *::-webkit-scrollbar-thumb,
			.colored::-webkit-scrollbar-thumb,
			.colored *::-webkit-scrollbar-thumb,
			.v-menu__content::-webkit-scrollbar-thumb {
				background-color: ${hex} !important;
			}
		}
	</style>`;
}
