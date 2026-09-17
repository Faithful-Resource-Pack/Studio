<template>
	<v-autocomplete
		v-model="content"
		:color="color"
		:item-color="color"
		:items="userList"
		:loading="users.length == 0 || isSearching"
		:search-input.sync="search"
		item-text="username"
		item-value="id"
		multiple
		v-bind="$attrs"
	>
		<!-- SELECTED THINGY -->
		<template #selection="data">
			<v-chip
				v-if="!limit || data.index < limit"
				:key="data.item.id"
				:input-value="data.selected"
				:disabled="data.disabled"
				close
				v-bind="data.attrs"
				@click:close="remove(data.item.id)"
			>
				<v-avatar class="white--text" :class="{ [color]: !data.item.uuid }" left>
					<v-img
						v-if="data.item.uuid"
						eager
						:src="`https://vzge.me/face/24/${data.item.uuid}`"
						:alt="getAvatarLetter(data.item)"
					/>
					<template v-else>{{ getAvatarLetter(data.item) }}</template>
				</v-avatar>
				{{ data.item.username || data.item.id }}
			</v-chip>
			<span v-else-if="!limit || data.index == limit">
				{{ "+ " + String(content.length - limit) }}
			</span>
		</template>
		<!-- LIST ITEM PART -->
		<template #item="data">
			<v-list-item-content v-if="typeof data.item === 'string'">
				{{ data.item }}
			</v-list-item-content>
			<template v-else>
				<v-list-item-content>
					<v-list-item-title>
						{{ formatTitle(data.item) }}
					</v-list-item-title>
					<v-list-item-subtitle v-if="data.item.contributions">
						{{ formatSubtitle(data.item) }}
					</v-list-item-subtitle>
				</v-list-item-content>
				<v-list-item-avatar :style="{ background: data.item.uuid ? 'transparent' : '#4e4e4e' }">
					<template v-if="data.item.uuid">
						<v-img eager :src="`https://vzge.me/head/48/${data.item.uuid}`" />
					</template>
					<span v-else class="white--text">{{ getAvatarLetter(data.item) }}</span>
				</v-list-item-avatar>
			</template>
		</template>
		<template #no-data>
			<v-btn block :color="color" class="mt-4" @click="startSearch(search)">
				<v-icon left dark>mdi-magnify</v-icon>
				{{ $root.lang().database.search }}
			</v-btn>
		</template>
	</v-autocomplete>
</template>

<script>
import axios from "axios";

const SEARCH_DELAY = 300;

export default {
	name: "user-select",
	props: {
		users: {
			type: Array,
			required: true,
		},
		value: {
			type: Array,
			required: true,
		},
		limit: {
			type: Number,
			required: false,
			default: () => 0,
		},
		color: {
			type: String,
			required: false,
			default: "primary",
		},
	},
	emits: ["input", "newUser"],
	data() {
		return {
			content: this.value,
			search: null,
			isSearching: false,
			searchTimeout: undefined,
			previousSearches: [],
			loadedUsers: {},
		};
	},
	methods: {
		startSearch(val) {
			val = val.trim();
			if (val.length < 3) return;

			// start search only if not searched before
			if (this.previousSearches.some((search) => search.includes(val))) return;
			this.previousSearches.push(val);
			this.isSearching = true;

			return axios
				.get(`${this.$root.apiURL}/users/role/all/${val}`)
				.then((res) => {
					const results = res.data;
					results.forEach((result) => {
						// in case some clever guy forgot their username or uuid or whatever
						const user = Object.merge(
							{
								username: "",
								uuid: "",
								roles: [],
								media: [],
							},
							result,
						);
						this.$set(this.loadedUsers, result.id, user);
					});
				})
				.catch((err) => {
					this.$root.showSnackbar(err, "error");
					console.error(err);
				})
				.finally(() => {
					this.isSearching = false;
				});
		},
		remove(id) {
			this.content = this.content.filter((c) => c !== id);
		},
		formatTitle(item) {
			return item.username || `${this.$root.lang().database.anonymous} (${item.id})`;
		},
		formatSubtitle(item) {
			const baseString = this.$root.lang().database.contributions;
			const rawString =
				item.contributions === 1
					? baseString.contribution_count_singular
					: baseString.contribution_count_plural;
			return rawString.replace("%d", item.contributions);
		},
		getAvatarLetter(item) {
			const text = item.username || String(item.id);
			return text[0];
		},
	},
	computed: {
		userList() {
			return [...this.users, ...Object.values(this.loadedUsers)];
		},
	},
	watch: {
		value: {
			handler(n, o) {
				if (JSON.stringify(n) !== JSON.stringify(o)) this.content = n;
			},
			immediate: true,
			deep: true,
		},
		content: {
			handler(n, o) {
				this.$emit("input", n);
				// reset search on select
				if (n.length > o.length) this.search = null;
			},
			deep: true,
		},
		search(val) {
			if (!val) return;

			if (this.searchTimeout) clearTimeout(this.searchTimeout);
			this.searchTimeout = setTimeout(() => {
				this.searchTimeout = undefined;
				this.startSearch(val);
			}, SEARCH_DELAY);
		},
		loadedUsers: {
			handler() {
				this.$emit("newUser", this.userList);
			},
			deep: true,
		},
	},
};
</script>
