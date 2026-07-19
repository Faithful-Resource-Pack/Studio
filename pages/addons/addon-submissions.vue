<template>
	<v-container class="flex-grow-1">
		<v-row no-gutters class="my-2 py-0" align="center">
			<v-col cols="12" sm="6">
				<h1 class="text-h4 d-flex flex-row align-center my-2">
					{{ $root.lang().addons.titles.submissions }}
					<v-progress-circular v-if="loading" indeterminate class="ml-5" />
					<template v-else-if="addons.length">({{ addons.length }})</template>
				</h1>
			</v-col>
			<v-col cols="12" sm="6">
				<v-btn block class="my-2" color="secondary" to="/addons/new">
					<v-icon left>mdi-plus</v-icon>
					{{ $root.lang().addons.titles.submit }}
				</v-btn>
			</v-col>
		</v-row>

		<ascii-error
			v-if="!loading && !addons.length"
			:subtitle="error || $root.lang().addons.general.no_submissions"
			:errorCode="errorCode"
		/>
		<card-grid v-else :items="addons" :loading="loading">
			<template #default="addon">
				<!-- handles loading/error states automatically -->
				<emitting-image
					:src="addonHeader(addon)"
					:aspect-ratio="16 / 9"
					:alt="$root.lang().addons.images.header.labels.normal"
				/>
				<v-card-title class="d-block" style="word-break: break-word">
					{{ addon.name }}
					<v-btn
						v-if="addon.approval.status == 'approved'"
						right
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
				</v-card-title>
				<v-card-subtitle>
					{{ addonDate(addon.last_updated) }}
				</v-card-subtitle>
				<v-card-text class="d-flex align-start flex-grow-1">
					<v-badge dot inline :color="colors[addon.approval.status]" />
					<!-- by default it grows to the full container -->
					<v-list-item dense style="flex: unset; min-height: 0" class="px-2">
						<v-list-item-content class="py-0">
							<v-list-item-title>
								{{ $root.lang().addons.status[addon.approval.status] }}
							</v-list-item-title>
							<v-list-item-subtitle v-if="addon.approval.status !== 'approved'">
								{{ addon.approval.reason }}
							</v-list-item-subtitle>
						</v-list-item-content>
					</v-list-item>
				</v-card-text>
				<v-card-actions class="justify-end">
					<v-btn text :to="`/addons/edit/${addon.id}`">
						{{ $root.lang().global.btn.edit }}
					</v-btn>
					<v-btn color="red" text @click="deleteAddon(addon)">
						{{ $root.lang().global.btn.delete }}
					</v-btn>
				</v-card-actions>
			</template>
		</card-grid>

		<addon-remove-confirm v-model="remove.open" :data="remove.data" @close="getAddons" />
	</v-container>
</template>

<script>
import axios from "axios";

import CardGrid from "@layouts/card-grid.vue";
import AsciiError from "@components/ascii-error.vue";
import AddonRemoveConfirm from "./addon-remove-confirm.vue";
import EmittingImage from "@components/emitting-image.vue";

export default {
	name: "addon-submissions",
	components: {
		AsciiError,
		CardGrid,
		EmittingImage,
		AddonRemoveConfirm,
	},
	data() {
		return {
			addons: [],
			remove: {
				open: false,
				data: {},
			},
			colors: {
				approved: "green",
				pending: "yellow",
				denied: "red",
				archived: "grey",
			},
			error: undefined,
			errorCode: undefined,
			loading: true,
			failed: {},
			timestamp: Date.now(),
		};
	},
	methods: {
		deleteAddon(addon) {
			this.remove.data = addon;
			this.remove.open = true;
		},
		getAddons() {
			axios
				.get(`${this.$root.apiURL}/users/${this.$root.user.id}/addons`, this.$root.apiOptions)
				.then((res) => {
					this.addons = res.data.sort((a, b) => (b.last_updated || 0) - (a.last_updated || 0));
				})
				.catch((err) => {
					console.error(err);
					this.errorCode = err.response?.status;
					this.error =
						err.response.data?.message ||
						err.response.statusText ||
						this.$root.lang().addons.general.no_submissions;
				})
				.finally(() => {
					this.loading = false;
				});
		},
		addonHeader(addon) {
			return `${this.$root.apiURL}/addons/${addon.id}/header?discord=${this.$root.user.access_token}&t=${this.timestamp}`;
		},
		addonDate(date) {
			if (!date) return this.$root.lang().review.addon.titles.unknown_date;
			const formatted = this.$root.formatDate(date);
			return this.$root.lang().review.addon.titles.last_updated.replace("%s", formatted);
		},
	},
	mounted() {
		this.$root.auth.addChangeListener(() => this.getAddons());
		this.getAddons();
	},
};
</script>
