<template>
	<div>
		<!-- eslint-disable vue/valid-v-slot -->
		<!-- vuetify uses dots as table fields but eslint reads them as modifiers -->
		<div v-for="{ category, packs } in authorCategories" :key="category" class="py-3">
			<h2 class="text-h5 mb-3">{{ category }}</h2>
			<!-- only need dense for lg since the mobile layout is horizontal anyways -->
			<v-row :dense="$vuetify.breakpoint.lg">
				<v-col v-for="pack in packs" :key="pack" cols="12" sm="6">
					<h3 class="uppercase text--secondary my-2">
						{{ packToName[pack] }}
					</h3>
					<v-data-table
						dense
						:headers="headers"
						:items="getContributions(pack)"
						hide-default-footer
						disable-pagination
						:no-data-text="$root.lang().gallery.modal.no_contributions"
					>
						<template #item.authors="{ value }">
							<span class="hover-underline" @click="copySubmissionAuthors(value)">
								{{ formatAuthors(value) }}
							</span>
						</template>
					</v-data-table>
				</v-col>
			</v-row>
		</div>
		<v-btn
			v-if="$root.isAdmin"
			block
			color="secondary"
			class="my-5"
			:to="`/contributions/${textureID}`"
		>
			<v-icon left>mdi-pencil</v-icon>
			{{ $root.lang().database.contributions.edit_contribution }}
		</v-btn>
		<!-- eslint-enable vue/valid-v-slot -->
	</div>
</template>

<script>
export default {
	name: "author-tab",
	props: {
		textureID: {
			type: String,
			required: true,
		},
		contributions: {
			type: Array,
			required: true,
		},
		packToName: {
			type: Object,
			required: true,
		},
		discordIDtoName: {
			type: Function,
			required: true,
		},
	},
	data() {
		return {
			authorCategories: [
				{
					category: "Faithful",
					packs: ["faithful_32x", "faithful_64x"],
				},
				{
					category: "Classic Faithful",
					packs: ["classic_faithful_32x", "classic_faithful_64x"],
				},
				{
					category: "Classic Faithful Jappa",
					packs: ["classic_faithful_32x_jappa", "classic_faithful_64x_jappa"],
				},
			],
			headers: [
				{
					text: this.$root.lang().gallery.modal.data.contribution_id,
					value: "id",
				},
				{
					text: this.$root.lang().gallery.modal.data.date,
					value: "date",
				},
				{
					text: this.$root.lang().gallery.modal.data.authors,
					value: "authors",
				},
			],
		};
	},
	methods: {
		formatAuthors(authors) {
			return authors.map((a) => a.username).join(", ");
		},
		copySubmissionAuthors(authors) {
			const authorString = authors
				.map((a) => {
					// there is almost certainly a better way to check if the user is anonymous
					if (a.username === this.$root.lang().gallery.error_message.user_anonymous)
						return `<@${a.id}>`;
					return `{${a.username}}`;
				})
				.join(" ");

			navigator.clipboard.writeText(authorString);
			this.$root.showSnackbar(this.$root.lang().gallery.authors_copied_to_clipboard, "success");
		},
		getContributions(pack) {
			return this.contributions
				.filter((el) => pack === el.pack)
				.sort((a, b) => b.date - a.date)
				.map((el) => ({
					id: el.id,
					date: this.$root.formatDate(el.date),
					authors: el.authors.map((el) => ({ id: el, username: this.discordIDtoName(el) })),
				}));
		},
	},
};
</script>
