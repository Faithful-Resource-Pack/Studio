<template>
	<v-snackbar
		v-model="snackbarShown"
		class="snackbar-status"
		transition="slide-x-reverse-transition"
		:color="snackbar.type"
		:timeout="timeout"
		text
		@input="close"
	>
		<div class="d-flex flex-row align-center mb-1">
			<v-icon v-if="icon" left class="text--primary">{{ icon }}</v-icon>
			<h3 class="text--primary">{{ split.primary }}</h3>
			<v-spacer class="mx-2" />
			<v-btn
				icon
				x-small
				:color="snackbar.type"
				:title="$root.lang().global.btn.close"
				@click="close"
			>
				<v-icon>mdi-close</v-icon>
			</v-btn>
		</div>

		<!-- for stack traces where alignment/newlines matter -->
		<pre v-if="split.secondary && split.pre" class="my-0 text-pre-wrap" :class="textColor">{{
			split.secondary
		}}</pre>

		<!-- all other message types -->
		<p v-else-if="split.secondary" class="my-0 text-pre-line" :class="textColor">
			{{ split.secondary }}
		</p>

		<!--
			gh issue templates don't support url param prefill yet so we need separate copy/report buttons
			https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/adding-and-managing-issue-fields
		-->
		<v-row v-if="snackbar.type === 'error'" dense class="mt-2 mb-n2">
			<v-col>
				<v-btn block text :color="snackbar.type" @click="copyError">
					<v-icon left>{{ copyIcon }}</v-icon>
					{{ $root.lang().global.btn.copy }}
				</v-btn>
			</v-col>
			<v-col>
				<v-btn
					block
					text
					:color="snackbar.type"
					href="https://github.com/Faithful-Resource-Pack/Studio/issues/new?template=bug_report.yml"
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
import { isAxiosError } from "axios";

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
			copyIcon: "mdi-content-copy",
		};
	},
	methods: {
		close() {
			this.snackbarShown = false;
			setTimeout(() => this.$emit("close"), ANIMATION_DELAY_MS);
		},
		copyError() {
			// give as much information as possible (entire axios response if available)
			const error =
				typeof this.snackbar.message === "string"
					? `**Error message:**\n\n\`\`\`\n${this.snackbar.message}\n\`\`\``
					: `**JSON error data:**\n\n\`\`\`json\n${this.stringifiedError}\n\`\`\``;

			navigator.clipboard.writeText(`${error}\n\n**Created:** ${new Date().toString()}`);

			// showing a snackbar for the snackbar would be insane so we just use an icon for feedback
			this.copyIcon = "mdi-check";
			setTimeout(() => {
				this.copyIcon = "mdi-content-copy";
			}, 1000);
		},
	},
	computed: {
		textColor() {
			return [
				`${this.snackbar.type}--text`,
				// todo: only works on vuetify colors, try procedurally brightening with css filters?
				this.$root.theme.isDark ? "text--lighten-4" : "text--darken-3",
			];
		},
		// used for copying
		stringifiedError() {
			const error = this.snackbar.message;
			if (!error || typeof error === "string") return error;

			if (isAxiosError(error))
				return JSON.stringify(
					// for some reason axios responses aren't included in toJSON by default?
					this.snackbar.message.response
						? { ...this.snackbar.message, response: this.snackbar.message.response }
						: this.snackbar.message,
					null,
					4,
				);

			// JSON.stringify doesn't work on regular js errors for some reason, needs this weird hack
			return JSON.stringify(this.snackbar.message, Object.getOwnPropertyNames(error), 4);
		},
		split() {
			const base = this.snackbar.message;

			if (typeof base === "string") {
				// first line becomes title, everything else description
				const newline = base.indexOf("\n");
				if (newline === -1) return { primary: base, secondary: "" };
				return {
					primary: base.substring(0, newline),
					secondary: base.substring(newline + 1),
				};
			}

			if (isAxiosError(base)) {
				const extractedMessage = base.message;

				// AxiosError with tsoa validation payload (excess/missing properties)
				if (base.response?.data?.details) {
					return {
						primary: base.response.data.message,
						secondary: Object.values(base.response.data.details)
							.map((d) => `${d.message || d}`)
							.join("\n"),
						pre: true,
					};
				}

				// AxiosError with response (request went through)
				if (base.response?.data) {
					return {
						primary: extractedMessage,
						secondary: base.response.data.error || base.response.data.message,
					};
				}

				// AxiosError with no response (request couldn't go through)
				return {
					primary: extractedMessage,
					// just show endpoint and hope for the best lol
					secondary: `${base.config.method.toUpperCase()} ${base.config.url}`,
				};
			}

			// some other type of error object (TypeError, assertion, etc)
			if (base.stack) {
				// errName is better than extractedMessage in most cases
				const [errName, ...trace] = base.stack.split("\n");
				return {
					primary: errName,
					secondary: trace.join("\n"),
					pre: true,
				};
			}

			return { primary: extractedMessage, secondary: "" };
		},
		timeout() {
			if (this.snackbar.timeout) return this.snackbar.timeout;

			// errors might need to be copied so should be shown for longer
			return this.snackbar.type === "error" ? 5000 : 2500;
		},
		icon() {
			if (this.snackbar.icon) return this.snackbar.icon;
			switch (this.snackbar.type) {
				case "success":
					return "mdi-check-circle-outline";
				case "info":
					return "mdi-information-outline";
				case "warning":
					return "mdi-alert-circle-outline";
				case "error":
					return "mdi-close-circle-outline";
			}
			// icon isn't required
			return null;
		},
	},
	mounted() {
		// wait until mount so the element exists when the animation plays
		this.snackbarShown = true;
	},
};
</script>

<style lang="scss">
// undo snackbar positioning weirdness; reimplemented in .snackbar-container parent
.snackbar-status {
	height: initial !important;
	position: relative !important;
	top: 0 !important;
}

.snackbar-status .v-snack__wrapper {
	// use flex gap in container for margin to avoid doubling issues
	margin: 0 !important;

	// discord-styled accent color strip
	border-left: 4px solid white;

	// for some reason the non-solid background theme removes this (???)
	box-shadow:
		0 3px 5px -1px rgba(0, 0, 0, 0.2),
		0 6px 10px 0 rgba(0, 0, 0, 0.14),
		0 1px 18px 0 rgba(0, 0, 0, 0.12) !important;

	// hide translucent background, use regular card color
	&::before {
		background-color: transparent;
	}
}

// for some reason the amount of horizontal padding is insane by default
.snackbar-status .v-snack__content {
	padding-right: 4px;
	padding-left: 12px;
}
</style>
