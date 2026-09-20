<template>
	<v-dialog
		v-model="modalOpen"
		fullscreen
		hide-overlay
		content-class="colored"
		transition="dialog-bottom-transition"
		@keydown.esc="closeModal"
	>
		<!-- eslint-disable-next-line vue/no-v-html -->
		<div class="styles" v-html="pageStyles" />
		<v-card class="d-flex flex-column">
			<v-toolbar class="flex-grow-0 px-2">
				<v-btn icon :title="$root.lang().global.btn.close" @click.stop="closeModal">
					<v-icon>mdi-close</v-icon>
				</v-btn>
				<v-toolbar-title v-if="loading">
					{{ $root.lang().global.loading }}
					<v-progress-circular indeterminate size="25" width="3" class="ml-2" />
				</v-toolbar-title>
				<v-list-item-content v-else class="ml-5">
					<v-toolbar-title v-if="title">{{ title }}</v-toolbar-title>
					<v-list-item-subtitle v-if="subtitle" class="text--secondary">
						{{ subtitle }}
					</v-list-item-subtitle>
				</v-list-item-content>
				<v-spacer v-if="$slots.toolbar" />
				<slot name="toolbar" />
			</v-toolbar>
			<slot />
		</v-card>
	</v-dialog>
</template>

<script>
import { generatePageStyles } from "@helpers/colors.js";

export default {
	name: "fullscreen-modal",
	props: {
		value: {
			type: Boolean,
			required: true,
		},
		title: {
			type: String,
			required: false,
			default: "",
		},
		subtitle: {
			type: String,
			required: false,
			default: "",
		},
		loading: {
			type: Boolean,
			required: false,
			default: false,
		},
		pageColor: {
			type: String,
			required: false,
			default: "primary",
		},
	},
	emits: ["close", "input"],
	data() {
		return {
			modalOpen: false,
			pageStyles: "",
		};
	},
	methods: {
		closeModal() {
			this.modalOpen = false;
			this.$emit("close");
		},
	},
	mounted() {
		this.pageStyles = generatePageStyles(this.pageColor);
	},
	watch: {
		value: {
			handler(n) {
				this.modalOpen = n;
			},
			// has issues if the modal is open on page load otherwise
			immediate: true,
		},
		modalOpen(n) {
			this.$emit("input", n);
		},
	},
};
</script>
