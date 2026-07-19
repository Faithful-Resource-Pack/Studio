<template>
	<modal-form
		v-model="modalOpened"
		danger
		:title="$root.lang().database.versions.delete.title"
		@close="$emit('close')"
		@submit="deleteVersion"
	>
		<p>{{ description }}</p>
		<v-alert type="warning" outlined dense>
			{{ warning }}
			<template v-if="data.paths">{{ $root.lang().profile.delete.warning }}</template>
		</v-alert>
	</modal-form>
</template>

<script>
import axios from "axios";
import ModalForm from "@layouts/modal-form.vue";

export default {
	name: "pack-remove-confirm",
	components: {
		ModalForm,
	},
	props: {
		value: {
			type: Boolean,
			required: true,
		},
		data: {
			type: Object,
			required: true,
		},
	},
	emits: ["input", "close"],
	data() {
		return {
			modalOpened: false,
		};
	},
	methods: {
		deleteVersion() {
			this.$root
				.wrapSnackBar(
					axios.delete(`${this.$root.apiURL}/versions/${this.data.version}`, this.$root.apiOptions),
				)
				.then(() => this.$emit("close", true));
		},
	},
	computed: {
		description() {
			return this.$root
				.lang()
				.database.versions.delete.description.replace("%VERSION%", this.data.version)
				.replace("%EDITION%", this.data.edition?.toTitleCase());
		},
		warning() {
			if (this.data.paths === 0)
				return this.$root.lang().database.versions.delete.no_affected_paths;
			const strings = this.$root.lang().database.versions.delete;
			return strings[
				this.data.paths === 1 ? "affected_paths_singular" : "affected_paths_plural"
			].replace("%d", this.data.paths);
		},
	},
	watch: {
		value(newValue) {
			this.modalOpened = newValue;
		},
		modalOpened(newValue) {
			this.$emit("input", newValue);
		},
	},
};
</script>
