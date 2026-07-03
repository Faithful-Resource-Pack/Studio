<template>
	<modal-form
		v-model="modalOpened"
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
		<template v-if="transferredAddons.length || deletedAddons.length">
			<h2 class="title">{{ addonDeleteTitle }}</h2>
			<template v-if="deletedAddons.length">
				<h3 class="subtitle-1 mb-n1 mt-3">
					{{ $root.lang().profile.delete.addons.deleted }} ({{ deletedAddons.length }})
				</h3>
				<v-list>
					<v-list-item v-for="addon in deletedAddons" :key="addon.id">
						<v-list-item-content>
							<v-list-item-title>
								{{ addon.name }}
							</v-list-item-title>
							<v-list-item-subtitle>
								<v-badge dot inline :color="colors[addon.approval.status]" />
								{{ $root.lang().addons.status[addon.approval.status] }}
								<v-btn
									v-if="addon.approval.status === 'approved'"
									color="blue"
									:href="`https://faithfulpack.net/addons/${addon.slug}`"
									target="_blank"
									rel="noopener noreferrer"
									:title="$root.lang().addons.general.go_to_addon"
									icon
									small
								>
									<v-icon small>mdi-open-in-new</v-icon>
								</v-btn>
							</v-list-item-subtitle>
						</v-list-item-content>
					</v-list-item>
				</v-list>
			</template>
			<template v-if="transferredAddons.length">
				<h3 class="subtitle-1 mb-n1 mt-3">
					{{ $root.lang().profile.delete.addons.transferred }} ({{ transferredAddons.length }})
				</h3>
				<v-list>
					<v-list-item v-for="addon in transferredAddons" :key="addon.id">
						<v-list-item-content>
							<v-list-item-title>
								{{ addon.name }}
							</v-list-item-title>
							<v-list-item-subtitle>
								<v-badge dot inline :color="colors[addon.approval.status]" />
								{{ $root.lang().addons.status[addon.approval.status] }}
								<v-btn
									v-if="addon.approval.status === 'approved'"
									color="blue"
									:href="`https://faithfulpack.net/addons/${addon.slug}`"
									target="_blank"
									rel="noopener noreferrer"
									:title="$root.lang().addons.general.go_to_addon"
									icon
									small
								>
									<v-icon small>mdi-open-in-new</v-icon>
								</v-btn>
							</v-list-item-subtitle>
						</v-list-item-content>
					</v-list-item>
				</v-list>
			</template>
		</template>
	</modal-form>
</template>

<script>
import axios from "axios";
import ModalForm from "@layouts/modal-form.vue";

export default {
	name: "user-remove-confirm",
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
		profile: {
			type: Boolean,
			required: false,
			default: false,
		},
	},
	emits: ["input", "close"],
	data() {
		return {
			modalOpened: false,
			colors: {
				approved: "green",
				pending: "yellow",
				denied: "red",
				archived: "grey",
			},
			transferredAddons: [],
			deletedAddons: [],
		};
	},
	methods: {
		deleteUser() {
			this.$root
				.wrapSnackBar(
					// apiOptions works for self-deletion as well
					axios.delete(`${this.$root.apiURL}/users/${this.data.id}`, this.$root.apiOptions),
				)
				.then(() => this.$emit("close", true));
		},
		getAddons() {
			axios
				.get(`${this.$root.apiURL}/users/${this.data.id}/addons`, this.$root.apiOptions)
				.then((res) => {
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
			this.modalOpened = newValue;
		},
		modalOpened(newValue) {
			this.$emit("input", newValue);
		},
		"data.id"() {
			this.getAddons();
		},
	},
};
</script>
