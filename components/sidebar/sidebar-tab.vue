<template>
	<v-list-item link :to="subtab.to" :disabled="subtab.disabled" @click="$emit('select')">
		<!-- for some reason sidebar icons have a morbillion pixels of right padding -->
		<v-list-item-icon v-if="subtab.icon" class="mr-3">
			<!-- use secondary text and highlight primary on focus (less contrasty) -->
			<v-icon class="v-label">{{ subtab.icon }}</v-icon>
		</v-list-item-icon>
		<v-list-item-content>
			<v-list-item-title class="body-2" :class="hasBadge && 'font-weight-bold'">
				{{ title }}
			</v-list-item-title>
		</v-list-item-content>
		<v-list-item-action v-if="hasBadge" class="nav-badge">
			<span class="nav-badge-inner error white--text font-weight-black">
				{{ badges[subtab.id] }}
			</span>
		</v-list-item-action>
	</v-list-item>
</template>

<script>
export default {
	name: "sidebar-tab",
	props: {
		subtab: {
			type: Object,
			required: true,
		},
		parent: {
			type: String,
			required: true,
		},
		badges: {
			type: Object,
			required: false,
			default: () => ({}),
		},
	},
	emits: ["select"],
	computed: {
		title() {
			return (
				this.$root.lang().global.tabs[this.parent]?.subtabs[this.subtab.id] ||
				this.subtab.id.toTitleCase()
			);
		},
		hasBadge() {
			return this.subtab.badge && this.badges[this.subtab.id];
		},
	},
};
</script>

<style lang="scss">
.nav-badge {
	margin-top: 0;
	margin-bottom: 0;
}

.nav-badge-inner {
	height: 24px;
	width: 24px;
	font-size: 12px;
	border-radius: 50%;
	line-height: 24px;
	text-align: center;
}
</style>
