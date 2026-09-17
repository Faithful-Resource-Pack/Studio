<template>
	<modal-form
		v-model="modalOpened"
		max-width="800"
		:title="modalTitle"
		@close="$emit('close')"
		@submit="send"
	>
		<v-row>
			<v-col v-if="$vuetify.breakpoint.smAndUp" cols="3">
				<img
					:src="`https://vzge.me/full/256/${formData.uuid || 'X-Steve'}`"
					:alt="$root.lang().profile.general.uuid.skin_alt_text"
					style="width: 100%; max-width: 250"
				/>
			</v-col>
			<v-col cols="12" sm="9">
				<v-form ref="form" lazy-validation>
					<v-text-field
						v-model="formData.id"
						:color="color"
						required
						clearable
						persistent-hint
						:hint="add ? undefined : '⚠️ ' + $root.lang().database.users.modal.id_hint"
						:label="$root.lang().database.users.modal.id"
					/>
					<v-text-field
						v-model="formData.username"
						:color="color"
						required
						clearable
						:label="$root.lang().database.users.modal.username"
					/>
					<v-text-field
						v-model="formData.uuid"
						:color="color"
						clearable
						:label="$root.lang().database.users.modal.uuid"
					/>
					<v-select
						v-model="formData.roles"
						:color="color"
						:item-color="color"
						required
						multiple
						small-chips
						deletable-chips
						:items="roles"
						:label="$root.lang().database.users.modal.roles"
					/>
					<v-checkbox
						v-model="formData.anonymous"
						class="extended-checkbox"
						:color="color"
						required
						clearable
					>
						<template #label>
							<p class="text--primary mb-2">
								{{ $root.lang().database.users.modal.anonymous }}
							</p>
							<p>{{ $root.lang().profile.general.anonymous.hint }}</p>
						</template>
					</v-checkbox>
				</v-form>
			</v-col>
		</v-row>
	</modal-form>
</template>

<script>
import axios from "axios";

import ModalForm from "@layouts/modal-form.vue";

export default {
	name: "user-modal",
	components: {
		ModalForm,
	},
	props: {
		value: {
			type: Boolean,
			required: true,
		},
		add: {
			type: Boolean,
			required: false,
			default: false,
		},
		data: {
			type: Object,
			required: false,
			default: () => ({}),
		},
		roles: {
			type: Array,
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
			formData: {
				username: "",
				roles: [],
				uuid: "",
				anonymous: false,
				id: "",
			},
			defaults: {
				username: "",
				roles: [],
				uuid: "",
				anonymous: false,
			},
		};
	},
	computed: {
		modalTitle() {
			return this.add
				? this.$root.lang().database.users.modal.add_user
				: this.$root.lang().database.users.modal.edit_user;
		},
	},
	methods: {
		async send() {
			const data = structuredClone(this.formData);

			// excess properties and therefore are not allowed
			delete data.id;
			delete data.bio;
			delete data.media;

			Object.keys(data).forEach((k) => (data[k] = data[k] === null ? this.defaults[k] : data[k]));

			const oldID = this.data.id;
			const newID = this.formData.id;

			const request =
				// if adding there's no oldID to reference so we always POST
				this.add || oldID === newID
					? axios.post(`${this.$root.apiURL}/users/${newID}`, data, this.$root.apiOptions)
					: axios.put(
							`${this.$root.apiURL}/users/transfer/${oldID}/${newID}`,
							data,
							this.$root.apiOptions,
						);

			return this.$root.wrapSnackbar(request).then(() => this.$emit("close", true));
		},
	},
	watch: {
		value(newValue) {
			this.modalOpened = newValue;
		},
		modalOpened(newValue) {
			this.$nextTick(() => {
				if (this.add) {
					this.formData = {
						id: "",
						username: "",
						roles: [],
						uuid: "",
						anonymous: false,
					};
				} else {
					Object.keys(this.data).forEach((key) => {
						this.formData[key] = this.data[key];
					});
				}
			});
			this.$emit("input", newValue);
		},
	},
};
</script>
