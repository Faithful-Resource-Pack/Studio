<template>
	<v-container>
		<!-- eslint-disable-next-line vue/no-v-html -->
		<div class="styles" v-html="pageStyles" />

		<!-- main button modals -->
		<new-texture-modal v-model="newTextureModalOpen" :color="pageColor" :tags="tags" />
		<merge-texture-modal v-model="mergeModalOpen" :color="pageColor" />

		<!-- per-texture edit/delete modals -->
		<texture-modal
			v-model="editModal.open"
			:color="pageColor"
			:add="!Object.keys(editModal.data).length"
			:data="editModal.data"
			:tags="tags"
			@close="closeTextureModal"
		/>
		<texture-remove-confirm
			v-model="remove.open"
			type="texture"
			:data="remove.data"
			:color="pageColor"
			@close="removeTexture"
		/>

		<h1 class="text-h4 py-4">
			{{ $root.lang().database.textures.title }}
		</h1>
		<h2 class="text-h5 my-2">{{ $root.lang().database.textures.tag_filter }}</h2>
		<div class="selector">
			<v-btn
				v-for="textureTag in textureTags"
				:key="textureTag"
				:class="['my-1 mr-2', activeTag(textureTag)]"
				:to="textureURL(textureTag)"
				:exact="textureTag == 'all'"
			>
				{{ textureTag }}
			</v-btn>
		</div>
		<h2 class="text-h5 my-2">{{ $root.lang().database.search }}</h2>
		<search-box
			v-model="search"
			class="my-2"
			:color="pageColor"
			:placeholder="$root.lang().database.textures.search_texture"
			@search="startSearch"
			@clear="clearSearch"
		/>

		<div class="my-6">
			<v-row>
				<v-col>
					<v-btn block :color="pageColor" :class="textColorOnPage" @click="openNewTextureModal">
						<v-icon left>mdi-plus</v-icon>
						{{ $root.lang().database.textures.add_multiple }}
					</v-btn>
				</v-col>
				<v-col>
					<v-btn block :color="pageColor" :class="textColorOnPage" @click="openMergeModal">
						<v-icon left>mdi-merge</v-icon>
						{{ $root.lang().database.textures.merge_textures.title }}
					</v-btn>
				</v-col>
			</v-row>
		</div>

		<h2 class="text-h5 my-2">
			{{ $root.lang().database.textures.texture_result }} ({{ Object.keys(textures).length }})
		</h2>

		<smart-grid :loading="loading" :items="Object.values(textures)" track="id">
			<template #default="texture">
				<a :href="`/gallery?show=${texture.id}`" target="_blank" rel="noopener noreferrer">
					<v-list-item-avatar class="database-list-avatar text--primary">
						#{{ texture.id }}
					</v-list-item-avatar>
				</a>

				<v-list-item-content>
					<v-list-item-title>{{ texture.name }}</v-list-item-title>
					<v-list-item-subtitle>{{ (texture.tags || []).join(", ") }}</v-list-item-subtitle>
				</v-list-item-content>

				<v-list-item-action class="merged-actions">
					<v-btn
						icon
						:title="$root.lang().database.textures.edit_texture"
						@click="openTextureModal(texture)"
					>
						<v-icon color="lighten-1">mdi-pencil</v-icon>
					</v-btn>
					<v-btn
						icon
						:title="$root.lang().database.textures.delete_modal.title_texture"
						@click="askRemove(texture)"
					>
						<v-icon color="red lighten-1">mdi-delete</v-icon>
					</v-btn>
				</v-list-item-action>
			</template>
		</smart-grid>
	</v-container>
</template>

<script>
import axios from "axios";

import SmartGrid from "@layouts/smart-grid.vue";
import SearchBox from "@components/search-box.vue";

import TextureModal from "./texture-modal.vue";
import NewTextureModal from "./new-texture-modal/index.vue";
import MergeTextureModal from "./merge-texture-modal.vue";
import TextureRemoveConfirm from "./texture-remove-confirm.vue";

import { generatePageStyles } from "@helpers/colors.js";

export default {
	name: "texture-page",
	components: {
		SmartGrid,
		SearchBox,
		TextureModal,
		NewTextureModal,
		MergeTextureModal,
		TextureRemoveConfirm,
	},
	data() {
		return {
			pageColor: "blue darken-1",
			pageStyles: "",
			textColorOnPage: "white--text",
			tags: [],
			textures: {},
			search: "",
			loading: false,
			newTextureModalOpen: false,
			mergeModalOpen: false,
			editModal: {
				open: false,
				data: {},
			},
			remove: {
				open: false,
				data: {},
			},
			selectTextureTag: "all",
		};
	},
	methods: {
		activeTag(t) {
			const result = {};
			result[`v-btn--active ${this.pageColor} ${this.textColorOnPage}`] =
				(t === "all" && !this.tag && !!this.name) ||
				(t && this.tag && t.toLowerCase() === this.tag.toLowerCase());

			return result;
		},
		textureURL(t) {
			return `/textures/${t}/${this.name || ""}`;
		},
		startSearch() {
			// /whatever/ => /whatever/<search>
			// /whatever/<oldSearch> => /whatever/<search>
			// /whatever/<role> =>/whatever/<role>/<search>
			// /whatever/<role>/<name> => /whatever/<role>/<search>
			let newPath = this.name
				? this.$route.path.split("/").slice(0, -1).join("/")
				: this.$route.path;

			if (this.search) {
				if (!newPath.endsWith("/")) newPath += "/";
				newPath += this.search;
			}
			if (newPath !== this.$route.path) this.$router.push(newPath);

			this.getTextures();
		},
		clearSearch() {
			this.search = "";
			this.startSearch();
		},
		openTextureModal(data = {}) {
			this.editModal.open = true;
			this.editModal.data = data;
		},
		closeTextureModal(refresh = false) {
			if (refresh) {
				this.getTags();
				this.getTextures();
			}
		},
		openNewTextureModal() {
			this.newTextureModalOpen = true;
		},
		openMergeModal() {
			this.mergeModalOpen = true;
		},
		askRemove(data) {
			this.remove.open = true;
			this.remove.data = data;
		},
		getTags() {
			axios
				.get(`${this.$root.apiURL}/textures/tags`)
				.then((res) => {
					this.tags = res.data;
				})
				.catch((err) => {
					console.error(err);
				})
				.finally(() => {
					this.$nextTick(() => {
						this.search = this.name;
					});
				});
		},
		getTextures() {
			this.loading = true;
			const url = new URL(`${this.$root.apiURL}/textures/search`);
			const { tag, name } = this.$route.params;
			if (tag && tag !== "all") url.searchParams.set("tag", tag);
			if (name) url.searchParams.set("name", name.replace(/ /g, "_"));
			axios
				.get(url.toString())
				.then((res) => {
					this.textures = res.data;
				})
				.catch((err) => console.error(err))
				.finally(() => {
					this.loading = false;
				});
		},
		update(success = true) {
			if (success) this.getTextures();
			this.getTags();
		},
		async removeTexture(success) {
			if (success) this.startSearch();
		},
	},
	computed: {
		textureTags() {
			return ["all", ...this.tags];
		},
		tag() {
			if (this.$route.params.tag && this.textureTags.includes(this.$route.params.tag))
				return this.$route.params.tag;
			return undefined;
		},
		name() {
			if (this.tag !== undefined) return this.$route.params.name;
			return this.$route.params.tag;
		},
	},
	watch: {
		$route() {
			this.getTextures();
		},
		tag(n) {
			this.selectTextureTag = n;
		},
		selectTextureTag(n) {
			if (n) this.$router.push(this.textureURL(n)).catch(() => {});
		},
	},
	mounted() {
		this.update(true);
		this.pageStyles = generatePageStyles(this.pageColor);
	},
};
</script>
