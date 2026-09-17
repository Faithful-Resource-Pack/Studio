<template>
	<v-list dense nav>
		<v-list-item two-line style="min-height: 0" to="/profile">
			<v-list-item-avatar left class="my-0">
				<v-img :src="$root.user?.avatar" :alt="avatarAlt">
					<template #placeholder>
						<div
							class="d-flex align-center justify-center white--text"
							style="height: 100%; background-color: #1c8a2e"
						>
							{{ $root.user.username?.[0] || "?" }}
						</div>
					</template>
				</v-img>
			</v-list-item-avatar>
			<v-list-item-content>
				<v-list-item-title class="body-2" style="text-overflow: ellipsis; white-space: nowrap">
					{{ $root.user.username }}
				</v-list-item-title>
				<v-list-item-subtitle>@{{ $root.user.discordUsername }}</v-list-item-subtitle>
			</v-list-item-content>
		</v-list-item>
		<v-divider class="my-1" />
		<v-list-item
			:disabled="$root.user.anonymous"
			:href="`https://faithfulpack.net/user/${$root.user.id}`"
			target="_blank"
			rel="noopener noreferrer"
		>
			<v-list-item-icon class="me-4">
				<v-icon>mdi-account-box-outline</v-icon>
			</v-list-item-icon>
			<v-list-item-title>{{ $root.lang().global.navbar.profile.view }}</v-list-item-title>
		</v-list-item>
		<v-list-item href="https://faithfulpack.net" target="_blank" rel="noopener noreferrer">
			<v-list-item-icon class="align-center justify-center me-4">
				<span
					class="icon-faithful"
					:style="`background-color: ${$root.theme.isDark ? 'white' : 'rgba(0, 0, 0, 0.54)'}`"
				/>
			</v-list-item-icon>
			<v-list-item-title>{{ $root.lang().global.navbar.profile.main_site }}</v-list-item-title>
		</v-list-item>
		<v-list-item @click="$emit('open-accounts')">
			<v-list-item-icon class="me-4">
				<v-icon>mdi-account-switch</v-icon>
			</v-list-item-icon>
			<v-list-item-title>{{ $root.lang().global.navbar.profile.manage }}</v-list-item-title>
		</v-list-item>
		<v-list-item @click="copyID">
			<v-list-item-icon class="me-4">
				<v-icon>mdi-identifier</v-icon>
			</v-list-item-icon>
			<v-list-item-title>{{ $root.lang().global.navbar.profile.copy }}</v-list-item-title>
		</v-list-item>
		<v-list-item
			class="red--text lighten-1"
			color="red lighten-1"
			@click="() => $root.auth.logout()"
		>
			<!-- I have no idea why vuetify requires this to be specified red three times -->
			<v-list-item-icon class="me-4">
				<v-icon color="red lighten-1">mdi-logout</v-icon>
			</v-list-item-icon>
			<v-list-item-title class="red--text lighten-1">
				{{ $root.lang().global.logout }}
			</v-list-item-title>
		</v-list-item>
	</v-list>
</template>

<script>
export default {
	name: "user-menu",
	emits: ["open-accounts"],
	methods: {
		copyID() {
			navigator.clipboard.writeText(this.$root.user.id);
			this.$root.showSnackbar(this.$root.lang().global.navbar.profile.copied, "success");
		},
	},
	computed: {
		avatarAlt() {
			return this.$root
				.lang()
				.global.account_manager.avatar_alt_text.replace("%s", this.$root.user.username);
		},
	},
};
</script>
