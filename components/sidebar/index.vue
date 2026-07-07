<template>
	<v-navigation-drawer v-model="drawerOpen" app width="300" :dark="forceDark">
		<!--
			can't have multiple open tab groups with v-list so we manually add the css classes
			this is absolutely horrid but there's no other way to get the same behavior nicely
		-->
		<div class="v-list--dense v-list--nav">
			<router-link to="/">
				<img
					src="https://database.faithfulpack.net/images/branding/wordmarks/default/flat/main_flat_wordmark.png"
					:alt="$root.lang().global.name"
					class="mt-2 pa-2"
					style="width: 100%"
				/>
			</router-link>
			<v-divider class="my-2" />
			<sidebar-category
				v-for="tab in tabs"
				:key="tab.id"
				:tab="tab"
				:badges="badges"
				:initOpen="initialOpenCategories[tab.id]"
				:value="openCategories[tab.id]"
				@click="updateTabsOpen(tab.id)"
				@autoClose="autoClose"
			/>
			<!-- Fix problem on firefox on mobile where bar disappears and fixed elements are hidden -->
			<div v-if="$vuetify.breakpoint.mdAndDown" class="py-5" />
		</div>
	</v-navigation-drawer>
</template>

<script>
import SidebarCategory from "./sidebar-category.vue";

const OPEN_CATEGORY_KEY = "sidebar_open_categories";

export default {
	name: "nav-sidebar",
	components: {
		SidebarCategory,
	},
	props: {
		value: {
			type: Boolean,
			required: true,
		},
		tabs: {
			type: Array,
			required: true,
		},
		forceDark: {
			type: Boolean,
			required: false,
			default: false,
		},
		badges: {
			type: Object,
			required: false,
			default: () => ({}),
		},
	},
	emits: ["input"],
	data() {
		const openCategoryJSON = localStorage.getItem(OPEN_CATEGORY_KEY) || "{}";
		return {
			drawerOpen: false,
			// updating tabsOpen when it's assigned to a value prop causes problems
			initialOpenCategories: JSON.parse(openCategoryJSON),
			// JSON.parse twice to get different references for mutation later
			openCategories: JSON.parse(openCategoryJSON),
			navListener: () => {},
		};
	},
	methods: {
		updateTabsOpen(label) {
			if (label) this.openCategories[label] = !this.openCategories[label];
			localStorage.setItem(OPEN_CATEGORY_KEY, JSON.stringify(this.openCategories));
		},
		autoClose() {
			if (this.$vuetify.breakpoint.mobile) this.drawerOpen = false;
		},
		isCurrentPath(path) {
			return this.$route.matched.some((r) => r.path === path);
		},
		getNextOpenCategory(category, delta, depth = 1) {
			const nextCategory = category + delta * depth;

			// already at end, nowhere to go (also base case if nothing was found along the way)
			if (nextCategory < 0 || nextCategory >= this.tabs.length) return category;

			// the category is open, we're good to use it
			if (this.openCategories[this.tabs[nextCategory].id]) return nextCategory;

			// collapsed category, try going one further in chosen direction (breaks at end)
			return this.getNextOpenCategory(category, delta, depth + 1);
		},
		updateCategory(delta, pos = 0) {
			const curCategory = this.tabs.findIndex((t) =>
				t.subtabs.some((s) => s.routes.some((r) => this.isCurrentPath(r.path))),
			);

			const nextCategory = this.getNextOpenCategory(curCategory, delta);

			// avoid redundant navigation if there's nowhere to go
			if (curCategory === nextCategory) return;

			const nextTabs = this.tabs[nextCategory].subtabs;

			// if we're coming from a later tab then use the last tab of the new category
			const subtabIdx = pos >= 0 ? pos : nextTabs.length + pos;
			this.$router.push({ path: nextTabs[subtabIdx].routes[0].path });
		},
		updateTab(delta) {
			// there's probably a more eloquent way to write this but whatever it gets the job done
			let category;
			let subtabIdx;
			for (const tab of this.tabs) {
				const i = tab.subtabs.findIndex((s) => s.routes.some((r) => this.isCurrentPath(r.path)));
				if (i !== -1) {
					category = tab;
					subtabIdx = i;
					break;
				}
			}

			// if we ended up on the 404 page or something go to a "safe" page (dashboard)
			if (!category) return this.$router.push({ path: this.tabs[0].subtabs[0].routes[0].path });

			subtabIdx += delta;

			// if we overflowed we try going to the next/previous category
			if (subtabIdx < 0 || subtabIdx >= category.subtabs.length)
				return this.updateCategory(delta, delta > 0 ? 0 : -1);

			this.$router.push({ path: category.subtabs[subtabIdx].routes[0].path });
		},
	},
	mounted() {
		// add discord-style alt/ctrl keyboard navigation
		/** @param {KeyboardEvent} event */
		this.navListener = (event) => {
			if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;

			// both category/tab switching use the alt key
			if (!event.altKey) return;

			event.preventDefault();

			// mac uses cmd+option+arrow
			const isCategorySwitch = navigator.platform.toLowerCase().includes("mac")
				? event.metaKey
				: event.ctrlKey;

			// when working with indices we can just add the delta to get the new tab index
			const delta = event.key === "ArrowDown" ? 1 : -1;
			return isCategorySwitch ? this.updateCategory(delta) : this.updateTab(delta);
		};

		window.addEventListener("keydown", this.navListener);
	},
	destroyed() {
		window.removeEventListener("keydown", this.navListener);
	},
	watch: {
		value: {
			handler(newValue) {
				this.drawerOpen = newValue;
			},
			immediate: true,
		},
		drawerOpen(newValue) {
			this.$emit("input", newValue);
		},
		tabs: {
			handler(nv) {
				const keys = nv.map((tabs) => tabs.id);

				// we diff against the localstorage version since users can get logged out
				// and their preference should be saved regardless
				const keyDiff = keys.filter((k) => !Object.keys(this.openCategories).includes(k));
				if (!keyDiff.length) return;

				// properly new tabs are always open by default
				for (const key of keyDiff) {
					if (key === undefined) continue;
					this.initialOpenCategories[key] = true;
					this.openCategories[key] = true;
				}
				this.updateTabsOpen();
			},
			immediate: true,
		},
	},
};
</script>
