<template>
	<div class="flex-grow-1 background-404">
		<div style="height: 80px" />
		<v-container class="text-center">
			<h1 class="text-h4 my-4">{{ $root.lang().missing_page.title }}</h1>
			<p class="text-body-1 text--secondary mb-0">{{ $root.lang().missing_page.description }}</p>
			<p class="text-body-1 text--secondary">
				<!-- horrible hack for hrefs -->
				<span v-for="(str, i) in $root.lang().missing_page.main_page.split('%')" :key="str">
					<router-link v-if="i % 2 !== 0" to="/dashboard">{{ str }}</router-link>
					<template v-else>{{ str }}</template>
				</span>
			</p>
		</v-container>
	</div>
</template>

<script>
export default {
	name: "missing-page",
	// bit of a hack but honestly I think this looks better than half light half dark
	created() {
		this.$vuetify.theme.dark = true;
	},
	destroyed() {
		this.$vuetify.theme.dark = this.$root.theme.isDark;
	},
};
</script>

<style lang="scss">
.background-404 {
	background-image: url(https://faithfulpack.net/image/background/the_end.jpg);
	background-position: center;
	background-size: cover;
}
</style>
