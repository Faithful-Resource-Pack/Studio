<template>
	<modal-form
		v-model="modalOpen"
		danger
		scrollable
		:title="$root.lang().database.users.modal.delete_user"
		@close="$emit('close', false)"
		@submit="deleteUser"
	>
		<v-sheet style="position: sticky; top: 0px; z-index: 998">
			<v-alert type="warning" outlined dense>{{ $root.lang().profile.delete.warning }}</v-alert>
			<v-list-item class="px-0">
				<a
					:href="`https://faithfulpack.net/user/${data.id}`"
					target="_blank"
					rel="noopener noreferrer"
				>
					<v-list-item-avatar v-if="data.uuid" class="database-list-sprite" tile>
						<v-img :src="`https://vzge.me/face/96/${data.uuid}`" />
					</v-list-item-avatar>
					<v-list-item-avatar v-else class="database-list-avatar">
						<v-icon large>mdi-account</v-icon>
					</v-list-item-avatar>
				</a>
				<v-list-item-content>
					<v-list-item-title class="mb-1">{{ data.username }}</v-list-item-title>
					<v-list-item-subtitle>{{ data.id }}</v-list-item-subtitle>
					<v-chip-group column>
						<!-- remove padding on top and re-add on bottom for nicer wrapping -->
						<v-chip v-for="userRole in data.roles" :key="userRole" class="mt-0 mb-2" x-small>
							{{ userRole }}
						</v-chip>
					</v-chip-group>
				</v-list-item-content>
			</v-list-item>
			<v-divider v-if="transferredAddons.length || deletedAddons.length" class="my-5" />
		</v-sheet>
		<div v-if="deletedAddons.length || transferredAddons.length">
			<h2 class="title my-2">{{ addonDeleteTitle }}</h2>
			<!-- also serves as a subtitle if there's only one tab -->
			<v-tabs v-model="tab" grow>
				<v-tab :disabled="!deletedAddons.length">
					{{ $root.lang().profile.delete.addons.deleted }} ({{ deletedAddons.length }})
				</v-tab>
				<v-tab :disabled="!transferredAddons.length">
					{{ $root.lang().profile.delete.addons.transferred }} ({{ transferredAddons.length }})
				</v-tab>
			</v-tabs>
			<v-tabs-items v-model="tab">
				<v-tab-item>
					<user-addon-list :addons="deletedAddons" />
				</v-tab-item>
				<v-tab-item>
					<user-addon-list :addons="transferredAddons" />
				</v-tab-item>
			</v-tabs-items>
		</div>
	</modal-form>
</template>

<script>
import axios from "axios";
import ModalForm from "@layouts/modal-form.vue";
import UserAddonList from "./user-addon-list.vue";

export default {
	name: "user-remove-confirm",
	components: {
		ModalForm,
		UserAddonList,
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
		profile: {
			type: Boolean,
			required: false,
			default: false,
		},
	},
	emits: ["input", "close"],
	data() {
		return {
			modalOpen: false,
			transferredAddons: [],
			deletedAddons: [],
			tab: null,
		};
	},
	methods: {
		deleteUser() {
			this.$root
				.wrapSnackbar(
					// apiOptions works for self-deletion as well
					axios.delete(`${this.$root.apiURL}/users/${this.data.id}`, this.$root.apiOptions),
				)
				.then(() => this.$emit("close", true));
		},
		getAddons() {
			axios
				.get(`${this.$root.apiURL}/users/${this.data.id}/addons`, this.$root.apiOptions)
				.then((res) => {
					this.tab = null;
					this.transferredAddons = res.data.filter((a) => a.authors.length > 1);
					this.deletedAddons = res.data.filter((a) => a.authors.length === 1);
				});
		},
	},
	computed: {
		addonDeleteTitle() {
			const count = this.transferredAddons.length + this.deletedAddons.length;
			const titleKey = count === 1 ? "title_singular" : "title_plural";
			return this.$root.lang().profile.delete.addons[titleKey].replace("%d", count);
		},
	},
	watch: {
		value(newValue) {
			this.modalOpen = newValue;
		},
		modalOpen(newValue) {
			this.$emit("input", newValue);
		},
		"data.id"() {
			this.getAddons();
		},
	},
};
</script>
