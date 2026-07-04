<template>
	<v-card class="main-container review-list overflow-y-auto">
		<!-- workaround to prevent the navigation list styles incorrectly applying -->
		<router-link v-for="(item, i) in items" :key="item.key" :to="addonURL(item.key)">
			<v-list-item tabindex="-1" two-line :class="classes[i]" @click="$emit('input', item.key)">
				<v-list-item-content>
					<v-list-item-title>{{ item.primary }}</v-list-item-title>
					<v-list-item-subtitle>{{ item.secondary }}</v-list-item-subtitle>
				</v-list-item-content>
			</v-list-item>
		</router-link>
	</v-card>
</template>

<script>
export default {
	name: "review-list",
	props: {
		// throws error on initial load when required since it takes a second to fetch results
		value: {
			type: String,
			required: false,
			default: undefined,
		},
		items: {
			type: Array, // { primary: string, secondary: string, key: number }[]
			required: true,
		},
		activeColor: {
			type: String,
			required: true,
		},
	},
	emits: ["input"],
	methods: {
		addonURL(id) {
			return `/addons/review?status=${this.$route.query.status}&id=${id}`;
		},
	},
	computed: {
		classes() {
			return this.items.map(({ key }) =>
				key === this.value ? `${this.activeColor} selected` : "",
			);
		},
	},
};
</script>
