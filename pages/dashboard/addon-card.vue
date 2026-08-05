<template>
	<dashboard-card
		id="addon-card"
		:title="$root.lang().dashboard.titles.addons"
		to="/addons/review"
		:clickable="$root.isAdmin"
		class="d-flex flex-column justify-space-between"
	>
		<v-card-text class="pb-0 flex-grow-1 d-flex flex-column">
			<template v-if="!loading">
				<v-row dense>
					<template v-for="status in statuses">
						<v-col
							v-if="data[status] !== undefined"
							:key="status"
							cols="12"
							:sm="{ 3: $root.isAdmin }"
						>
							<dashboard-stat
								:label="$root.lang().review.titles[status]"
								:value="data[status] || 0"
								:color="statusColor[status]"
							/>
						</v-col>
					</template>
				</v-row>
				<v-row dense>
					<v-col
						v-for="(number, tag) in data.numbers"
						:key="tag"
						cols="12"
						sm="6"
						class="d-flex align-stretch"
					>
						<dashboard-stat :label="packs[tag]?.name || tag" :value="number" />
					</v-col>
				</v-row>
			</template>
			<template v-else>
				<v-row dense>
					<v-col
						v-for="i in skeletonCount"
						:key="`skeleton-status-${i}`"
						cols="12"
						:sm="{ 3: $root.isAdmin }"
					>
						<div
							class="dashboard-stat mb-0 flex-grow-1 rounded-lg pa-2 d-flex align-center paragraph-loader"
						>
							<div class="d-flex align-end">
								<v-skeleton-loader class="loader mr-2" width="30" height="24" type="heading" />
								<v-skeleton-loader class="loader" width="60" min-height="14" type="text" />
							</div>
						</div>
					</v-col>
				</v-row>
				<v-row dense>
					<v-col v-for="i in 4" :key="`skeleton-stats-${i}`" cols="12" sm="6">
						<div
							class="dashboard-stat mb-0 flex-grow-1 rounded-lg pa-2 d-flex align-center paragraph-loader"
						>
							<div class="d-flex align-end">
								<v-skeleton-loader class="loader mr-2" width="30" height="24" type="heading" />
								<v-skeleton-loader class="loader" width="120" min-height="14" type="text" />
							</div>
						</div>
					</v-col>
				</v-row>
			</template>
		</v-card-text>
		<v-card-actions v-if="$root.isLoggedIn" class="d-flex mt-0 px-4 pt-1">
			<v-row dense>
				<v-col>
					<v-btn block text color="primary" to="/addons/new">
						<v-icon left>mdi-plus-thick</v-icon>
						{{ $root.lang().dashboard.addons.upload }}
					</v-btn>
				</v-col>
				<v-col>
					<v-btn block text color="primary" to="/addons/submissions">
						<v-icon left>mdi-plus-box-multiple</v-icon>
						{{ $root.lang().dashboard.addons.submissions }}
					</v-btn>
				</v-col>
			</v-row>
		</v-card-actions>

		<!-- fix missing bottom margin when user isn't logged in -->
		<span v-else class="mb-3" />
	</dashboard-card>
</template>

<script>
import axios from "axios";
import DashboardCard from "./dashboard-card.vue";
import DashboardStat from "./dashboard-stat.vue";

export default {
	name: "addon-card",
	components: {
		DashboardCard,
		DashboardStat,
	},
	data() {
		return {
			data: {},
			packs: {},
			loading: true,
		};
	},
	computed: {
		statusColor() {
			// bit janky but it does work
			const archivedModifier = this.$root.theme.isDark ? "lighten-2" : "darken-2";
			return {
				approved: "success--text",
				pending: "warning--text",
				denied: "error--text",
				archived: `grey--text text--${archivedModifier}`,
			};
		},
		adminResults() {
			return this.data && Object.keys(this.data).length > 2;
		},
		statuses() {
			return Object.keys(this.statusColor);
		},
		roles() {
			return this.$root.user.roles.length;
		},
		endpointURL() {
			return this.$root.isAdmin ? "/addons/stats-admin" : "/addons/stats";
		},
		skeletonCount() {
			return this.$root.isAdmin ? 4 : 1;
		},
	},
	methods: {
		get() {
			this.loading = true;
			axios
				.get(this.$root.apiURL + this.endpointURL, this.$root.apiOptions)
				.then((res) => {
					this.data = res.data;
				})
				.finally(() => {
					this.loading = false;
				});
		},
	},
	created() {
		this.get();
		axios.get(`${this.$root.apiURL}/packs/raw`).then((res) => {
			this.packs = res.data;
		});
	},
	watch: {
		roles(n, o) {
			if (n != o && this.$root.isAdmin) {
				this.loading = true;
				this.get();
			}
		},
	},
};
</script>
