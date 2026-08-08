<template>
	<!-- this specific styling/behavior is used a lot -->
	<v-text-field
		v-model="search"
		:autofocus="!$vuetify.breakpoint.mobile"
		filled
		hide-details
		clearable
		append-icon="mdi-magnify"
		v-bind="$attrs"
		@keyup.enter="$emit('search')"
		@click:append="$emit('search')"
		@click:clear="$emit('clear')"
	/>
</template>

<script>
export default {
	name: "search-box",
	props: {
		value: {
			type: String,
			required: false,
			default: "",
		},
	},
	emits: ["search", "clear", "input"],
	data() {
		return {
			search: "",
		};
	},
	watch: {
		value: {
			handler(newValue) {
				this.search = newValue;
			},
			immediate: true,
		},
		search(newValue) {
			this.$emit("input", newValue);
		},
	},
};
</script>
