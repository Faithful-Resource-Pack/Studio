<template>
	<dashboard-card
		:title="$root.lang().dashboard.titles.contribution_activity"
		to="/contributions"
		:clickable="$root.isAdmin"
		class="d-flex flex-column"
	>
		<v-card-text class="pb-3 flex-grow-1 d-flex align-stretch">
			<v-row v-if="data" class="mb-0" style="width: 100%">
				<v-col
					v-for="(values, activity) in data.activity"
					:key="activity"
					cols="12"
					md="6"
					xl="4"
					class="pr-sm-2 d-flex flex-column justify-space-around pb-0"
				>
					<span class="uppercase text--secondary my-2">
						{{ packToName[activity] || activity.toTitleCase() }}
					</span>
					<div class="heatmap-wrapper">
						<calendar-heatmap
							:values="values"
							:end-date="Date.now()"
							:max="data.percentiles[activity]"
							:tooltip-unit="$root.lang().dashboard.totals.contributions"
							:locale="locale"
							:range-color="colors"
						/>
					</div>
				</v-col>
			</v-row>
			<v-row v-else class="mb-0" style="width: 100%">
				<v-col
					v-for="i in 6"
					:key="`skeleton-${i}`"
					cols="12"
					sm="6"
					class="pr-sm-2 d-flex flex-column justify-space-around pb-0"
				>
					<v-skeleton-loader height="24" type="heading" class="mb-2" />
					<v-skeleton-loader height="130" type="card" />
				</v-col>
			</v-row>
		</v-card-text>
	</dashboard-card>
</template>

<script>
import axios from "axios";
import { Info } from "luxon";

import DashboardCard from "./dashboard-card.vue";
import { CalendarHeatmap } from "vue-calendar-heatmap";

export default {
	name: "contribution-activity-card",
	components: {
		DashboardCard,
		CalendarHeatmap,
	},
	props: {
		data: {
			type: Object,
			required: false,
			default: undefined,
		},
		colors: {
			type: Array,
			required: true,
		},
	},
	data() {
		return {
			packToName: {},
		};
	},
	computed: {
		locale() {
			return {
				months: Info.months("short", { locale: this.$root.translation.current.bcp47 }),
				days: Info.weekdays("short", { locale: this.$root.translation.current.bcp47 }),
				...this.$root.lang().dashboard.locale,
			};
		},
	},
	created() {
		axios.get(`${this.$root.apiURL}/packs/raw`).then((res) => {
			this.packToName = Object.values(res.data).reduce((acc, cur) => {
				acc[cur.id] = cur.name;
				return acc;
			}, {});
		});
	},
};
</script>

<style lang="scss">
.heatmap-wrapper {
	min-height: 100px;
	overflow: hidden;
	scrollbar-gutter: stable;
}

.heatmap-wrapper:hover,
.heatmap-wrapper:active {
	overflow-x: auto;
}

.heatmap-wrapper svg {
	min-height: 100px;
}
</style>
