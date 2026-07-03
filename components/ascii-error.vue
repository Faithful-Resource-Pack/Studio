<template>
	<div class="d-flex flex-column align-center justify-center" style="height: 100%">
		<!-- eslint-disable vue/html-closing-bracket-newline -->
		<span v-if="$vuetify.breakpoint.mdAndUp" class="my-5">
			<!-- use https://www.asciiart.eu/text-to-ascii-art with the "Colossal" font -->
			<pre v-if="errorCode === 400">
	d8888   .d8888b.   .d8888b. &nbsp;
   d8P888  d88P  Y88b d88P  Y88b&nbsp;
  d8P 888  888    888 888    888&nbsp;
 d8P  888  888    888 888    888&nbsp;
d88   888  888    888 888    888&nbsp;
8888888888 888    888 888    888&nbsp;
      888  Y88b  d88P Y88b  d88P&nbsp;
      888   "Y8888P"   "Y8888P" &nbsp;
</pre>
			<pre v-else-if="errorCode === 401">
    d8888   .d8888b.   d888  &nbsp;
   d8P888  d88P  Y88b d8888  &nbsp;
  d8P 888  888    888   888  &nbsp;
 d8P  888  888    888   888  &nbsp;
d88   888  888    888   888  &nbsp;
8888888888 888    888   888  &nbsp;
      888  Y88b  d88P   888  &nbsp;
      888   "Y8888P"  8888888&nbsp;
</pre>
			<pre v-else-if="errorCode === 422">
    d8888   .d8888b.   .d8888b. &nbsp;
   d8P888  d88P  Y88b d88P  Y88b&nbsp;
  d8P 888         888        888&nbsp;
 d8P  888       .d88P      .d88P&nbsp;
d88   888   .od888P"   .od888P" &nbsp;
8888888888 d88P"      d88P"     &nbsp;
      888  888"       888"      &nbsp;
      888  888888888  888888888 &nbsp;
</pre>
			<pre v-else>
    d8888   .d8888b.      d8888 &nbsp;
   d8P888  d88P  Y88b    d8P888 &nbsp;
  d8P 888  888    888   d8P 888 &nbsp;
 d8P  888  888    888  d8P  888 &nbsp;
d88   888  888    888 d88   888 &nbsp;
8888888888 888    888 8888888888&nbsp;
      888  Y88b  d88P       888 &nbsp;
      888   "Y8888P"        888 &nbsp;
</pre>
		</span>
		<!-- eslint-enable vue/html-closing-bracket-newline -->
		<p v-else class="text-h1 my-3">{{ errorCode }}</p>
		<p v-if="subtitle" class="text-h6 my-3">{{ subtitle }}</p>
	</div>
</template>

<script>
export default {
	name: "ascii-error",
	props: {
		subtitle: {
			type: String,
			required: false,
			default: null,
		},
		errorCode: {
			type: Number,
			required: false,
			default: 404,
		},
	},
};
</script>
