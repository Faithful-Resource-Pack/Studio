<template>
	<v-dialog v-model="previewOpen" :width="`${aspectRatio * 90}vh`" height="90vh">
		<v-card>
			<v-img :style="styles" :src="src" :alt="alt" :aspectRatio="aspectRatio" contain />
			<v-card
				class="theme--dark d-inline-block ma-2"
				rounded
				style="position: absolute; right: 0; top: 0"
			>
				<v-btn icon color="white" @click="close">
					<v-icon>mdi-close</v-icon>
				</v-btn>
			</v-card>
		</v-card>
	</v-dialog>
</template>

<script>
export default {
	name: "fullscreen-preview",
	props: {
		value: {
			type: Boolean,
			required: true,
		},
		aspectRatio: {
			type: Number,
			required: false,
			default: 16 / 9,
		},
		src: {
			type: String,
			required: false,
			default: "",
		},
		alt: {
			type: String,
			required: false,
			default: "fullscreen preview",
		},
		texture: {
			type: Boolean,
			required: false,
			default: false,
		},
	},
	emits: ["input"],
	data() {
		return {
			previewOpen: false,
		};
	},
	methods: {
		close() {
			this.previewOpen = false;
		},
	},
	computed: {
		styles() {
			return this.texture ? { "image-rendering": "pixelated" } : {};
		},
	},
	watch: {
		value(newValue) {
			this.previewOpen = newValue;
		},
		previewOpen(newValue) {
			this.$emit("input", newValue);
		},
	},
};
</script>
