<template>
	<div
		class="drop-zone"
		:class="{ 'dropzone-dragging': isDragging, disabled: disabled, enabled: !disabled }"
	>
		<div
			class="dropzone-border"
			@dragover.stop="dragover"
			@dragleave.stop="dragleave"
			@drop.stop="drop"
			@click.stop="click"
		/>
		<input
			id="fileInput"
			ref="file"
			type="file"
			:multiple="multiple"
			name="file"
			class="hidden-input"
			:accept="accept"
			@change="onChange"
		/>

		<label for="fileInput" class="label">
			<div v-if="isDragging">
				<v-icon small>mdi-upload</v-icon>
				{{ labels.dragging }}
			</div>
			<div v-else-if="$slots.default">
				<slot />
			</div>
			<div v-else>
				<v-icon small>mdi-plus</v-icon>
				{{ labels.standby }}
			</div>
		</label>
	</div>
</template>

<script>
export default {
	name: "drop-zone",
	props: {
		accept: {
			type: String,
			required: false,
			default: () => "image/jpg, image/jpeg, image/png, image/gif",
		},
		multiple: {
			type: Boolean,
			required: false,
			default: () => false,
		},
		value: {
			type: [File, Array],
			required: false,
			default: null,
		},
		disabled: {
			type: Boolean,
			required: false,
			default: () => false,
		},
	},
	emits: ["change", "input"],
	data() {
		return {
			isDragging: false,
		};
	},
	methods: {
		onChange() {
			const files = this.multiple ? Array.from(this.$refs.file.files) : this.$refs.file.files[0];
			this.$emit("change", files);
			this.$emit("input", files);
		},
		dragover(e) {
			if (this.disabled) return;

			e.preventDefault();
			this.isDragging = true;
		},
		dragleave(e) {
			if (this.disabled) return;

			e.preventDefault();
			this.isDragging = false;
		},
		/** @param {DragEvent} e */
		drop(e) {
			if (this.disabled) return;

			e.preventDefault();
			const files = e.dataTransfer.files;
			if (!Array.from(files).every((file) => this.accept.includes(file.type))) {
				this.$root.showSnackbar(
					`${this.$root.lang().addons.images.header.rules.jpeg}\n${this.$root.lang().addons.images.header.rules.compress}`,
					"error",
				);
				this.isDragging = false;
				return;
			}
			this.$refs.file.files = e.dataTransfer.files;
			this.onChange();
			this.isDragging = false;
		},
		click() {
			if (this.disabled) return;
			this.$refs.file.click();
			this.$refs.file.blur();
		},
	},
	computed: {
		labels() {
			const labels = this.$root.lang().global.drop_zone;
			return {
				standby: this.multiple ? labels.standby_plural : labels.standby_singular,
				dragging: this.multiple ? labels.dragging_plural : labels.dragging_singular,
			};
		},
	},
};
</script>

<style lang="scss">
.drop-zone {
	display: flex;
	flex-grow: 1;
	align-items: center;
	justify-content: center;
	position: relative;
	text-align: center;
	padding: 0 10px;
}
.drop-zone,
.drop-zone * {
	cursor: pointer;
}

.drop-zone .dropzone-border {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	border: 1px dashed currentColor;
	z-index: 3;
	border-radius: 4px;
}

.drop-zone.disabled {
	pointer-events: none;
}

.drop-zone.disabled .dropzone-border,
.drop-zone.disabled .label {
	opacity: 0.5;
}
.drop-zone .dropzone-border,
.drop-zone .label {
	opacity: 0.7;
	transition: opacity 250ms ease;
}
.drop-zone.enabled:hover .dropzone-border,
.drop-zone.enabled:hover .label {
	opacity: 1;
}
.drop-zone .hidden-input {
	opacity: 0;
	overflow: hidden;
	position: absolute;
	width: 1px;
	height: 1px;
}
.drop-zone .label {
	font-size: 16px;
	display: block;
}
</style>
