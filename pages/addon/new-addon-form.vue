<template>
	<v-container>
		<h1 class="text-h4 py-4">{{ $root.lang().addons.titles.submit }}</h1>
		<addon-form
			addon-new
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
			screenshotId: 0,
		};
	},
	computed: {
		screenSources() {
			return this.screenshots.map((file) => URL.createObjectURL(file));
		},
	},
	methods: {
		async handleSubmit(data) {
			// 1. Upload
			let addonId;
			try {
				const response = await axios.post(
					`${this.$root.apiURL}/addons`,
					data,
					this.$root.apiOptions,
				);

				const addon = response.data;
				addonId = addon.id;

				const promises = [];
				// 2. Upload header
				if (this.header) {
					const headerForm = new FormData();
					headerForm.set("file", this.header, this.header.name);
					promises.push(
						axios.post(
							`${this.$root.apiURL}/addons/${addon.id}/header`,
							headerForm,
							this.$root.apiOptions,
						),
					);
				}

				// 3. Upload screenshots
				if (this.screenshots.length) {
					// add all of them
					// fix to stabilize upload and make one request then another...
					let err;
					let successful = true;
					for (const screen of this.screenshots) {
						const form = new FormData();
						form.set("file", screen, screen.name);

						successful = await axios
							.post(
								`${this.$root.apiURL}/addons/${this.id}/screenshots`,
								form,
								this.$root.apiOptions,
							)
							.then(() => true)
							.catch((error) => {
								err = error;
								return false;
							});

						if (!successful) break;
					}

					promises.push(successful ? Promise.resolve() : Promise.reject(err));
				}

				await Promise.all(promises);
				this.$root.showSnackBar(this.$root.lang().global.ends_success, "success");
				this.$router.push("/addons/submissions");
			} catch (err) {
				console.error(err);
				this.$root.showSnackBar(err, "error");

				// created malformed addon, delete the whole thing to try again
				// if we have id then we at least successfully created the file
				if (addonId)
					axios
						.delete(`${this.$root.apiURL}/addons/${addonId}`, this.$root.apiOptions)
						.catch((err) => this.$root.showSnackBar(err, "error"));
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
					...Array.from({ length: number }).map((_, i) => this.screenshotId + i),
				];

				this.screenshotId += number; // increase top id
			}
		},
	},
};
</script>
