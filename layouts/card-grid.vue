<template>
	<!-- can save some space by declaring the div a v-row using the underlying class -->
	<infinite-scroller class="row mt-n3" @more="showMore">
		<v-col
			v-for="item in loading ? skeletonCount : shownItems"
			:key="item[track]"
			:cols="12 / columnCount"
			class="d-flex align-stretch"
		>
			<v-card class="d-flex flex-column main-container" style="width: 100%">
				<v-skeleton-loader v-if="loading" type="image, article" />
				<slot v-else v-bind="item" />
			</v-card>
		</v-col>
	</infinite-scroller>
</template>

<script>
import InfiniteScroller from "./infinite-scroller.vue";

// the cards are pretty chunky so not many have to be shown to fill the screen
const MIN_DISPLAYED_RESULTS = 24;
const RESULT_INCREMENT = 24;

export default {
	name: "card-grid",
	components: {
		InfiniteScroller,
	},
	props: {
		items: {
			type: Array,
			required: true,
		},
		// key is a reserved keyword
		track: {
			type: String,
			required: false,
			default: "id",
		},
		loading: {
			type: Boolean,
			required: false,
			default: false,
		},
		skeletonCount: {
			type: Number,
			required: false,
			default: 5,
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
		shownItems() {
			return this.items.slice(0, this.displayedResults);
		},
		columnCount() {
			// if (this.$vuetify.breakpoint.xl) return 4;
			if (this.$vuetify.breakpoint.mdAndUp) return 3;
			if (this.$vuetify.breakpoint.smAndUp) return 2;
			return 1;
		},
	},
};
</script>
