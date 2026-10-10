<template>
	<v-container>
		<!-- eslint-disable-next-line vue/no-v-html -->
		<div class="styles" v-html="pageStyles" />
		<v-row no-gutters class="py-0 mb-0" align="center">
			<v-col cols="12" sm="6">
				<h1 class="text-h4 py-4">
					{{ $root.lang().database.settings.title }}
				</h1>
			</v-col>
			<v-col cols="12" sm="6">
				<v-btn :color="pageColor" class="white--text" :disabled="invalidJson" block @click="save">
					<v-icon left>mdi-content-save</v-icon>
					{{ $root.lang().global.btn.save }}
				</v-btn>
			</v-col>
		</v-row>

		<v-card class="main-container my-2 pa-1">
			<prism-editor
				v-model="jsonText"
				class="json-editor"
				style="height: auto"
				:highlight="highlighter"
				line-numbers
			/>
		</v-card>
	</v-container>
</template>

<script>
import axios from "axios";
import Prism from "prismjs";

import { PrismEditor } from "vue-prism-editor";
import { generatePageStyles } from "@helpers/colors";

const JSON_SPACES = 4;

export default {
	name: "settings-page",
	components: {
		PrismEditor,
	},
	data() {
		return {
			pageColor: "blue-grey darken-1",
			pageStyles: "",
			jsonText: "{}",
			json: {},
		};
	},
	computed: {
		invalidJson() {
			try {
				JSON.parse(this.jsonText);
				return false;
			} catch (_ignored) {
				console.error(_ignored);
			}
			return true;
		},
	},
	methods: {
		highlighter(code) {
			return Prism.highlight(code, Prism.languages.js, "json");
		},
		async save() {
			await this.$root.wrapSnackbar(
				axios.post(`${this.$root.apiURL}/settings/raw`, this.json, this.$root.apiOptions),
			);
			return this.$root.reloadSettings();
		},
	},
	watch: {
		json(n, o) {
			// update if content different
			const newStringified = JSON.stringify(n, null, JSON_SPACES);
			if (newStringified !== JSON.stringify(o, null, JSON_SPACES)) {
				//* update if text content is updated : new line, new space, the text must not be adapted if same content
				if (newStringified !== JSON.stringify(JSON.parse(this.jsonText), null, JSON_SPACES)) {
					this.jsonText = newStringified;
				}
			}
		},
		jsonText(n, o) {
			try {
				const parsed = JSON.parse(n);
				this.json = parsed;
			} catch {}
		},
	},
	created() {
		axios
			.get(`${this.$root.apiURL}/settings/raw`)
			.then((res) => {
				this.json = res.data;
			})
			.catch((err) => {
				console.error(err);
				this.$root.showSnackbar(err, "error");
			});
	},
	mounted() {
		this.pageStyles = generatePageStyles(this.pageColor);
	},
};
</script>
