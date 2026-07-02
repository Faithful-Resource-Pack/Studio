<template>
	<!-- eslint-disable vue/html-closing-bracket-newline -->
	<div class="py-8 text-center text--secondary">
		<!-- note: the horrible html formatting here is needed for the whitespace to not die -->
		<p class="body-2 mb-1">
			<span v-for="(str, i) in $root.lang().global.footer.credits.split('%')" :key="str">
				<a
					v-if="i % 2 !== 0"
					href="https://v2.vuetifyjs.com"
					target="_blank"
					rel="noopener noreferrer"
					>{{ str }}</a
				>
				<template v-else>{{ str }}</template></span
			>&nbsp;<span v-for="(str, i) in $root.lang().global.footer.source.split('%')" :key="str">
				<a
					v-if="i % 2 !== 0"
					href="https://github.com/Faithful-Resource-Pack/Studio"
					target="_blank"
					rel="noopener noreferrer"
					>{{ str }}</a
				>
				<template v-else>{{ str }}</template>
			</span>
		</p>
		<p class="body-2 mb-1">
			{{ $root.lang().global.footer.copyright.replace("%d", new Date().getFullYear()) }}
		</p>
	</div>
</template>

<script>
export default {
	name: "nav-footer",
};
</script>
