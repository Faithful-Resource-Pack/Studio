<template>
	<modal-form
		v-model="modalOpened"
		danger
		:title="title"
		@close="$emit('close')"
		@submit="deletePack"
	>
		<v-alert v-if="contributions.length" type="warning" outlined dense>
			{{
				$root.lang().database.packs.submissions.delete_warning.replace("%d", contributions.length)
			}}
		</v-alert>
		<p v-if="type === 'packs'">{{ $root.lang().database.packs.modal.delete_hint }}</p>
		<v-list-item class="px-0">
			<v-list-item-avatar class="database-list-avatar">
				<v-img :src="data.logo" />
			</v-list-item-avatar>
			<v-list-item-content>
				<v-list-item-title>{{ data.name }} ({{ data.id }})</v-list-item-title>
				<v-list-item-subtitle>
					{{ (data.tags || []).map(formatTags).join(", ") }}
				</v-list-item-subtitle>
			</v-list-item-content>
		</v-list-item>
		<template v-if="type === 'packs'">
			<v-divider class="my-5" />
			<h2 class="title">{{ $root.lang().database.packs.modal.github.title }}</h2>
			<v-list>
				<v-list-item v-for="({ org, repo }, edition) in data.github" :key="edition" class="px-0">
					<v-list-item-content>
						<v-list-item-title>{{ edition.toTitleCase() }} Edition</v-list-item-title>
						<v-list-item-subtitle>
							<a :href="`https://github.com/${org}`" target="_blank" rel="noopener noreferrer">
								{{ org }}
							</a>
							/
							<a
								:href="`https://github.com/${org}/${repo}`"
								target="_blank"
								rel="noopener noreferrer"
							>
								<b>{{ repo }}</b>
							</a>
						</v-list-item-subtitle>
					</v-list-item-content>
				</v-list-item>
			</v-list>
		</template>
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
		type: {
			type: String,
			required: true,
		},
	},
	emits: ["input", "close"],
	data() {
		return {
			modalOpened: false,
			contributions: [],
		};
	},
	methods: {
		getContributionStats() {
			axios.get(`${this.$root.apiURL}/contributions/search?packs=${this.data.id}`).then((res) => {
				this.contributions = res.data;
			});
		},
		deletePack() {
			this.$root
				.wrapSnackBar(
					axios.delete(`${this.$root.apiURL}/${this.type}/${this.data.id}`, this.$root.apiOptions),
				)
				.then(() => this.$emit("close", true));
		},
		formatTags(s) {
			return s
				.split("_")
				.map((p) => (p == "progart" ? "Programmer Art" : p.toTitleCase()))
				.join(" ");
		},
	},
	computed: {
		title() {
			switch (this.type) {
				case "packs":
					return this.$root.lang().database.packs.modal.delete_pack;
				case "submissions":
					return this.$root.lang().database.packs.submissions.delete_submission;
			}
			return this.$root.lang().database.confirm_deletion;
		},
	},
	watch: {
		value(newValue) {
			this.modalOpened = newValue;
		},
		modalOpened(newValue) {
			this.getContributionStats();
			this.$emit("input", newValue);
		},
	},
};
</script>
