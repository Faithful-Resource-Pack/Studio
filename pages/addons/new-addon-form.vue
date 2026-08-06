<template>
	<v-container class="form-container">
		<h1 class="text-h4 py-4">{{ $root.lang().addons.titles.submit }}</h1>
		<addon-form
			addon-new
			:submitting="submitting"
			:screen-sources="screenSources"
			:screen-ids="screenshotIds"
			@submit="handleSubmit"
			@header="handleHeader"
			@screenshots="handleScreenshot"
		/>
	</v-container>
</template>

<script>
import axios from "axios";

import AddonForm from "./addon-form.vue";

export default {
	name: "new-addon-form",
	components: {
		AddonForm,
	},
	data() {
		return {
			header: undefined,
			screenshots: [],
			screenshotIds: [],
			latestScreenId: 0,
			submitting: false,
		};
	},
	computed: {
		screenSources() {
			return this.screenshots.map((file) => URL.createObjectURL(file));
		},
	},
	methods: {
		async handleSubmit(data) {
			if (!this.header)
				return this.$root.showSnackBar(
					this.$root.lang().addons.images.header.rules.image_required,
					"error",
				);

			this.submitting = true;
			try {
				// 1. Upload json information
				const response = await axios.post(
					`${this.$root.apiURL}/addons`,
					data,
					this.$root.apiOptions,
				);

				const addon = response.data;

				// 2. Upload header image
				const headerForm = new FormData();
				headerForm.set("file", this.header, this.header.name);
				await axios.post(
					`${this.$root.apiURL}/addons/${addon.id}/header`,
					headerForm,
					this.$root.apiOptions,
				);

				// 3. Upload add-on screenshots
				for (const screen of this.screenshots) {
					// don't ddos the api by uploading one by one
					// todo: look into uploading multiple images at once
					const form = new FormData();
					form.set("file", screen, screen.name);
					await axios.post(
						`${this.$root.apiURL}/addons/${addon.id}/screenshots`,
						form,
						this.$root.apiOptions,
					);
				}

				this.$root.showSnackBar(this.$root.lang().global.success_message, "success");
				this.$router.push("/addons/submissions");
			} catch (err) {
				console.error(err);
				this.$root.showSnackBar(err, "error");
			} finally {
				this.submitting = false;
			}
		},
		handleHeader(file, remove = false) {
			this.header = remove ? undefined : file;
		},
		handleScreenshot(screenshots, index, remove = false, id = undefined) {
			if (remove) {
				if (id !== undefined) {
					index = this.screenshotIds.indexOf(id);
				}

				if (index < 0) return;

				this.screenshots.splice(index, 1);
				this.screenshotIds.splice(index, 1);
				//? force variable update as slice method does only internal stuff
				this.$set(this, "screenshots", this.screenshots);
				this.$set(this, "screenshotIds", this.screenshotIds);

				//? that will force computed screenSources to be recomputed
			} else {
				const files = Array.isArray(screenshots) ? screenshots : [screenshots];
				const number = files.length;

				// First add screenshots
				this.screenshots = [...this.screenshots, ...files];
				// Then add the same amount of ids
				this.screenshotIds = [
					...this.screenshotIds,
					...Array.from({ length: number }).map((_, i) => this.latestScreenId + i),
				];

				this.latestScreenId += number; // increase top id
			}
		},
	},
};
</script>
