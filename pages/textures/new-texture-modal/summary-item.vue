<template>
	<v-list-item class="mb-1">
		<v-list-item-content>
			<v-list-item-title>
				<template v-if="texture.name">{{ texture.name }}</template>
				<i v-else>{{ $root.lang().database.nameless }}</i>
			</v-list-item-title>
			<v-list-item-subtitle>
				<span v-if="texture.tags.length">{{ texture.tags.join(", ") }}</span>
				<i v-else>{{ $root.lang().database.textures.modal.tagless }}</i>
			</v-list-item-subtitle>
			<V-list-item-subtitle>
				<v-chip class="px-2 mr-1" x-small>{{ useString }}</v-chip>
				<v-chip class="px-2" x-small>{{ pathString }}</v-chip>
			</V-list-item-subtitle>
		</v-list-item-content>
		<v-list-item-action>
			<v-btn
				icon
				:color="selected ? color : 'red lighten-1'"
				:title="$root.lang().database.textures.delete_modal.title_texture"
				@click="$emit('delete')"
			>
				<v-icon>mdi-delete</v-icon>
			</v-btn>
		</v-list-item-action>
	</v-list-item>
</template>

<script>
// much cleaner as separate component for encapsulated state
export default {
	name: "summary-item",
	props: {
		texture: {
			type: Object,
			required: true,
		},
		selected: {
			type: Boolean,
			required: false,
			default: false,
		},
		color: {
			type: String,
			required: false,
			default: "primary",
		},
	},
	emits: ["delete"],
	computed: {
		useCount() {
			return this.texture.uses.length;
		},
		useString() {
			const useStrings = this.$root.lang().database.textures.uses;
			return `${this.useCount} ${this.useCount === 1 ? useStrings.singular : useStrings.plural}`;
		},
		pathCount() {
			return this.texture.uses.reduce((acc, cur) => acc + cur.paths.length, 0);
		},
		pathString() {
			const pathStrings = this.$root.lang().database.textures.paths;
			return `${this.pathCount} ${this.pathCount === 1 ? pathStrings.singular : pathStrings.plural}`;
		},
	},
};
</script>
