<template>
	<v-chip-group column>
		<v-chip v-for="id in authors" :key="id" class="mt-0 mb-2" x-small @click="$emit('set', id)">
			{{ getAuthor(id) }}
		</v-chip>
		<v-chip v-if="showToggle" class="mt-0 mb-2 px-2" x-small @click="toggle">
			{{ label }}
		</v-chip>
	</v-chip-group>
</template>

<script>
// maintaining track of the collapsed state in the main component was horrible so I moved it here
const COLLAPSED_ITEM_LENGTH = 3;

export default {
	name: "author-chips",
	props: {
		contribution: {
			type: Object,
			required: true,
		},
		contributors: {
			type: Array,
			required: true,
		},
	},
	emits: ["set"],
	data() {
		return {
			collapsed: true,
		};
	},
	methods: {
		toggle() {
			this.collapsed = !this.collapsed;
		},
		getAuthor(id) {
			const author = this.contributors.find((c) => c.id === id);
			if (!author || !author.username) return `${this.$root.lang().database.anonymous} (${id})`;
			return author.username;
		},
	},
	computed: {
		showToggle() {
			// don't show if there's only one item to expand
			return this.contribution.authors.length > COLLAPSED_ITEM_LENGTH + 1;
		},
		authors() {
			if (!this.collapsed) return this.contribution.authors;
			return this.showToggle
				? this.contribution.authors.slice(0, COLLAPSED_ITEM_LENGTH)
				: this.contribution.authors;
		},
		label() {
			const delta = this.contribution.authors.length - COLLAPSED_ITEM_LENGTH;
			return this.collapsed ? `+ ${delta}` : `- ${delta}`;
		},
	},
};
</script>
