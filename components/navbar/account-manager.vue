<template>
	<modal-form v-model="modalOpen" :title="$root.lang().global.account_manager.title" hide-actions>
		<v-list>
			<v-list-item v-for="profile in profiles" :key="profile.id" class="px-0">
				<v-list-item-avatar style="border-radius: 0 !important">
					<v-img
						:src="`https://vzge.me/face/80/${profile.uuid || 'X-Steve'}`"
						:alt="getAvatarAlt(profile.username)"
						style="image-rendering: pixelated"
					>
					</v-img>
				</v-list-item-avatar>
				<v-list-item-content>
					<v-list-item-title>
						{{ profile.username }}
					</v-list-item-title>
					<v-list-item-subtitle
						v-if="profile.id === $root.user.id"
						class="primary--text font-weight-bold"
					>
						{{ $root.lang().global.account_manager.active_account }}
					</v-list-item-subtitle>
				</v-list-item-content>

				<v-list-item-action class="merged-actions">
					<v-btn
						icon
						:disabled="profile.id === $root.user.id"
						:title="$root.lang().global.account_manager.switch_accounts"
						@click="$root.auth.switchAccount(profile.id)"
					>
						<v-icon color="lighten-1">mdi-swap-horizontal</v-icon>
					</v-btn>
					<v-btn icon :title="$root.lang().global.logout" @click="$root.auth.logout(profile.id)">
						<v-icon color="red lighten-1">mdi-logout</v-icon>
					</v-btn>
				</v-list-item-action>
			</v-list-item>
		</v-list>

		<v-btn block class="mt-2" color="secondary" :href="$root.loginURL">
			<v-icon left>mdi-plus</v-icon>
			{{ $root.lang().global.account_manager.add_account }}
		</v-btn>
	</modal-form>
</template>

<script>
import axios from "axios";
import { AUTH_STORAGE_KEY } from "../../stores/discordTokenStore.js";

import ModalForm from "@layouts/modal-form.vue";

export default {
	name: "account-manager",
	components: {
		ModalForm,
	},
	props: {
		value: {
			required: true,
			type: Boolean,
		},
	},
	emits: ["input"],
	data() {
		return {
			modalOpen: false,
			accounts: [],
			profiles: [],
		};
	},
	methods: {
		computeAccounts() {
			this.accounts = Object.keys(JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || "{}") || {});
		},
		closeModal() {
			this.modalOpen = false;
		},
		getAvatarAlt(username) {
			return this.$root.lang().global.account_manager.avatar_alt_text.replace("%s", username);
		},
	},
	watch: {
		value(newValue) {
			this.modalOpen = newValue;
		},
		modalOpen(newValue) {
			this.$emit("input", newValue);
		},
		accounts: {
			handler(newValue) {
				if (!newValue.length) return;
				// realistically there's no way a user can overflow this
				axios.get(`${this.$root.apiURL}/users/${newValue.join(",")}`).then((res) => {
					this.profiles = Array.isArray(res.data) ? res.data : [res.data];
				});
			},
			deep: true,
		},
	},
	created() {
		this.$root.auth.addChangeListener(() => this.computeAccounts());
		this.computeAccounts();
	},
};
</script>
