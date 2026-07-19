<template>
	<modal-form
		v-model="modalOpened"
		:max-width="type === 'texture' ? '1000' : '600'"
		danger
		:title="title"
		@close="$emit('close')"
		@submit="deleteData"
	>
		<v-row v-if="type === 'texture' && hasData">
			<v-col cols="12" md="6">
				<v-list-item class="px-0">
					<a :href="`/gallery?show=${data.id}`" target="_blank" rel="noopener noreferrer">
						<v-list-item-avatar class="database-list-avatar text--primary">
							#{{ data.id }}
						</v-list-item-avatar>
					</a>
					<v-list-item-content>
						<v-list-item-title>{{ data.name }}</v-list-item-title>
						<v-list-item-subtitle>{{ data.tags.join(", ") }}</v-list-item-subtitle>
					</v-list-item-content>
				</v-list-item>
				<v-divider class="my-5" />
				<h2 class="title">
					{{ $root.lang().database.textures.delete_modal.affected_uses }} ({{ uses.length }})
				</h2>
				<v-list v-if="uses.length">
					<v-list-item v-for="use in uses" :key="use.id" class="px-0">
						<v-list-item-avatar rounded :class="color" class="white--text use-id">
							#{{ use.id }}
						</v-list-item-avatar>
						<v-list-item-content>
							<v-list-item-title>
								<template v-if="use.name">{{ use.name }}</template>
								<template v-else>
									<i>{{ $root.lang().database.nameless }}</i>
								</template>
							</v-list-item-title>
							<v-list-item-subtitle>{{ use.edition.toTitleCase() }}</v-list-item-subtitle>
						</v-list-item-content>
					</v-list-item>
				</v-list>

				<!-- vuetify pads an inner element so we have to undo it instead of just override -->
				<v-skeleton-loader v-else type="list-item-avatar-two-line" class="mx-n4" />
				<v-divider class="my-5" />
				<h2 class="title">
					{{ $root.lang().database.textures.delete_modal.affected_paths }} ({{ paths.length }})
				</h2>
				<v-list v-if="paths.length">
					<v-list-item v-for="path in paths" :key="path.id" class="px-0">
						<v-list-item-content>
							<v-list-item-title>{{ path.name }}</v-list-item-title>
							<v-list-item-subtitle :title="path.versions.join(', ')">
								{{ path.id }}: {{ formatPathVersions(path.versions) }}
							</v-list-item-subtitle>
						</v-list-item-content>
					</v-list-item>
				</v-list>
				<v-skeleton-loader v-else type="list-item-two-line" class="mx-n4" />
			</v-col>

			<v-col cols="12" md="6">
				<h2 class="title">
					{{ $root.lang().database.textures.delete_modal.affected_contributions }}
					({{ contributions.length }})
				</h2>
				<v-list v-if="!contributionsLoading">
					<v-list-item v-for="(contrib, i) in contributions" :key="contrib.id" class="px-0">
						<a :href="contrib.url" target="_blank" rel="noopener noreferrer">
							<v-list-item-avatar v-if="contrib.url" class="database-list-sprite" tile>
								<v-img
									v-if="contrib.url"
									class="texture-img"
									:src="contrib.url"
									@error="imageNotFound(i)"
								/>
							</v-list-item-avatar>
							<v-list-item-avatar v-else class="database-list-avatar">
								<v-icon large>mdi-image</v-icon>
							</v-list-item-avatar>
						</a>
						<v-list-item-content>
							<v-list-item-title>
								{{ `${packToName[contrib.pack]} • ${$root.formatDate(contrib.date)}` }}
							</v-list-item-title>
							<v-list-item-subtitle>
								{{
									(contrib.authors || [])
										.map((id) => discordIDtoName[id]?.username || id)
										.join(", ")
								}}
							</v-list-item-subtitle>
						</v-list-item-content>
					</v-list-item>
				</v-list>
				<!-- since this is the only thing on the right panel add a few so it looks less empty -->
				<v-skeleton-loader
					v-for="i in 3"
					v-else
					:key="i"
					type="list-item-avatar-two-line"
					class="mx-n4"
				/>
			</v-col>
		</v-row>

		<template v-if="type === 'use' && hasData">
			<v-list-item class="px-0">
				<v-list-item-avatar rounded :class="color" class="white--text use-id">
					#{{ data.id }}
				</v-list-item-avatar>
				<v-list-item-content>
					<v-list-item-title>
						<template v-if="data.name">{{ data.name }}</template>
						<template v-else>
							<i>{{ $root.lang().database.nameless }}</i>
						</template>
					</v-list-item-title>
					<v-list-item-subtitle>{{ data.edition.toTitleCase() }}</v-list-item-subtitle>
				</v-list-item-content>
			</v-list-item>
			<v-divider class="my-5" />
			<h2 class="title">
				{{ $root.lang().database.textures.delete_modal.affected_paths }} ({{ paths.length }})
			</h2>
			<v-list v-if="paths.length">
				<v-list-item v-for="path in paths" :key="path.id" class="px-0">
					<v-list-item-content>
						<v-list-item-title>{{ path.name }}</v-list-item-title>
						<v-list-item-subtitle>
							{{ path.id }}: {{ formatPathVersions(path.versions) }}
						</v-list-item-subtitle>
					</v-list-item-content>
				</v-list-item>
			</v-list>
			<v-skeleton-loader v-else type="list-item-two-line" class="mx-n4" />
		</template>
		<template v-if="type === 'path' && hasData">
			<v-list-item class="px-0">
				<v-list-item-content>
					<v-list-item-title>{{ data.name }}</v-list-item-title>
					<v-list-item-subtitle>
						{{ data.id }}: {{ formatPathVersions(data.versions) }}
					</v-list-item-subtitle>
				</v-list-item-content>
			</v-list-item>
		</template>
	</modal-form>
</template>

<script>
import axios from "axios";
import ModalForm from "@layouts/modal-form.vue";
import versionSorter from "@helpers/versionSorter";

export default {
	name: "texture-remove-confirm",
	components: {
		ModalForm,
	},
	props: {
		value: {
			type: Boolean,
			required: true,
		},
		data: {
			type: Object,
			required: true,
		},
		type: {
			type: String,
			required: true,
		},
		color: {
			type: String,
			required: false,
			default: "primary",
		},
	},
	emits: ["input", "close"],
	data() {
		return {
			modalOpened: false,
			deletePaths: true,
			uses: [],
			rawPaths: [],
			contributionsLoading: true,
			contributions: [],
			packToName: {},
			discordIDtoName: {},
		};
	},
	methods: {
		loadTextureInformation(textureId) {
			axios.get(`${this.$root.apiURL}/textures/${textureId}/all`).then((res) => {
				this.uses = res.data.uses;
				this.rawPaths = res.data.paths;
				this.contributions = res.data.contributions
					.sort((a, b) => b.date - a.date)
					.map((c) => ({
						...c,
						url: `${this.$root.apiURL}/textures/${c.texture}/url/${c.pack}/latest`,
					}));
			});

			// only need to cache once if deleting multiple textures in one session
			if (!Object.keys(this.packToName).length)
				axios.get(`${this.$root.apiURL}/packs/raw`).then((res) => {
					this.packToName = Object.values(res.data).reduce((acc, cur) => {
						acc[cur.id] = cur.name;
						return acc;
					}, {});
				});

			if (!Object.keys(this.discordIDtoName).length)
				axios
					.get(`${this.$root.apiURL}/contributions/authors`)
					.then((res) => {
						this.discordIDtoName = res.data.reduce((acc, cur) => {
							acc[cur.id] = cur;
							return acc;
						}, {});
					})
					.finally(() => {
						this.contributionsLoading = false;
					});
		},
		loadUseInformation(useId) {
			axios
				.get(`${this.$root.apiURL}/uses/${useId}/paths`, this.$root.apiOptions)
				.then((res) => {
					this.rawPaths = res.data;
				})
				.catch((err) => {
					this.$root.showSnackBar(err, "error");
					console.error(err);
				});
		},
		deleteData() {
			// firestorm id field is the same for all collections
			const id = this.data.id;
			switch (this.type) {
				case "texture":
					return this.$root
						.wrapSnackBar(
							axios.delete(`${this.$root.apiURL}/textures/${id}`, this.$root.apiOptions),
						)
						.then(() => this.$emit("close", true));
				case "use":
					return this.$root
						.wrapSnackBar(axios.delete(`${this.$root.apiURL}/uses/${id}`, this.$root.apiOptions))
						.then(() => this.$emit("close", true));
				case "path":
					return this.$root
						.wrapSnackBar(axios.delete(`${this.$root.apiURL}/paths/${id}`, this.$root.apiOptions))
						.then(() => this.$emit("close", true));
			}
		},
		formatPathVersions(versions) {
			if (versions.length === 1) return versions[0];
			// use nbsp to prevent weirdness on mobile
			return `${versions[0]} – ${versions[versions.length - 1]}`;
		},
		imageNotFound(index) {
			this.contributions[index].url = null;
		},
	},
	computed: {
		title() {
			return this.$root.lang().database.textures.delete_modal[`title_${this.type}`];
		},
		hasData() {
			return Object.keys(this.data).length;
		},
		// easier to do it like this than to map both with texture/use info separately
		paths() {
			return this.rawPaths.map((p) => ({
				...p,
				versions: Array.from(p.versions).sort(versionSorter),
			}));
		},
	},
	watch: {
		value(newValue) {
			this.modalOpened = newValue;
		},
		modalOpened(newValue) {
			this.uses = [];
			this.rawPaths = [];
			this.contributions = [];

			switch (this.type) {
				case "texture":
					this.loadTextureInformation(this.data.id);
					break;
				case "use":
					this.loadUseInformation(this.data.id);
					break;
			}
			this.$emit("input", newValue);
		},
	},
};
</script>
