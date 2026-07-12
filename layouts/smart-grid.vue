<template>
	<v-card class="main-container px-2 py-4">
		<loading-page v-if="loading" />
		<div v-else-if="items.length === 0" class="text-h6 text-center">
			<v-icon left>mdi-alert-circle-outline</v-icon>
			{{ error || $root.lang().global.no_results }}
		</div>
		<!-- can save some space by declaring the div a v-row using the underlying class -->
		<infinite-scroller v-else class="row" @more="showMore">
			<v-col v-for="item in results" :key="item[track]" :cols="12 / columnCount">
				<v-list-item>
					<slot v-bind="item" />
				</v-list-item>
			</v-col>
		</infinite-scroller>
	</v-card>
</template>

<script>
import InfiniteScroller from "./infinite-scroller.vue";
import LoadingPage from "./loading-page.vue";

const MIN_DISPLAYED_RESULTS = 60;
const RESULT_INCREMENT = 120;

// lazy loaded list which automatically scales to screen width
export default {
	name: "smart-grid",
	components: {
		LoadingPage,
		InfiniteScroller,
	},
	props: {
		items: {
			type: Array,
			required: true,
		},
		loading: {
			type: Boolean,
			required: false,
			default: false,
		},
		error: {
			type: String,
			required: false,
			default: "",
		},
		track: {
			type: String,
			required: false,
			default: "id",
		},
		wide: {
			type: Boolean,
			required: false,
			default: false,
		},
	},
	data() {
		return {
			displayedResults: MIN_DISPLAYED_RESULTS,
		};
	},
	methods: {
		showMore() {
			this.displayedResults += RESULT_INCREMENT;
		},
	},
	computed: {
		results() {
			return this.items.slice(0, this.displayedResults);
		},
		baseColumnCount() {
			// if (this.$vuetify.breakpoint.xl && this.displayedResults >= 12) return 4;
			if (this.$vuetify.breakpoint.mdAndUp && this.displayedResults >= 9) return 3;
			if (this.$vuetify.breakpoint.smAndUp && this.displayedResults >= 6) return 2;
			return 1;
		},
		columnCount() {
			let count = this.baseColumnCount;
			if (this.wide && count > 2) count = 2;
			if (this.displayedResults === 1) count = 1;
			return Math.max(1, count);
		},
	},
};
</script>
