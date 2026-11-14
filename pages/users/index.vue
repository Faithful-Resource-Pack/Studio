<template>
	<v-container>
		<!-- eslint-disable-next-line vue/no-v-html -->
		<div class="styles" v-html="pageStyles" />
		<user-modal
			v-model="modalOpen"
			:color="pageColor"
			:add="Object.keys(modalData).length === 0"
			:data="modalData"
			:roles="roles"
			@close="closeUserModal"
		/>
		<user-remove-confirm v-model="remove.open" :data="remove.data" @close="update" />

		<h1 class="text-h4 py-4">
			{{ $root.lang().database.users.title }}
		</h1>

		<!-- role switcher -->
		<h2 class="text-h5 my-2">{{ $root.lang().database.users.role_filter }}</h2>
		<div class="selector">
			<v-btn
				v-for="userRole in userRoles"
				:key="userRole"
				:class="['my-1 mr-2', roleClass(userRole)]"
				:to="userURL(userRole)"
				:exact="userRole === 'all'"
			>
				{{ userRole }}
			</v-btn>
		</div>

		<!-- search -->
		<h2 class="text-h5 my-2">{{ $root.lang().database.search }}</h2>
		<search-box
			v-model="search"
			class="my-2"
			:color="pageColor"
			:placeholder="$root.lang().database.users.search_username"
			@search="startSearch"
			@clear="clearSearch"
		/>

		<!-- main buttons -->
		<v-btn block :color="pageColor" :class="[textColorOnPage, 'my-6']" @click="openModal({})">
			<v-icon left>mdi-plus</v-icon>
			{{ $root.lang().database.users.modal.add_user }}
		</v-btn>

		<!-- results -->
		<h2 class="text-h5 my-2">{{ $root.lang().database.users.user_result }} ({{ users.length }})</h2>

		<smart-grid :loading="loading" :items="users" wide track="id">
			<template #default="user">
				<a
					:href="`https://faithfulpack.net/user/${user.id}`"
					target="_blank"
					rel="noopener noreferrer"
				>
					<v-list-item-avatar v-if="user.uuid" class="database-list-sprite" tile>
						<v-img :src="`https://vzge.me/face/96/${user.uuid}`" />
					</v-list-item-avatar>
					<v-list-item-avatar v-else class="database-list-avatar">
						<v-icon large>mdi-account</v-icon>
					</v-list-item-avatar>
				</a>

				<v-list-item-content>
					<v-list-item-title class="mb-1">{{ user.username }}</v-list-item-title>
					<v-list-item-subtitle>{{ user.id }}</v-list-item-subtitle>
					<v-chip-group column>
						<!-- remove padding on top and re-add on bottom for nicer wrapping -->
						<v-chip
							v-for="userRole in user.roles"
							:key="userRole"
							class="mt-0 mb-2"
							x-small
							:to="userURL(userRole)"
						>
							{{ userRole }}
						</v-chip>
					</v-chip-group>
				</v-list-item-content>

				<!-- action buttons -->
				<v-list-item-action class="merged-actions">
					<v-btn icon :title="$root.lang().database.users.modal.edit_user" @click="openModal(user)">
						<v-icon color="lighten-1">mdi-pencil</v-icon>
					</v-btn>
					<v-btn
						icon
						:title="$root.lang().database.users.modal.delete_user"
						@click="askRemove(user)"
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

import UserModal from "./user-modal.vue";
import UserRemoveConfirm from "./user-remove-confirm.vue";
import SmartGrid from "@layouts/smart-grid.vue";
import SearchBox from "@components/search-box.vue";

import { generatePageStyles } from "@helpers/colors.js";

export default {
	name: "users-page",
	components: {
		SmartGrid,
		SearchBox,
		UserModal,
		UserRemoveConfirm,
	},
	data() {
		return {
			pageColor: "indigo accent-2",
			textColorOnPage: "white--text",
			pageStyles: "",
			search: "",
			roles: [],
			users: [],
			loading: false,
			modalOpen: false,
			modalData: {},
			remove: {
				open: false,
				data: {},
			},
		};
	},
	methods: {
		roleClass(role) {
			const result = {};
			result[`v-btn--active ${this.pageColor} ${this.textColorOnPage}`] =
				(role === "all" && !this.role && !!this.name) ||
				(role && this.role && role.toLowerCase() === this.role.toLowerCase());

			return result;
		},
		userURL(role) {
			return `/users/${role}/${this.name || ""}`;
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

			this.getUsers();
		},
		getRoles() {
			axios
				.get(`${this.$root.apiURL}/users/roles`)
				.then((response) => {
					this.roles = response.data;
				})
				.catch((error) => {
					console.error(error);
				})
				.finally(() => {
					this.$nextTick(() => {
						this.search = this.name;
					});
				});
		},
		getUsers() {
			this.loading = true;
			const url = `${this.$root.apiURL}${this.$route.path
				.split("/")
				.map((str) => (str === "users" ? "users/role" : str))
				.join("/")}`;
			axios
				.get(url, this.$root.apiOptions)
				.then((res) => {
					this.users = Array.isArray(res.data) ? res.data : [res.data];
				})
				.catch((err) => console.error(err))
				.finally(() => {
					this.loading = false;
				});
		},
		update(success = true) {
			if (success) this.getUsers();
			this.getRoles();
		},
		clearSearch() {
			this.search = "";
			this.startSearch();
		},
		openModal(data) {
			this.modalData = data;
			this.modalOpen = true;
		},
		closeUserModal(refresh = false) {
			this.modalData = {};
			if (refresh) this.update();
		},
		askRemove(data) {
			this.remove.data = data;
			this.remove.open = true;
		},
	},
	computed: {
		userRoles() {
			return ["all", ...this.roles];
		},
		role() {
			if (this.$route.params.role && this.userRoles.includes(this.$route.params.role))
				return this.$route.params.role;
			return undefined;
		},
		name() {
			if (this.role !== undefined) return this.$route.params.name;
			return this.$route.params.role;
		},
	},
	watch: {
		"$route.params.role"() {
			this.startSearch();
		},
	},
	mounted() {
		this.update(true);
		this.pageStyles = generatePageStyles(this.pageColor);
	},
};
</script>
