<template>
	<v-list-item class="mb-1">
		<v-list-item-content>
			<v-list-item-title>{{ title }}</v-list-item-title>
			<v-list-item-subtitle>
				<span v-if="contrib.authors?.length">{{ subtitle }}</span>
				<i v-else>{{ $root.lang().database.contributions.authorless }}</i>
			</v-list-item-subtitle>
			<v-list-item-subtitle v-if="contrib.texture?.length">
				<v-chip
					v-for="range in contrib.texture"
					:key="formatRange(range)"
					class="mr-1 px-2"
					x-small
				>
					{{ formatRange(range) }}
				</v-chip>
			</v-list-item-subtitle>
		</v-list-item-content>
		<v-list-item-action class="merged-actions no-bg">
			<v-btn
				icon
				:title="$root.lang().database.contributions.modal.clone_contribution"
				@click="$emit('clone')"
			>
				<v-icon>mdi-content-duplicate</v-icon>
			</v-btn>
			<v-btn
				icon
				:color="selected ? color : 'red lighten-1'"
				:title="$root.lang().database.contributions.delete_contribution"
				@click="$emit('delete')"
			>
				<v-icon>mdi-delete</v-icon>
			</v-btn>
		</v-list-item-action>
	</v-list-item>
</template>

<script>
export default {
	name: "summary-item",
	props: {
		contrib: {
			type: Object,
			required: true,
		},
		selected: {
			type: Boolean,
			required: false,
			default: false,
		},
		packs: {
			type: Object,
			required: true,
		},
		contributors: {
			type: Array,
			required: true,
		},
		color: {
			type: String,
			required: false,
			default: "primary",
		},
	},
	emits: ["clone", "delete"],
	methods: {
		formatRange(range) {
			if (Array.isArray(range)) return `#${range.join(" – #")}`;
			return `#${range}`;
		},
	},
	computed: {
		title() {
			const pack = this.packs[this.contrib.pack]?.name || this.contrib.pack;
			return `${pack} • ${this.$root.formatDate(this.contrib.date)}`;
		},
		subtitle() {
			const groupedContributors = this.contributors.reduce((acc, cur) => {
				acc[cur.id] = cur;
				return acc;
			}, {});

			const authorObjs = this.contrib.authors.map((author) => groupedContributors[author] || {});

			const knownAuthors = authorObjs.map((author) => author.username).filter((n) => n);
			const anonymousCount = authorObjs.filter((author) => !author.username).length;

			const total = knownAuthors.length + anonymousCount;

			const formattedAuthors =
				anonymousCount > 0
					? [`${anonymousCount} ${this.$root.lang().database.anonymous}`, ...knownAuthors]
					: knownAuthors;

			return `[${total}]: ${formattedAuthors.join(", ")}`;
		},
	},
};
</script>

<style lang="scss">
// can't use nested selectors with inline styles, kinda annoying
.no-bg > * {
	background: transparent !important;
}
</style>
