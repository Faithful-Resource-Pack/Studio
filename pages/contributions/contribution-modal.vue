<template>
	<modal-form
		v-model="modalOpened"
		:title="title"
		:disabled="!isValid"
		max-width="800"
		@close="$emit('close', false)"
		@submit="handleSubmit"
	>
		<v-row v-if="add" dense>
			<v-col class="flex-grow-0 flex-shrink-1" :cols="$vuetify.breakpoint.mdAndUp ? false : 12">
				<contribution-form
					v-model="contribs[selectedContrib]"
					add
					:packs="packs"
					:contributors="contributors"
					:color="color"
					@newUser="addNewUsers"
				/>
			</v-col>
			<v-col
				:class="[
					$vuetify.breakpoint.mdAndUp
						? 'flex-grow-0 flex-shrink-1 px-4'
						: 'flex-grow-1 flex-shrink-0 py-4',
				]"
			>
				<v-divider :vertical="$vuetify.breakpoint.mdAndUp" />
			</v-col>
			<v-col class="flex-grow-1 flex-shrink-0" :cols="$vuetify.breakpoint.mdAndUp ? false : 12">
				<div class="font-weight-medium text--secondary mb-2">
					{{ $root.lang().database.summary }} ({{ contribs.length }})
				</div>
				<v-list
					class="mb-5"
					:class="$vuetify.breakpoint.mdAndUp ? 'contribution-form-list' : ''"
					two-line
				>
					<v-list-item-group v-model="selectedContrib" mandatory :color="color">
						<summary-item
							v-for="(contrib, i) in contribs"
							:key="contrib.key"
							:contrib="contrib"
							:selected="selectedContrib === i"
							:packs="packs"
							:contributors="allContributors"
							:color="color"
							@clone="cloneContribution(contrib)"
							@delete="deleteContrib(i)"
						/>
					</v-list-item-group>
				</v-list>
				<v-btn color="secondary" block @click.stop.prevent="addContribution">
					<v-icon left>mdi-plus</v-icon>
					{{ $root.lang().database.contributions.modal.add_new_contribution }}
				</v-btn>
			</v-col>
		</v-row>
		<contribution-form
			v-else
			v-model="contribs[selectedContrib]"
			:packs="packs"
			:contributors="contributors"
			:color="color"
			@newUser="addNewUsers"
		/>
	</modal-form>
</template>

<script>
import axios from "axios";

import ModalForm from "@layouts/modal-form.vue";
import ContributionForm from "./contribution-form.vue";
import SummaryItem from "./summary-item.vue";
import generateRange from "@helpers/generateRange";

const emptyContrib = () => ({
	key: crypto.randomUUID(),
	date: new Date(new Date().setHours(0, 0, 0, 0)),
	texture: [],
	pack: "faithful_32x",
	authors: [],
});

export default {
	name: "contribution-modal",
	components: {
		ModalForm,
		ContributionForm,
		SummaryItem,
	},
	props: {
		value: {
			type: Boolean,
			required: true,
		},
		// only used for editing
		data: {
			type: Object,
			required: false,
			default: null,
		},
		// whether it's a new contribution or editing existing one
		add: {
			type: Boolean,
			required: true,
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
	emits: ["input", "close"],
	data() {
		return {
			modalOpened: false,
			// need to initialize to prevent contribution-form reading empty array
			contribs: [emptyContrib()],
			selectedContrib: 0,
			searchedContributors: [],
			formAuthorNames: {},
			closeOnSubmit: true,
		};
	},
	methods: {
		addContribution() {
			const newLen = this.contribs.push(emptyContrib());
			this.$nextTick(() => {
				this.selectedContrib = newLen - 1;
			});
		},
		cloneContribution(contrib) {
			const form = structuredClone(contrib);
			form.key = crypto.randomUUID();
			const newLen = this.contribs.push(form);

			// make the opened form our created form
			this.$nextTick(() => {
				this.selectedContrib = newLen - 1;
			});
		},
		deleteContrib(index) {
			// do not continue if not found
			if (!this.contribs[index]) return;

			// do not delete if only one
			if (this.contribs.length <= 1) return;

			this.contribs.splice(index, 1);

			// if we deleted the opened form, change it to the previous one
			if (this.contribs.length === this.selectedContrib) --this.selectedContrib;
		},
		changeOpenedForm(index) {
			this.selectedContrib = index;
		},
		addNewUsers(users) {
			this.searchedContributors = users;
		},
		handleSubmit() {
			// the code is different enough for adding/creating it's worth having two functions
			const result = this.add ? this.postContributions() : this.editContribution();
			return result.then(() => this.closeOnSubmit && this.$emit("close", true));
		},
		async postContributions() {
			let success = true;
			const finalContributions = [];
			// can't use map since errors can be thrown
			for (const contrib of this.contribs) {
				const showSnackBar = this.$root.makeJsonSnackBar(contrib);

				// convert ranges into actual texture IDs
				const generatedRange = generateRange(contrib.texture);

				if (!generatedRange.length) {
					showSnackBar(
						this.$root.lang().database.contributions.modal.id_field_errors.one_required,
						"error",
					);
					console.error(contrib);
					success = false;
				}

				if (contrib.authors.length === 0) {
					showSnackBar(this.$root.lang().database.contributions.authorless, "error");
					console.error(contrib);
					success = false;
				}

				finalContributions.push(
					// sanitizes + removes key
					...generatedRange.map((textureID) => ({
						date: new Date(contrib.date).getTime(),
						pack: contrib.pack,
						authors: contrib.authors,
						texture: Number(textureID),
					})),
				);
			}

			// all contributions must be valid
			if (!success) return;

			return this.$root.wrapSnackBar(
				axios.post(`${this.$root.apiURL}/contributions`, finalContributions, this.$root.apiOptions),
			);
		},
		async editContribution() {
			const contrib = this.contribs[0];
			return this.$root.wrapSnackBar(
				axios.put(
					`${this.$root.apiURL}/contributions/${contrib.id}`,
					{
						date: new Date(contrib.date).getTime(),
						pack: contrib.pack,
						authors: contrib.authors,
						texture: Number(contrib.texture),
					},
					this.$root.apiOptions,
				),
			);
		},
	},
	computed: {
		title() {
			return this.add
				? this.$root.lang().database.contributions.add_contributions
				: this.$root.lang().database.contributions.edit_contribution;
		},
		allContributors() {
			return [...this.contributors, ...this.searchedContributors];
		},
		isValid() {
			return this.contribs.every(
				(c) =>
					// two birds with one stone: textures are real or are actually numeric
					(Array.isArray(c.texture) ? c.texture.length : !isNaN(Number(c.texture))) &&
					c.authors.length &&
					c.pack,
			);
		},
	},
	watch: {
		value(newValue) {
			this.modalOpened = newValue;
		},
		modalOpened(newValue) {
			this.$nextTick(() => {
				// prevent reading stale state before unmount (causes a billion console errors)
				if (!newValue) return;
				this.selectedContrib = 0;
				this.contribs = [this.add ? emptyContrib() : { ...this.data, key: crypto.randomUUID() }];
			});
			this.$emit("input", newValue);
		},
	},
};
</script>

<style lang="scss">
.contribution-form-list {
	// height of the modal minus padding rounded to nearest 64 (height of one contribution)
	max-height: 512px;
	overflow-y: auto;
}
</style>
