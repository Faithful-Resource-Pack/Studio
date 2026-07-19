<template>
	<modal-form
		v-model="modalOpened"
		:disabled="!isValid"
		:title="modalTitle"
		@close="$emit('close')"
		@submit="send"
	>
		<use-modal
			v-model="useModalOpen"
			:color="color"
			:add="useModalAdd"
			:textureID="formData.id"
			:data="useModalData"
			@close="closeUseModal"
		/>
		<texture-remove-confirm
			v-model="remove.open"
			type="use"
			:data="remove.data"
			:color="color"
			@close="closeAndUpdate"
		/>
		<v-form ref="form">
			<v-text-field
				v-model="formData.id"
				:disabled="!add"
				:color="color"
				persistent-hint
				:hint="'⚠️ ' + $root.lang().database.textures.modal.id_hint"
				required
				:readonly="!add"
				:label="$root.lang().database.textures.modal.id"
			/>
			<v-text-field
				v-model="formData.name"
				:color="color"
				:autofocus="!$vuetify.breakpoint.mobile"
				required
				clearable
				:label="$root.lang().database.textures.modal.name"
			/>
			<v-combobox
				v-model="formData.tags"
				:color="color"
				:item-color="color"
				required
				multiple
				deletable-chips
				small-chips
				:items="tags"
				:label="$root.lang().database.textures.modal.tags"
				@change="updateTags(formData)"
			/>

			<h2 class="title">
				{{ $root.lang().database.textures.uses.title }} ({{ Object.keys(formData.uses).length }})
			</h2>
			<v-list v-if="Object.keys(formData.uses).length">
				<v-list-item v-for="(use, index) in formData.uses" :key="index" class="px-0">
					<v-list-item-avatar rounded :class="color" class="white--text use-id">
						#{{ index }}
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

					<v-list-item-action class="merged-actions">
						<v-btn
							icon
							:title="$root.lang().database.textures.uses.edit_use"
							@click="openUseModal(use, false)"
						>
							<v-icon color="lighten-1">mdi-pencil</v-icon>
						</v-btn>
						<v-btn
							icon
							:title="$root.lang().database.textures.delete_modal.title_use"
							@click="askRemoveUse(use)"
						>
							<v-icon color="red lighten-1">mdi-delete</v-icon>
						</v-btn>
					</v-list-item-action>
				</v-list-item>
			</v-list>
			<div v-else>{{ $root.lang().database.textures.uses.no_use_found }}</div>

			<v-btn block class="mt-2" color="secondary" @click="openUseModal(null, true)">
				<v-icon left>mdi-plus</v-icon>
				{{ $root.lang().database.textures.uses.add_use }}
			</v-btn>
			<v-btn
				v-if="Object.keys(formData.uses).length === 1"
				block
				class="white--text mt-2"
				:color="color"
				@click="openEditionUseModal"
			>
				<v-icon left>mdi-creation</v-icon>
				{{ addEditionUseLabel }}
			</v-btn>
		</v-form>
	</modal-form>
</template>

<script>
import axios from "axios";

import ModalForm from "@layouts/modal-form.vue";
import UseModal from "./use-modal.vue";
import TextureRemoveConfirm from "./texture-remove-confirm.vue";
import { formatTag, sortTags } from "@helpers/textures";
import { getTagFromPath, convertEditionPath } from "@helpers/paths";

export default {
	name: "texture-modal",
	components: {
		ModalForm,
		UseModal,
		TextureRemoveConfirm,
	},
	props: {
		value: {
			type: Boolean,
			required: true,
		},
		add: {
			type: Boolean,
			required: false,
			default: false,
		},
		data: {
			type: Object,
			required: true,
		},
		tags: {
			type: Array,
			required: false,
			default: () => [],
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
			formData: {
				name: "",
				tags: [],
				id: "",
				uses: {},
			},
			useModalOpen: false,
			useModalData: {},
			useModalAdd: false,
			remove: {
				open: false,
				data: {},
			},
		};
	},
	methods: {
		getCorrespondingEdition(edition) {
			return settings.editions.find((e) => e !== edition) || "bedrock";
		},
		openUseModal(data, add) {
			this.useModalData = data || { texture: this.formData.id };
			this.useModalAdd = add;
			this.useModalOpen = true;
		},
		openEditionUseModal() {
			// we already know at least one use exists at this point
			const use = Object.values(this.formData.uses)[0];
			const newEdition = this.getCorrespondingEdition(use.edition);
			axios
				.get(`${this.$root.apiURL}/uses/${use.id}/paths`)
				.then((res) => {
					this.useModalData = {
						edition: newEdition,
						name: use.name,
						texture: this.formData.id,
						paths: res.data.map((path) => ({
							name: convertEditionPath(path.name, newEdition),
							versions: [settings.versions[newEdition][0]],
							mcmeta: false,
						})),
					};
					this.useModalAdd = true;
					this.useModalOpen = true;
				})
				.catch((err) => {
					console.error(err);
					this.$root.showSnackBar(err, "error");
				});
		},
		closeUseModal() {
			// fix for previous modal's paths showing up in blank one
			this.useModalData = {};
			this.getUses(this.formData.id);
		},
		closeAndUpdate() {
			this.getUses(this.formData.id);
		},
		send() {
			if (!this.$root.isLoggedIn) return;

			const data = {
				name: this.formData.name,
				tags: sortTags(this.formData.tags),
			};

			// modal isn't used for adding anymore but oh well
			const promise = this.add
				? axios.post(`${this.$root.apiURL}/textures`, data, this.$root.apiOptions)
				: axios.put(
						`${this.$root.apiURL}/textures/${this.formData.id}`,
						data,
						this.$root.apiOptions,
					);

			return this.$root.wrapSnackBar(promise).then(() => this.$emit("close", true));
		},
		updateTags(data) {
			data.tags = sortTags(data.tags);
		},
		recomputeTagList() {
			// compute based on existing paths and uses
			axios
				.get(`${this.$root.apiURL}/textures/${this.formData.id}/paths`, this.$root.apiOptions)
				.then((res) => {
					this.formData.tags = sortTags([
						...Object.values(this.formData.uses).map(({ edition }) => edition.toTitleCase()),
						...(res.data || []).map((path) => formatTag(getTagFromPath(path.name))),
					]);
				})
				.catch((err) => console.error(err));
		},
		getUses(textureID) {
			axios
				.get(`${this.$root.apiURL}/textures/${textureID}/uses`, this.$root.apiOptions)
				.then((res) => {
					this.formData.uses = Object.values(res.data).reduce((acc, cur) => {
						acc[cur.id] = cur;
						return acc;
					}, {});
					// recompute tag list once uses are loaded
					this.recomputeTagList();
				})
				.catch((err) => console.error(err));
		},
		askRemoveUse(data) {
			this.remove.data = data;
			this.remove.open = true;
		},
	},
	computed: {
		modalTitle() {
			return this.add
				? this.$root.lang().database.textures.add_texture
				: this.$root.lang().database.textures.edit_texture;
		},
		addEditionUseLabel() {
			if (!Object.keys(this.formData).length) return;
			const newEdition = this.getCorrespondingEdition(Object.values(this.formData.uses)[0].edition);
			return this.$root
				.lang()
				.database.textures.uses.add_edition_use.replace("%edition%", newEdition.toTitleCase());
		},
		isValid() {
			return (
				this.formData.name !== "" &&
				this.formData.tags.length &&
				Object.keys(this.formData.uses).length
			);
		},
	},
	watch: {
		value(newValue) {
			this.modalOpened = newValue;
		},
		modalOpened(newValue) {
			this.$nextTick(() => {
				if (this.add) this.$refs.form.reset();
				else {
					this.formData.name = this.data.name;
					this.formData.tags = this.data.tags;
					this.formData.id = this.data.id;
					this.getUses(this.data.id);
				}
			});
			this.$emit("input", newValue);
		},
	},
};
</script>
