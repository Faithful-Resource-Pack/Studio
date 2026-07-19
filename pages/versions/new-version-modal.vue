<template>
	<modal-form
		v-model="modalOpened"
		:title="$root.lang().database.versions.add.title"
		:disabled="!isValid"
		danger
		@close="$emit('close')"
		@submit="send"
	>
		<v-form ref="form">
			<v-select
				v-model="form.edition"
				:color="color"
				:item-color="color"
				:items="editions"
				:label="$root.lang().database.versions.add.new_edition"
				@change="(e) => onEditionChange(e)"
			/>
			<v-select
				v-model="form.template"
				:color="color"
				:item-color="color"
				:items="availableTemplateVersions"
				:disabled="!form.edition"
				:label="$root.lang().database.versions.add.template_version"
			/>
			<v-text-field
				v-model="form.version"
				:color="color"
				:autofocus="!$vuetify.breakpoint.mobile"
				:label="$root.lang().database.versions.add.new_version"
				:rules="rules"
			/>
		</v-form>
	</modal-form>
</template>

<script>
import ModalForm from "@layouts/modal-form.vue";
import axios from "axios";

export default {
	name: "add-version-modal",
	components: {
		ModalForm,
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
	},
	emits: ["input", "close"],
	data() {
		const defaultEdition = settings.editions[0];
		return {
			modalOpened: false,
			editions: settings.editions,
			rules: [(input) => !this.versionExists(input) || this.$root.lang().database.versions.exists],
			form: {
				edition: defaultEdition,
				template: settings.versions[defaultEdition][0] || "",
				version: "",
			},
		};
	},
	methods: {
		onEditionChange(edition) {
			this.form.template = settings.versions[edition][0];
		},
		versionExists(version) {
			return Object.values(settings.versions).flat().includes(version);
		},
		send() {
			const data = {
				edition: this.form.edition,
				version: this.form.version,
			};

			if (this.form.template !== "None") data.template = this.form.template;
			axios
				.post(`${this.$root.apiURL}/versions`, data, this.$root.apiOptions)
				.then(() => {
					this.$root.showSnackBar(this.$root.lang().database.versions.add.success, "success");
					this.$root.reloadSettings();
					this.$emit("close");
				})
				.catch((err) => {
					console.error(err);
					this.$root.showSnackBar(err, "error");
				});
		},
	},
	computed: {
		availableTemplateVersions() {
			return ["None", ...settings.versions[this.form.edition]];
		},
		isValid() {
			if (!this.form.version) return false;
			// cannot rename to an existing version, completely bricks the db (lol)
			if (this.versionExists(this.form.version)) return false;
			return true;
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
