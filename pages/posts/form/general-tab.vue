<template>
	<div>
		<fullscreen-preview v-model="previewOpen" :src="formData.header_img" />

		<v-row>
			<v-col :class="$vuetify.breakpoint.smAndDown && 'pb-0'">
				<v-text-field
					v-model="formData.title"
					required
					clearable
					:label="$root.lang().posts.general.title.label"
					:placeholder="$root.lang().posts.general.title.placeholder"
					persistent-placeholder
				/>

				<v-text-field
					v-model="formData.permalink"
					required
					clearable
					:label="$root.lang().posts.general.permalink.label"
					:placeholder="$root.lang().posts.general.permalink.placeholder"
					persistent-placeholder
				/>
			</v-col>
			<v-col
				v-if="formData.header_img"
				cols="12"
				sm="3"
				class="d-flex align-center"
				:class="$vuetify.breakpoint.smAndDown && 'pt-0 pb-7'"
			>
				<v-responsive
					:aspect-ratio="$vuetify.breakpoint.smAndDown ? undefined : 16 / 9"
					min-height="100px"
				>
					<emitting-image :src="formData.header_img" @fullscreen="openPreview" />
				</v-responsive>
			</v-col>
		</v-row>

		<v-text-field
			v-model.lazy="formData.header_img"
			required
			clearable
			:label="$root.lang().posts.general.header_img.label"
			:hint="$root.lang().posts.general.header_img.hint"
			:placeholder="$root.lang().posts.general.header_img.placeholder"
			persistent-placeholder
		/>

		<div class="d-flex flex-row align-center">
			<v-text-field
				v-model="formData.date"
				type="date"
				required
				clearable
				:label="$root.lang().posts.general.date.label"
				persistent-placeholder
			/>
			<div class="flex-shrink-0 ml-4">
				<v-checkbox
					v-model="formData.discontinued"
					:label="$root.lang().posts.general.discontinued.label"
					:hint="$root.lang().posts.general.discontinued.hint"
				/>
			</div>
		</div>

		<tabbed-text-field
			v-model="formData.description"
			class="mb-0"
			:textareaProps="{
				clearable: true,
				placeholder: $root.lang().posts.general.description.placeholder,
				hint: $root.lang().posts.general.description.hint,
			}"
		/>
	</div>
</template>

<script>
import EmittingImage from "@components/emitting-image.vue";
import FullscreenPreview from "@components/fullscreen-preview.vue";
import TabbedTextField from "@components/tabbed-text-field.vue";

export default {
	name: "general-tab",
	components: {
		TabbedTextField,
		EmittingImage,
		FullscreenPreview,
	},
	props: {
		value: {
			type: Object,
			required: true,
		},
	},
	emits: ["input"],
	data() {
		return {
			formData: {},
			previewOpen: false,
		};
	},
	methods: {
		openPreview() {
			this.previewOpen = true;
		},
	},
	watch: {
		value: {
			handler(n) {
				this.formData = n;
			},
			immediate: true,
		},
		formData(n) {
			this.$emit("input", n);
		},
	},
};
</script>
