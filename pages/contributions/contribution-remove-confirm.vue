<template>
	<modal-form
		v-model="modalOpened"
		max-width="800"
		danger
		scrollable
		:title="$root.lang().database.contributions.delete_contribution"
		@close="$emit('close')"
		@submit="deleteContribution"
	>
		<v-sheet style="position: sticky; top: 0px; z-index: 998">
			<v-list-item class="mx-0">
				<a :href="data.url" target="_blank" rel="noopener noreferrer">
					<v-list-item-avatar tile class="database-list-sprite">
						<v-img class="texture-img" :src="data.url" lazy-src="/resources/transparency.png" />
					</v-list-item-avatar>
				</a>
				<v-list-item-content>
					<v-list-item-title>
						[#{{ data.texture }}] {{ textures[data.texture]?.name }}
					</v-list-item-title>
					<v-list-item-subtitle>
						{{ packs[data.pack]?.name || data.pack }} • {{ $root.formatDate(data.date) }}
					</v-list-item-subtitle>
				</v-list-item-content>
			</v-list-item>
			<v-divider class="my-5" />
		</v-sheet>
		<h2 class="title mb-3">
			{{ $root.lang().database.contributions.contributors }} ({{ formattedAuthors.length }})
		</h2>
		<v-row>
			<v-col v-for="author in formattedAuthors" :key="author.id" cols="12" md="6">
				<v-list-item class="mx-0">
					<a
						:href="`https://faithfulpack.net/user/${author.id}`"
						target="_blank"
						rel="noopener noreferrer"
					>
						<v-list-item-avatar v-if="author.uuid" class="database-list-sprite" tile>
							<v-img :src="`https://vzge.me/face/96/${author.uuid}`" />
						</v-list-item-avatar>
						<v-list-item-avatar v-else class="database-list-avatar">
							<v-icon large>mdi-account</v-icon>
						</v-list-item-avatar>
					</a>
					<v-list-item-content>
						<v-list-item-title>{{ author.username }}</v-list-item-title>
						<v-list-item-subtitle>{{ author.id }}</v-list-item-subtitle>
					</v-list-item-content>
				</v-list-item>
			</v-col>
		</v-row>
	</modal-form>
</template>

<script>
import axios from "axios";
import ModalForm from "@layouts/modal-form.vue";

export default {
	name: "contribution-remove-confirm",
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
			required: false,
			// when initially loaded it has no value
			default: () => ({}),
		},
		packs: {
			type: Object,
			required: true,
		},
		contributors: {
			type: Array,
			required: true,
		},
		textures: {
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
		deleteContribution() {
			this.$root
				.wrapSnackBar(
					axios.delete(`${this.$root.apiURL}/contributions/${this.data.id}`, this.$root.apiOptions),
				)
				.then(() => {
					this.$emit("close", true);
				});
		},
	},
	computed: {
		formattedAuthors() {
			if (!this.data || !this.data.authors) return { unknown: "Unknown" };
			return this.data.authors.map((author) => this.contributors.find((c) => c.id === author));
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
