<template>
	<v-container>
		<!-- eslint-disable-next-line vue/no-v-html -->
		<div class="styles" v-html="pageStyles" />
		<pack-modal
			v-model="modalOpen"
			:color="pageColor"
			:data="modalData"
			:add="modalAdd"
			:tags="tags"
			@close="close"
		/>
		<pack-remove-confirm
			v-model="remove.open"
			:data="remove.data"
			type="packs"
			@close="startSearch"
		/>

		<v-row no-gutters class="py-0 mb-0" align="center">
			<v-col cols="12" sm="6">
				<h1 class="text-h4 py-4">
					{{ $root.lang().database.packs.title }}
				</h1>
			</v-col>
			<v-col cols="12" sm="6">
				<v-btn block :color="pageColor" class="white--text" @click="openModal()">
					<v-icon left>mdi-plus</v-icon>
					{{ $root.lang().database.packs.modal.add_pack }}
				</v-btn>
			</v-col>
		</v-row>

		<!-- tag switcher -->
		<h2 class="text-h5 my-2">{{ $root.lang().database.packs.tag_filter }}</h2>
		<div class="selector">
			<v-btn
				v-for="packTag in packTags"
				:key="packTag"
				:class="['my-1 mr-2', activeTag(packTag)]"
				:to="packURL(packTag)"
				:exact="packTag === 'all'"
			>
				{{ formatTags(packTag) }}
			</v-btn>
		</div>

		<!-- results -->
		<h2 class="text-h5 my-2">{{ $root.lang().database.packs.pack_result }} ({{ packs.length }})</h2>
		<smart-grid :loading="!packs.length" :items="packs" wide track="id">
			<template #default="pack">
				<v-list-item-avatar class="database-list-avatar">
					<v-img :src="pack.logo" />
				</v-list-item-avatar>
				<v-list-item-content>
					<v-list-item-title>{{ pack.name }}</v-list-item-title>
					<v-list-item-subtitle>
						{{ (pack.tags.map(formatTags) || []).join(", ") }}
					</v-list-item-subtitle>
				</v-list-item-content>

				<v-list-item-action class="merged-actions">
					<v-btn icon :title="$root.lang().database.packs.modal.edit_pack" @click="openModal(pack)">
						<v-icon color="lighten-1">mdi-pencil</v-icon>
					</v-btn>
					<v-btn
						icon
						:title="$root.lang().database.packs.modal.delete_pack"
						@click="askRemove(pack)"
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

import PackModal from "./pack-modal.vue";
import PackRemoveConfirm from "./pack-remove-confirm.vue";

import { generatePageStyles } from "@helpers/colors.js";

export default {
	name: "pack-page",
	components: {
		SmartGrid,
		PackModal,
		PackRemoveConfirm,
	},
	data() {
		return {
			pageColor: "purple lighten-1",
			pageStyles: "",
			search: "",
			textColorOnPage: "white--text",
			tags: [],
			packs: [],
			modalOpen: false,
			modalData: {},
			modalAdd: false,
			remove: {
				open: false,
				data: {},
			},
		};
	},
	methods: {
		activeTag(t) {
			const result = {};
			result[`v-btn--active ${this.pageColor} ${this.textColorOnPage}`] =
				(t === "all" && !this.tag) || (t && this.tag && t.toLowerCase() === this.tag.toLowerCase());

			return result;
		},
		startSearch() {
			// change url to match
			const newPath = this.packURL(this.tag);
			if (newPath !== this.$route.path) return this.$router.push(newPath);

			// "all" tag searches everything
			const url = new URL(`${this.$root.apiURL}/packs/search`);
			if (this.tags.includes(this.$route.params.tag))
				url.searchParams.set("tag", this.$route.params.tag);

			axios
				.get(url.toString())
				.then((res) => {
					this.packs = res.data;
				})
				.catch((err) => {
					console.error(err);
					this.$root.showSnackBar(err, "error");
				});
		},
		packURL(tag) {
			return `/packs/${tag || "all"}`;
		},
		formatTags(s) {
			return s
				.split("_")
				.map((p) => (p == "progart" ? "Programmer Art" : p.toTitleCase()))
				.join(" ");
		},
		openModal(data) {
			this.modalOpen = true;
			this.modalData = data || {};
			this.modalAdd = data === undefined;
		},
		close(refresh = false) {
			this.modalOpen = false;
			// clear form
			this.modalData = {};
			if (refresh) this.startSearch();
		},
		askRemove(data) {
			this.remove.data = data;
			this.remove.open = true;
		},
	},
	computed: {
		packTags() {
			return ["all", ...this.tags];
		},
		tag() {
			return this.$route.params.tag || "all";
		},
	},
	mounted() {
		axios
			.get(`${this.$root.apiURL}/packs/tags`)
			.then((res) => {
				this.tags = res.data;
			})
			.catch((err) => {
				console.error(err);
				this.$root.showSnackBar(err, "error");
			});
		this.startSearch();
		this.pageStyles = generatePageStyles(this.pageColor);
	},
	watch: {
		"$route.params": {
			handler(params, old) {
				// if hash changed but not params
				if (JSON.stringify(params) === JSON.stringify(old)) return;

				// search whenever the url changes (when tag is switched)
				this.startSearch();
			},
		},
	},
};
</script>
