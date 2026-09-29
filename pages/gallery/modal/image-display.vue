<template>
	<div class="mx-auto overflow-auto pa-2">
		<template v-if="loading">
			<div v-for="group in skeletonGroups" :key="group[0]" class="d-flex flex-row pb-2 pb-sm-0">
				<div v-for="pack in group" :key="pack" class="px-2 pb-sm-2">
					<v-skeleton-loader type="image" width="160" height="160" />
					<v-skeleton-loader type="text" class="skeleton-caption d-flex justify-center mt-2" />
				</div>
			</div>
		</template>
		<template v-else>
			<div v-for="group in imageGroups" :key="group[0].id" class="d-flex flex-row pb-2 pb-sm-0">
				<div v-for="pack in group" :key="pack.id" class="px-2 pb-sm-2">
					<gallery-image
						:ref="`image-${pack.name}`"
						modal
						:src="pack.image"
						:alt="partialImageAlt.replace('%PACK%', pack.name)"
						:textureID="textureObj.texture.id"
						:ignoreList="ignoreList"
						:animated="animated"
						:mcmeta="textureObj.mcmeta"
						@click="openFullscreenPreview(pack.image)"
						@loaded="countLoaded"
					>
						<p>{{ $root.lang().gallery.error_message.texture_not_done }}</p>
					</gallery-image>
					<h2 class="text-center gallery-modal-caption mt-1">
						{{ pack.displayName }}
					</h2>
				</div>
			</div>
		</template>

		<fullscreen-preview v-model="previewOpen" :src="clickedImage" :aspect-ratio="1 / 1" texture />
	</div>
</template>

<script>
import FullscreenPreview from "@components/fullscreen-preview.vue";
import GalleryImage from "../gallery-image.vue";

const PACK_GRID_ORDER = [
	["default", "faithful_32x", "faithful_64x"],
	["default", "classic_faithful_32x_jappa", "classic_faithful_64x_jappa"],
	["progart", "classic_faithful_32x", "classic_faithful_64x"],
];

const PACK_SLIDER_ORDER = [
	"default",
	"progart",
	"faithful_32x",
	"faithful_64x",
	"classic_faithful_32x",
	"classic_faithful_64x",
	"classic_faithful_32x_jappa",
	"classic_faithful_64x_jappa",
];

export default {
	name: "image-display",
	components: {
		FullscreenPreview,
		GalleryImage,
	},
	props: {
		loading: {
			type: Boolean,
			required: false,
			default: false,
		},
		textureObj: {
			type: Object,
			required: true,
		},
		packToName: {
			type: Object,
			required: true,
		},
		animated: {
			type: Boolean,
			required: false,
			default: true,
		},
		ignoreList: {
			type: Array,
			required: false,
			default: () => [],
		},
	},
	data() {
		return {
			clickedImage: "",
			previewOpen: false,
			loadedTimeout: undefined,
		};
	},
	methods: {
		countLoaded(loaded) {
			// if image errored ignore it
			if (!loaded) return;

			// reset the other frames until synced
			clearTimeout(this.loadedTimeout);
			this.loadedTimeout = setTimeout(() => {
				const childrenRefs = Object.values(this.$refs).filter((ref) => ref && ref.reset);
				Promise.all(childrenRefs.flatMap((ref) => ref.reset()));
			}, 100);
		},
		openFullscreenPreview(url) {
			this.clickedImage = url;
			this.previewOpen = true;
		},
	},
	computed: {
		packs() {
			return this.$vuetify.breakpoint.mdAndDown ? [PACK_SLIDER_ORDER] : PACK_GRID_ORDER;
		},
		skeletonGroups() {
			return this.packs.map((group) => group.map(() => crypto.randomUUID()));
		},
		imageGroups() {
			if (this.loading) return [];

			return this.packs.map((group) =>
				group.map((pack) => ({
					id: crypto.randomUUID(),
					name: pack,
					displayName: this.packToName[pack],
					image: this.textureObj.urls[pack],
				})),
			);
		},
		// static portion of image alt text (replace %PACK% inline)
		partialImageAlt() {
			const base = this.$root.lang().gallery.modal.image_alt_text;
			return base.replace("%NAME%", this.textureObj.texture.name);
		},
	},
};
</script>
