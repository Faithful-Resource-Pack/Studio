<template>
	<modal-form
		v-model="modalOpened"
		:title="title"
		:disabled="!reason || (reason && reason.length == 0)"
		danger
		@close="interacted(false)"
		@submit="interacted(true)"
	>
		<v-text-field
			v-model="reason"
			:autofocus="!$vuetify.breakpoint.mobile"
			:color="color"
			required
			:label="$root.lang().review.reason_modal.label"
			:rules="reasonRules"
		/>
	</modal-form>
</template>

<script>
import ModalForm from "@layouts/modal-form.vue";

export default {
	name: "reason-modal",
	components: {
		ModalForm,
	},
	props: {
		value: {
			type: Boolean,
			required: true,
		},
		type: {
			type: String,
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
			reason: "",
			reasonRules: [(u) => !u || u?.length > 0 || this.$root.lang().review.reason_modal.rule],
		};
	},
	methods: {
		interacted(submit = false) {
			this.modalOpened = false;
			this.$emit("close", submit, this.reason);
			// reset modal
			if (submit) this.reason = "";
		},
	},
	computed: {
		title() {
			const strings = this.$root.lang().review.reason_modal;
			switch (this.type) {
				case "archived":
					return strings.archive_title;
				case "denied":
					return strings.deny_title;
			}
			// todo: add better fallback
			return strings.deny_title;
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
