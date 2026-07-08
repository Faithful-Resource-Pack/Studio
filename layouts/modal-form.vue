<template>
	<v-dialog v-model="modalOpened" content-class="colored" :max-width="maxWidth" v-bind="$attrs">
		<v-card>
			<v-card-title class="justify-space-between">
				<h1 class="text-h5">{{ title }}</h1>
				<v-btn icon :title="$root.lang().global.btn.close" @click="closeModal">
					<v-icon>mdi-close</v-icon>
				</v-btn>
			</v-card-title>
			<slot v-if="basic" />
			<v-card-text v-else>
				<slot />
			</v-card-text>
			<v-card-actions v-if="!hideActions && !basic" class="form-actions">
				<v-btn :color="danger ? normalColor : dangerColor" text @click="closeModal">
					{{ $root.lang().global.btn.cancel }}
				</v-btn>
				<v-btn
					:color="danger ? dangerColor : normalColor"
					:disabled="disabled"
					text
					@click="submitModal"
				>
					{{ $root.lang().global.btn[buttonText] }}
				</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script>
export default {
	name: "modal-form",
	props: {
		title: {
			type: String,
			required: false,
			default: "",
		},
		value: {
			type: Boolean,
			required: true,
		},
		persistent: {
			type: Boolean,
			required: false,
			default: false,
		},
		// couldn't think of better prop names
		danger: {
			type: Boolean,
			required: false,
			default: false,
		},
		buttonType: {
			type: String,
			required: false,
			default: null,
		},
		disabled: {
			type: Boolean,
			required: false,
			default: false,
		},
		basic: {
			type: Boolean,
			required: false,
			default: false,
		},
		hideActions: {
			type: Boolean,
			required: false,
			default: false,
		},
		maxWidth: {
			type: String,
			required: false,
			default: "600",
		},
	},
	emits: ["submit", "close"],
	methods: {
		closeModal() {
			this.modalOpened = false;
			this.$emit("close");
		},
		submitModal() {
			if (!this.persistent) this.modalOpened = false;
			this.$emit("submit");
		},
	},
	computed: {
		buttonText() {
			// prioritize props
			if (this.buttonType) return this.buttonType;
			// danger needs confirmation
			if (this.danger) return "confirm";
			return "save";
		},
	},
	data() {
		return {
			modalOpened: false,
			dangerColor: "error darken-1",
			normalColor: "darken-1",
		};
	},
	watch: {
		value(newValue) {
			this.modalOpened = newValue;
		},
		modalOpened(newValue) {
			this.$emit("input", newValue);
		},
	},
};
</script>
