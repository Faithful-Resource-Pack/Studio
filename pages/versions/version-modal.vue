<template>
	<modal-form
		v-model="modalOpened"
		:title="$root.lang().database.versions.modal.title"
		:disabled="!isValid || data.version === formData.version"
		danger
		button-type="confirm"
		@close="$emit('close')"
		@submit="send"
	>
		<p>{{ $root.lang().database.versions.modal.example }}</p>
		<v-alert type="warning" outlined dense>
			{{ $root.lang().database.versions.modal.warning }}
		</v-alert>
		<v-form ref="form" class="pt-2">
			<v-text-field
				v-model="formData.edition"
				:color="color"
				disabled
				:label="$root.lang().database.versions.modal.edition"
			/>
			<v-text-field
				v-model="formData.version"
				:color="color"
				:autofocus="!$vuetify.breakpoint.mobile"
				required
				:label="$root.lang().database.versions.modal.name"
				:rules="rules"
			/>
		</v-form>
	</modal-form>
</template>

<script>
import ModalForm from "@layouts/modal-form.vue";
import axios from "axios";

export default {
	name: "version-modal",
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
		color: {
			type: String,
			required: false,
			default: "primary",
		},
	},
	emits: ["input", "close"],
	data() {
		return {
			modalOpened: false,
			versions: Object.values(settings.versions).flat(),
			rules: [(input) => !this.versionExists(input) || this.$root.lang().database.versions.exists],
			formData: {},
		};
	},
	methods: {
		versionExists(version) {
			return this.versions.includes(version) && this.data.version !== version;
		},
		send() {
			this.$root
				.wrapSnackBar(
					axios.put(
						`${this.$root.apiURL}/versions/rename/${this.data.version}/${this.formData.version}`,
						null,
						this.$root.apiOptions,
					),
				)
				.then(() => {
					this.$root.reloadSettings();
					this.$emit("close", true);
				});
		},
	},
	computed: {
		isValid() {
			if (this.formData.version === "") return false;
			// cannot rename to an existing version, completely bricks the db (lol)
			if (this.versionExists(this.formData.version)) return false;
			return true;
		},
	},
	watch: {
		value(newValue) {
			this.modalOpened = newValue;
		},
		modalOpened(newValue) {
			this.$nextTick(() => {
				this.formData = structuredClone(this.data);
			});
			this.$emit("input", newValue);
		},
	},
};
</script>
