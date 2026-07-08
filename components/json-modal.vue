<template>
	<modal-form
		v-model="modalOpened"
		max-width="800"
		:title="$root.lang().global.json_editor.import_data"
		basic
	>
		<prism-editor
			v-model="jsonData"
			class="json-editor json-modal-editor"
			:highlight="highlighter"
			line-numbers
		/>
		<v-btn block :color="color" class="white--text" @click="parseJSON">
			<v-icon left>mdi-upload</v-icon>
			{{ $root.lang().global.json_editor.parse_json }}
		</v-btn>
	</modal-form>
</template>

<script>
import Prism from "prismjs";
import { PrismEditor } from "vue-prism-editor";
import ModalForm from "@layouts/modal-form.vue";

export default {
	name: "json-modal",
	components: {
		ModalForm,
		PrismEditor,
	},
	props: {
		value: {
			type: Boolean,
			required: true,
		},
		color: {
			type: String,
			required: false,
			default: "primary",
		},
		// sometimes useful to set an array or object by default
		initialValue: {
			type: String,
			required: false,
			default: "",
		},
	},
	emits: ["input", "data"],
	data() {
		return {
			modalOpened: false,
			// you can access props from data
			jsonData: this.initialValue,
		};
	},
	methods: {
		highlighter(code) {
			return Prism.highlight(code, Prism.languages.js, "json");
		},
		parseJSON() {
			try {
				this.$emit("data", JSON.parse(this.jsonData));
				// reset modal only if emitted correctly (user can fix typos without form clearing randomly)
				this.modalOpened = false;
				this.jsonData = this.initialValue;
			} catch (err) {
				console.error(err);
				this.$root.showSnackBar(err, "error");
			}
		},
		closeModal() {
			this.modalOpened = false;
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
