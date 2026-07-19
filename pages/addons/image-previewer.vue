<template>
	<v-container :class="[sources.length ? 'px-0 pt-0' : 'pa-0']">
		<div class="d-flex flex-row overflow-x-auto">
			<emitting-image
				v-for="(url, index) in sources"
				:key="url"
				:src="url"
				class="mr-2"
				:deletable="deletable"
				:height="150"
				:width="(150 * 16) / 9"
				:aspect-ratio="16 / 9"
				@fullscreen="onFullscreen(url)"
				@delete="onDelete(url, index)"
			/>
		</div>

		<fullscreen-preview v-model="previewOpen" :src="fullscreenItem" />
	</v-container>
</template>

<script>
import EmittingImage from "@components/emitting-image.vue";
import FullscreenPreview from "@components/fullscreen-preview.vue";

export default {
	name: "image-previewer",
	components: {
		EmittingImage,
		FullscreenPreview,
	},
	props: {
		sources: {
			type: Array,
			required: true,
		},
		ids: {
			type: Array,
			required: false,
			default: undefined,
		},
		deletable: {
			type: Boolean,
			required: false,
			default: false,
		},
	},
	emits: ["delete"],
	data() {
		return {
			fullscreenItem: undefined,
			previewOpen: false,
		};
	},
	computed: {
		empty() {
			return !this.sources.length;
		},
	},
	methods: {
		onDelete(item, index) {
			this.$emit("delete", item, index, this.ids === undefined ? undefined : this.ids[index]);
		},
		onFullscreen(url) {
			this.fullscreenItem = url;
			this.previewOpen = true;
		},
	},
};
</script>
