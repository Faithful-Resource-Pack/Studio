<template>
	<div class="gallery-tooltip">
		<div class="gallery-tooltip-texture">
			<span class="gallery-tooltip-id">#{{ texture.textureID }}</span>
			<h1 class="encased">{{ texture.name }}</h1>
			<div class="encased">
				<!-- always show contributions even if a texture is ignored/modded -->
				<template v-if="lastContribution !== undefined">
					<p>
						<v-icon small>{{ icon }}</v-icon>
						{{ authors }}
					</p>
					<p>
						<v-icon small>mdi-calendar</v-icon>
						{{ date }}
					</p>
				</template>
				<!-- even in 16x the modded textures aren't by mojang -->
				<p v-else-if="modded">
					<v-icon small>mdi-wrench</v-icon>
					{{ $root.lang().gallery.tooltip.modded }}
				</p>
				<!-- there's no mdi mojang icon so this is a custom one -->
				<p v-else-if="mojang">
					<i class="icon-mojang-red" />
					{{ $root.lang().gallery.tooltip.mojang }}
				</p>
				<p v-else-if="ignored">
					<v-icon small>mdi-texture</v-icon>
					{{ $root.lang().gallery.tooltip.ignored }}
				</p>
				<p v-else>
					{{ $root.lang().gallery.error_message.contribution_not_found }}
				</p>
			</div>
		</div>
		<div class="gallery-tooltip-tags">
			<span v-for="tag in texture.tags" :key="tag" class="encased">
				{{ tag }}
			</span>
		</div>
	</div>
</template>

<script>
export default {
	name: "gallery-tooltip",
	props: {
		texture: {
			type: Object,
			required: true,
		},
		mojang: {
			type: Boolean,
			required: true,
		},
		// passed as prop since you only need one request for every tooltip
		contributions: {
			type: Object,
			required: false,
			default: () => ({}),
		},
		discordIDtoName: {
			type: Function,
			required: true,
		},
		ignoreList: {
			type: Array,
			required: true,
		},
	},
	computed: {
		lastContribution() {
			return this.contributions[this.texture.textureID];
		},
		authors() {
			if (this.lastContribution === undefined) return "";
			return (
				this.lastContribution.authors
					// nbsp so users with spaces don't get wrapped
					.map((d) => this.discordIDtoName(d).replace(/\s/gm, "\u00A0"))
					.join(", ")
			);
		},
		date() {
			return this.$root.formatDate(this.lastContribution.date);
		},
		icon() {
			return this.lastContribution.authors.length === 1 ? "mdi-account" : "mdi-account-multiple";
		},
		// can be changed if we ever find a better way to handle this
		modded() {
			return this.texture.tags.includes("Modded");
		},
		ignored() {
			return this.ignoreList.some((el) => this.texture.url.includes(el));
		},
	},
};
</script>

<style lang="scss">
.tippy-backdrop {
	background: transparent;
}

// since it gets mounted outside the vuetify part we need to reapply some styles
.gallery-tooltip {
	font-family: "Roboto", sans-serif;
}

.gallery-tooltip i {
	// tooltip icons really hate being white for some reason
	color: white !important;
}

.gallery-tooltip-texture {
	width: 100%;
	display: flex;
	flex-direction: column;
	justify-content: left;
	position: relative;
}

.gallery-tooltip-id {
	position: absolute;
	top: 0;
	left: 0;
	font-weight: bold;
	padding: 0 6px;

	font-size: 14px;
	height: 22px;
	line-height: 22px;
	border-radius: 3px;
	margin-left: -3px;
	margin-top: -11px;
}
.gallery-tooltip-texture h1 {
	padding-top: 8px;
	text-align: center;
	word-break: break-all;
}

.gallery-tooltip-tags {
	width: 100%;
	display: flex;
	flex-direction: row;
	justify-content: left;
}

.gallery-tooltip-texture > ul {
	list-style: none;
}

.gallery-tooltip-id,
.encased {
	background-color: #272727;
	box-shadow: 2px 2px 8px 2px rgba(0, 0, 0, 0.4);
}

.tippy-popper,
.tippy-popper * {
	overflow: visible !important;
}

.encased {
	padding: 0.2rem 0.4rem;
	margin-bottom: 3px;
	margin-right: 3px;
	border-radius: 3px;
}
.gallery-tooltip-texture h1.encased {
	border-top-left-radius: 6px;
	border-top-right-radius: 6px;
}
.gallery-tooltip-texture ul.encased {
	border-bottom-right-radius: 6px;
}
.gallery-tooltip-tags .encased:first-child {
	border-bottom-left-radius: 6px;
}
.gallery-tooltip-tags .encased:last-child {
	border-bottom-right-radius: 6px;
}
</style>
