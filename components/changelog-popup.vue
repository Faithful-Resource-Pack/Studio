<template>
	<modal-form
		v-model="modalOpened"
		basic
		scrollable
		:title="$root.lang().global.changelog.title"
		:subtitle="$root.formatDate(changelog.date)"
	>
		<v-card-text>
			<v-img
				src="https://database.faithfulpack.net/images/website/posts/placeholder.jpg"
				class="mb-4"
			/>
			<!-- eslint-disable-next-line vue/no-v-html -->
			<div v-html="$root.compileMarkdown(changelog.description)" />
		</v-card-text>
		<v-card-actions>
			<div class="merged-actions">
				<v-btn
					icon
					:disabled="currentChangelog === 0"
					:title="$root.lang().global.changelog.previous"
					@click="--currentChangelog"
				>
					<v-icon color="lighten-1">mdi-chevron-left</v-icon>
				</v-btn>
				<v-btn
					icon
					:title="$root.lang().global.changelog.next"
					:disabled="currentChangelog === sortedChangelogs.length - 1"
					@click="++currentChangelog"
				>
					<v-icon color="lighten-1">mdi-chevron-right</v-icon>
				</v-btn>
			</div>
			<p class="mb-0 mx-2">{{ currentChangelog + 1 }} / {{ sortedChangelogs.length }}</p>
			<v-spacer />
			<v-btn text href="https://twitter.com/faithfulpack" target="_blank" rel="noopener noreferrer">
				<v-icon left>mdi-twitter</v-icon>
				{{ $root.lang().global.changelog.follow_us }}
			</v-btn>
		</v-card-actions>
	</modal-form>
</template>
<script>
import ModalForm from "@layouts/modal-form.vue";
import changelogs from "../resources/changelog/changelogs.js";

export default {
	name: "fullscreen-preview",
	components: {
		ModalForm,
	},
	data() {
		return {
			modalOpened: false,
			currentChangelog: 0,
		};
	},
	computed: {
		sortedChangelogs() {
			console.log(changelogs);
			return Array.from(changelogs).sort((a, b) => new Date(b) - new Date(a));
		},
		changelog() {
			return this.sortedChangelogs[this.currentChangelog];
		},
	},
	mounted() {
		this.modalOpened = true;
	},
};
</script>
