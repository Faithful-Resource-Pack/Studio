<template>
	<v-container>
		<!-- eslint-disable-next-line vue/no-v-html -->
		<div class="styles" v-html="pageStyles" />

		<contribution-modal
			v-model="modalOpen"
			:data="modalData"
			:add="modalAdd"
			:packs="packs"
			:contributors="contributors"
			:color="pageColor"
			@close="closeModal"
		/>
		<contribution-remove-confirm
			v-model="remove.open"
			:data="remove.data"
			:packs="packs"
			:contributors="contributors"
			:textures="textures"
			@close="closeDeleteModal"
		/>

		<v-row no-gutters class="py-0 my-0" align="center">
			<v-col cols="12" sm="6">
				<h1 class="text-h4 py-4">
					{{ $root.lang().database.contributions.title }}
				</h1>
			</v-col>
			<v-col cols="12" sm="6">
				<v-btn block :color="pageColor" :class="textColorOnPage" @click="addContribution">
					<v-icon left>mdi-plus</v-icon>
					{{ $root.lang().database.contributions.add_contributions }}
				</v-btn>
			</v-col>
		</v-row>

		<!-- Pack selection -->
		<h2 class="text-h5 my-2">{{ $root.lang().database.contributions.pack_filter }}</h2>
		<div class="d-flex flex-wrap ma-n1">
			<v-card
				v-for="(packObj, key) in selectedPacks"
				:key="key + packObj.selected"
				class="ma-1 px-4 py-2 text-uppercase v-btn v-btn--has-bg font-weight-medium"
			>
				<v-checkbox
					v-model="packObj.selected"
					:label="packObj.label"
					:color="pageColor"
					hide-details
					class="ma-0 pt-0"
					@change="(val) => onPackChange(key, val)"
				/>
			</v-card>
		</div>

		<!-- Contribution search -->
		<h2 class="text-h5 my-2">{{ $root.lang().database.search }}</h2>
		<v-row align="stretch" class="my-2">
			<v-col cols="12" sm="6" class="pt-0 py-sm-0">
				<user-select
					v-model="selectedContributors"
					:color="pageColor"
					:label="$root.lang().database.contributions.user_filter"
					:placeholder="$root.lang().database.contributions.select_user"
					persistent-placeholder
					outlined
					hide-details
					clearable
					:users="contributors"
					@newUser="
						(users) => {
							contributors = users;
						}
					"
				/>
			</v-col>
			<v-col cols="12" sm="6" class="pb-0 py-sm-0">
				<v-text-field
					v-model="search"
					:label="$root.lang().database.contributions.texture_filter"
					:placeholder="$root.lang().database.textures.search_texture"
					persistent-placeholder
					outlined
					type="search"
					:color="pageColor"
					hide-details
					clearable
					@keyup.enter="startSearch()"
				/>
			</v-col>
		</v-row>

		<!-- Search button -->
		<v-btn block :color="pageColor" class="my-6" :class="textColorOnPage" @click="startSearch()">
			<v-icon left>mdi-magnify</v-icon>
			{{ $root.lang().database.contributions.search_contributions }}
		</v-btn>

		<div class="mb-2 text-h5">
			{{ $root.lang().database.contributions.contribution_result }} ({{ contributions.length }})
		</div>

		<smart-grid :loading="loading" :items="contributions" wide track="id">
			<template #default="contrib">
				<v-list-item-avatar tile class="database-list-sprite">
					<a :href="`/gallery?show=${contrib.texture}`" target="_blank" rel="noopener noreferrer">
						<v-img class="texture-img" :src="contrib.url" :lazy-src="packs[contrib.pack]?.logo" />
					</a>
				</v-list-item-avatar>

				<v-list-item-content>
					<v-list-item-title>
						[#{{ contrib.texture }}] {{ textures[contrib.texture]?.name }}
					</v-list-item-title>
					<v-list-item-subtitle>
						{{ packs[contrib.pack]?.name || contrib.pack }} • {{ $root.formatDate(contrib.date) }}
					</v-list-item-subtitle>
					<author-chips :contribution="contrib" :contributors="contributors" @set="setAuthor" />
				</v-list-item-content>

				<v-list-item-action class="merged-actions">
					<v-btn
						icon
						:title="$root.lang().database.contributions.edit_contribution"
						@click="editContribution(contrib)"
					>
						<v-icon color="lighten-1">mdi-pencil</v-icon>
					</v-btn>
					<v-btn
						icon
						:title="$root.lang().database.contributions.delete_contribution"
						@click="askRemove(contrib)"
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

import ContributionModal from "./contribution-modal.vue";
import ContributionRemoveConfirm from "./contribution-remove-confirm.vue";
import UserSelect from "@components/user-select.vue";
import SmartGrid from "@layouts/smart-grid.vue";
import AuthorChips from "./author-chips.vue";
import { generatePageStyles } from "@helpers/colors.js";

const ALL_PACK_KEY = "all";

export default {
	name: "contribution-page",
	components: {
		SmartGrid,
		UserSelect,
		AuthorChips,
		ContributionModal,
		ContributionRemoveConfirm,
	},
	data() {
		return {
			pageColor: "green darken-1",
			pageStyles: "",
			textColorOnPage: "white--text",
			// more convenient to have as object for retrieval
			selectedPacks: {
				[ALL_PACK_KEY]: {
					key: ALL_PACK_KEY,
					// reuse gallery translation because it's the same thing
					label: this.$root.lang().gallery.all,
					selected: true,
				},
			},
			contributors: [],
			selectedContributors: [],
			packs: {},
			textures: {},
			loading: false,
			search: "",
			contributions: [],
			modalOpen: false,
			modalAdd: false,
			modalData: null,
			remove: {
				open: false,
				data: {},
			},
		};
	},
	methods: {
		// expose for inline use
		addContribution() {
			this.modalOpen = true;
			this.modalAdd = true;
			this.modalData = null;
		},
		editContribution(contrib) {
			this.modalOpen = true;
			this.modalAdd = false;
			this.modalData = contrib;
		},
		closeModal(refresh = false) {
			this.modalData = null;
			if (refresh) this.startSearch();
		},
		askRemove(data) {
			this.remove.data = data;
			this.remove.open = true;
		},
		closeDeleteModal(refresh = false) {
			if (refresh) this.startSearch();
		},
		setAuthor(id) {
			this.selectedContributors = [id];
			this.$nextTick(() => this.startSearch());
		},
		onPackChange(key, isSelected) {
			if (!isSelected) {
				// do nothing, at least one is selected
				if (this.selectedPackKeys.length > 0) return;

				// needs to be changed on next tick, cannot change same data on same cycle
				return void this.$nextTick(() => {
					this.$set(this.selectedPacks[key], "selected", true);
				});
			}

			// just checked all, uncheck others
			if (key === ALL_PACK_KEY) {
				// have to buffer changes and apply them on next tick
				const acc = Object.values(this.selectedPacks).reduce((acc, cur) => {
					acc[cur.key] = { ...cur, selected: false };
					return acc;
				}, {});
				acc[ALL_PACK_KEY].selected = true;
				return void this.$nextTick(() => {
					this.selectedPacks = acc;
				});
			}

			// other pack
			this.$set(this.selectedPacks[ALL_PACK_KEY], "selected", false);
		},
		async startSearch() {
			let newPath = this.$route.params.name
				? this.$route.path.split("/").slice(0, -1).join("/")
				: this.$route.path;

			if (this.search) {
				if (!newPath.endsWith("/")) newPath += "/";
				newPath += this.search;
			}
			if (newPath !== this.$route.path) this.$router.push(newPath);

			this.loading = true;
			try {
				const res = await axios.get(this.searchURL);
				this.contributions = Object.values(res.data)
					.sort((a, b) => b.date - a.date)
					// store url on contribution itself (cleaner)
					.map((c) => {
						c.url = `${this.$root.apiURL}/textures/${c.texture}/url/${c.pack}/latest`;
						return c;
					});
			} catch (err) {
				this.$root.showSnackBar(err, "error");
			} finally {
				this.loading = false;
			}
		},
		async getPacks() {
			this.packs = (
				await axios.get(`${this.$root.apiURL}/packs/search?type=submission`)
			).data.reduce((acc, cur) => {
				// handle both at once
				acc[cur.id] = cur;
				this.selectedPacks[cur.id] = {
					key: cur.id,
					label: cur.name,
					selected: false,
				};
				return acc;
			}, {});
		},
		async getAuthors() {
			const authors = (await axios.get(`${this.$root.apiURL}/contributions/authors`)).data;
			// assign the result sorted by username
			this.contributors = authors.sort((a, b) => {
				if (!a.username && !b.username) return 0;
				if (a.username && !b.username) return 1;
				if (!a.username && b.username) return -1;

				return a.username.toLowerCase() > b.username.toLowerCase()
					? 1
					: b.username.toLowerCase() > a.username.toLowerCase()
						? -1
						: 0;
			});
		},
		async getTextures() {
			this.textures = (await axios.get(`${this.$root.apiURL}/textures/raw`)).data;
		},
	},
	computed: {
		selectedPackKeys() {
			return Object.keys(this.selectedPacks).filter((k) => this.selectedPacks[k].selected);
		},
		searchURL() {
			const url = new URL(`${this.$root.apiURL}/contributions/search`);
			url.searchParams.set("packs", this.selectedPackKeys.join("-"));
			url.searchParams.set("users", this.selectedContributors.join("-"));
			url.searchParams.set("search", this.search.replace(/ /g, "_"));
			return url.toString();
		},
	},
	watch: {
		contributors: {
			handler(newValue) {
				// FIX BUG WHERE USERS WITH NO CONTRIBUTIONS GET INCLUDED IN SEARCH
				const contributorIDs = new Set(newValue.map((c) => c.id));
				this.selectedContributors = this.selectedContributors.filter((c) => contributorIDs.has(c));
			},
			deep: true,
		},
	},
	created() {
		this.getTextures();
		this.getPacks();
		this.getAuthors();
		this.search = this.$route.params.name || "";
		this.$nextTick(() => this.startSearch());
	},
	mounted() {
		this.pageStyles = generatePageStyles(this.pageColor);
	},
};
</script>
