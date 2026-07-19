<template>
	<v-container>
		<h1 class="text-h4 py-4">{{ $root.lang().posts.titles.new }}</h1>
		<post-form v-model="post" add />
	</v-container>
</template>

<script>
import PostForm from "./form/index.vue";

export default {
	name: "new-post",
	components: {
		PostForm,
	},
	data() {
		return {
			post: {
				title: "",
				description: "",
				permalink: "",
				header_img: "",
				discontinued: false,
				changelog: {},
				downloads: {},
			},
		};
	},
};
</script>
