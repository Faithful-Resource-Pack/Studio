<template>
	<modal-form
		v-model="modalOpened"
		danger
		:title="$root.lang().addons.remove.title"
		@close="$emit('close')"
		@submit="deleteAddon"
	>
		<p>{{ $root.lang().addons.remove.description.replace("%s", data.name) }}</p>
	</modal-form>
</template>

<script>
import axios from "axios";
import ModalForm from "@layouts/modal-form.vue";

export default {
	name: "addon-remove-confirm",
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
		deleteAddon() {
			this.$root
				.wrapSnackBar(
					axios.delete(`${this.$root.apiURL}/addons/${this.data.id}`, this.$root.apiOptions),
				)
				.then(() => this.$emit("close", true));
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
