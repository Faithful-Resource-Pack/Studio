<template>
	<v-snackbar
		v-model="snackbarShown"
		class="snackbar-status"
		:class="{ 'extended-snackbar': split.submessage || json }"
		transition="slide-x-reverse-transition"
		:timeout="timeout"
		:color="snackbar.color"
		text
		@input="close"
	>
		<!-- for persistent snackbars or to get useless ones out of the way if you're impatient -->
		<v-btn
			style="position: absolute; right: 12px; top: 12px"
			icon
			small
			:title="$root.lang().global.btn.close"
			@click="close"
		>
			<v-icon :color="snackbar.color" class="snackbar-accent">mdi-close</v-icon>
		</v-btn>

		<h3 class="snackbar-title">{{ split.message }}</h3>
		<pre v-if="split.submessage && split.pre" class="mt-2 mb-0">{{ split.submessage }}</pre>
		<p v-else-if="split.submessage" class="mt-2 mb-0">{{ split.submessage }}</p>

		<div v-if="json" class="json-editor snackbar-json pa-3 mt-2">
			<!-- eslint-disable-next-line vue/no-v-html -->
			<pre v-html="sanitize(highlighter(JSON.stringify(json, null, 2)))"></pre>
		</div>

		<v-row v-if="snackbar.color === 'error'" dense class="mt-2 mb-n2">
			<v-col>
				<v-btn block text :color="snackbar.color" @click="copyMessage">
					<v-icon left>{{ copyIcon }}</v-icon>
					{{ $root.lang().global.btn.copy }}
				</v-btn>
			</v-col>
			<v-col>
				<v-btn
					block
					text
					:color="snackbar.color"
					:href="reportURL"
					target="_blank"
					rel="noopener noreferrer"
				>
					<v-icon left>mdi-flag-variant</v-icon>
					{{ $root.lang().global.btn.report }}
				</v-btn>
			</v-col>
		</v-row>
	</v-snackbar>
</template>

<script>
import DOMPurify from "dompurify";
import Prism from "prismjs";

// delay between snackbar closing and component destruction (to let animation fully play)
const ANIMATION_DELAY_MS = 250;

export default {
	name: "snackbar-status",
	props: {
		snackbar: {
			type: Object,
			required: true,
		},
	},
	emits: ["close"],
	data() {
		return {
			snackbarShown: false,
			reportURL:
				"https://github.com/Faithful-Resource-Pack/Studio/issues/new?template=bug_report.yml",
			copyIcon: "mdi-content-copy",
		};
	},
	methods: {
		highlighter(code) {
			return Prism.highlight(code, Prism.languages.js, "json");
		},
		sanitize(text) {
			return DOMPurify.sanitize(text);
		},
		copyMessage() {
			const { message, submessage } = this.split;
			let formatted = `${message}:\n${submessage}`;
			if (this.json) formatted += `\n\n\`\`\`json\n${JSON.stringify(this.json, null, 4)}\n\`\`\``;
			formatted += `\n\nCreated: ${new Date().toString()}`;
			navigator.clipboard.writeText(formatted);

			// showing a snackbar for the snackbar would be insane so we just use an icon for feedback
			this.copyIcon = "mdi-check";
			setTimeout(() => {
				this.copyIcon = "mdi-content-copy";
			}, 1000);
		},
		close() {
			this.snackbarShown = false;
			setTimeout(() => this.$emit("close"), ANIMATION_DELAY_MS);
		},
	},
	computed: {
		split() {
			// default values
			const message = this.snackbar.message;
			const submessage = "";

			if (typeof this.snackbar.message === "string") {
				const newline = message.indexOf("\n");
				if (newline === -1) return { message, submessage };
				return {
					message: message.substring(0, newline),
					submessage: message.substring(newline + 1),
				};
			}
			// check for AxiosError
			const extractedMessage = message?.message;
			if (message.response?.data) {
				return {
					message: extractedMessage,
					submessage: message.response.data.error || message.response.data.message,
				};
			}

			// couldn't parse response, show which endpoint failed at least
			if (message.config) {
				return {
					message: extractedMessage,
					submessage: `${message.config.method.toUpperCase()} ${message.config.url}`,
				};
			}

			if (message.stack) {
				return {
					message: extractedMessage,
					submessage: message.stack,
					pre: true,
				};
			}

			return {
				message: extractedMessage,
				submessage,
			};
		},
		json() {
			// if something is explicitly provided that takes precedence
			if (this.snackbar.json) return this.snackbar.json;
			const message = this.snackbar.message;
			// validation error json can be shown
			if (message.response?.data && message.response.data.details)
				return message.response.data.details;
			return null;
		},
		timeout() {
			if (this.snackbar.timeout) return this.snackbar.timeout;
			// success status lasts for less time since there's nothing useful there
			if (this.snackbar.color === "success") return 2500;

			// anything else takes longer to go away so you can copy it
			return 5000;
		},
	},
	mounted() {
		this.snackbarShown = true;
	},
};
</script>

<style lang="scss">
// undo snackbar positioning weirdness, reimplemented in .snackbar-container parent
.snackbar-status {
	height: initial !important;
	position: relative !important;
	top: 0 !important;
}

.snackbar-status .v-snack__wrapper {
	margin: 0 !important;
	// accent color, same width as discord embed accent
	border-left: 4px solid hsla(0, 0%, 100%, 0.12);
}

.snackbar-status .v-snack__content {
	// 16px horizontal padding - 4px left border
	padding-right: 12px;
}

.snackbar-status .v-snack__wrapper.theme--dark {
	// makes text more legible in dark mode
	background-color: rgb(25, 25, 25);
}

// since the color can change we just lighten it directly
.theme--dark .snackbar-accent,
.theme--dark .extended-snackbar .snackbar-title {
	filter: brightness(2.25) saturate(0.7);
}

.theme--light .snackbar-accent,
.theme--light .extended-snackbar .snackbar-title {
	filter: brightness(0.7);
}

.snackbar-json {
	border-radius: 4px;
}

.btn-square-icon {
	min-width: 36px !important;
	width: 36px;
	height: 36px;
}
</style>
