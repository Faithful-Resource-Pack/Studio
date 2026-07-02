<template>
	<v-snackbar
		v-model="snackbarShown"
		class="snackbar-status"
		:class="(split.submessage || json) && 'extended-snackbar'"
		:timeout="snackbar.timeout"
		:color="snackbar.color"
		text
		bottom
		right
	>
		<div class="d-flex justify-space-between" :class="json ? 'align-start' : 'align-center'">
			<div>
				<h3 class="snackbar-title">{{ split.message }}</h3>
				<pre v-if="split.submessage && split.pre" class="mt-2 mb-0">{{ split.submessage }}</pre>
				<p v-else-if="split.submessage" class="mt-2 mb-0">{{ split.submessage }}</p>
			</div>
			<!-- this is such a stupid workaround for showing it only on errors -->
			<div v-if="snackbar.color === 'error'" class="d-flex flex-nowrap ml-5">
				<v-btn text class="btn-square-icon" @click="copyMessage">
					<v-icon color="error" class="snackbar-accent">{{ copyIcon }}</v-icon>
				</v-btn>
				<v-btn
					text
					class="btn-square-icon"
					:href="reportURL"
					target="_blank"
					rel="noopener noreferrer"
				>
					<v-icon color="error">mdi-flag-variant</v-icon>
				</v-btn>
			</div>
		</div>

		<div v-if="json" class="json-editor snackbar-json pa-3 mt-2">
			<!-- eslint-disable-next-line vue/no-v-html -->
			<pre v-html="sanitize(highlighter(JSON.stringify(json, null, 2)))"></pre>
		</div>
	</v-snackbar>
</template>

<script>
import DOMPurify from "dompurify";
import Prism from "prismjs";

export default {
	name: "snackbar-status",
	props: {
		value: {
			type: Boolean,
			required: true,
		},
		snackbar: {
			type: Object,
			required: true,
		},
	},
	emits: ["input"],
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

			// snackbar is already visible so we just replace the button icon for a second
			this.copyIcon = "mdi-check";
			setTimeout(() => {
				this.copyIcon = "mdi-content-copy";
			}, 1000);
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
	},
	watch: {
		value: {
			handler(newValue) {
				this.snackbarShown = newValue;
			},
			immediate: true,
		},
		snackbarShown(newValue) {
			this.$emit("input", newValue);
		},
	},
};
</script>

<style lang="scss">
.snackbar-status .v-snack__wrapper {
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
