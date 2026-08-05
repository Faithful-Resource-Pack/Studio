<template>
	<div style="position: relative">
		<v-img
			class="rounded"
			:class="{ 'cursor-pointer': $listeners.fullscreen }"
			:src="src"
			v-bind="$attrs"
			@click.stop="$emit('fullscreen')"
		>
			<template #placeholder>
				<div
					class="d-flex align-center justify-center"
					style="height: 100%"
					:style="{
						backgroundColor: $root.theme.isDark
							? 'rgba(255, 255, 255, 0.12)'
							: 'rgba(0, 0, 0, 0.12)',
					}"
				>
					<v-progress-circular v-if="src" indeterminate />
					<v-icon v-else x-large>mdi-image-off</v-icon>
				</div>
			</template>
		</v-img>
		<v-card
			class="theme--dark d-inline-block ma-2"
			rounded
			style="position: absolute; right: 0; top: 0"
		>
			<v-btn
				v-if="$listeners.fullscreen"
				small
				icon
				:title="$root.lang().global.emitting_image.fullscreen"
				@click="$emit('fullscreen', src)"
			>
				<v-icon small color="white">mdi-fullscreen</v-icon>
			</v-btn>
			<v-btn
				v-if="deletable"
				small
				icon
				:title="$root.lang().global.emitting_image.delete"
				@click="$emit('delete', src)"
			>
				<v-icon small color="white">mdi-delete</v-icon>
			</v-btn>
		</v-card>
	</div>
</template>

<script>
export default {
	name: "emitting-image",
	props: {
		src: {
			type: [String, Blob],
			required: false,
			default: null,
		},
		deletable: {
			type: Boolean,
			required: false,
			default: false,
		},
	},
	emits: ["fullscreen", "delete"],
};
</script>
