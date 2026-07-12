<template>
	<div :class="offsetClass">
		<v-row v-if="typeof item === 'string'" dense class="align-baseline">
			<v-col>
				<v-text-field
					v-model="item"
					dense
					clearable
					:placeholder="$root.lang().posts.changelog.form_levels.item"
					hide-details
				/>
			</v-col>
			<v-col class="flex-grow-0 flex-shrink-0">
				<v-btn icon :title="$root.lang().posts.changelog.remove_item" @click="$emit('delete')">
					<v-icon color="red lighten-1">mdi-minus</v-icon>
				</v-btn>
			</v-col>
		</v-row>
		<template v-else-if="item.category !== undefined">
			<v-row dense class="align-baseline ml-n12">
				<v-col class="flex-grow-0 flex-shrink-0" :style="{ height: categoryHeight }">
					<v-btn icon :title="togglerTitle" @click="toggleChildren">
						<v-icon style="opacity: 75%">
							{{ childrenVisible ? "mdi-chevron-down" : "mdi-chevron-right" }}
						</v-icon>
					</v-btn>
				</v-col>
				<v-col>
					<v-text-field
						v-model="item.category"
						dense
						clearable
						hide-details
						:placeholder="categoryPlaceholder"
						:class="classList"
						:height="categoryHeight"
					/>
				</v-col>
				<v-col class="flex-grow-0 flex-shrink-0">
					<v-btn
						icon
						:title="$root.lang().posts.changelog.remove_category"
						@click="$emit('delete')"
					>
						<v-icon color="red lighten-1">mdi-delete</v-icon>
					</v-btn>
				</v-col>
			</v-row>
			<!-- use v-show so state is preserved within the children while collapsed -->
			<div v-show="childrenVisible">
				<post-changelog
					v-for="(_el, i) in item.items"
					:key="i"
					v-model="item.items[i]"
					:level="level + 1"
					@delete="remove(i)"
				/>
				<!-- align with children (looks better) -->
				<div class="d-flex flex-wrap ga-2 my-2" :class="offsetClass">
					<v-btn color="secondary" @click="addItem">
						<v-icon left>mdi-plus</v-icon>
						{{ $root.lang().posts.changelog.add_item }}
					</v-btn>
					<v-btn color="secondary" @click="addCategory">
						<v-icon left>mdi-playlist-plus</v-icon>
						{{ $root.lang().posts.changelog.add_category }}
					</v-btn>
				</div>
			</div>
		</template>
	</div>
</template>

<script>
export default {
	name: "post-changelog",
	props: {
		value: {
			type: [String, Object],
			required: true,
		},
		// what size title to use (default h4)
		level: {
			type: Number,
			required: false,
			default: 4,
		},
	},
	emits: ["input", "delete"],
	data() {
		return {
			item: undefined,
			childrenVisible: true,
		};
	},
	methods: {
		addItem() {
			this.$set(this.item.items, this.item.items.length, "");
		},
		addCategory() {
			this.$set(this.item.items, this.item.items.length, {
				category: "",
				items: [],
			});
		},
		remove(i) {
			this.item.items.splice(i, 1);
		},
		toggleChildren() {
			this.childrenVisible = !this.childrenVisible;
		},
	},
	computed: {
		offsetClass() {
			return this.$vuetify.breakpoint.smAndDown ? "pl-4" : "pl-8";
		},
		isNested() {
			return this.level > 5;
		},
		classList() {
			if (this.isNested) return "";
			return `text-h${this.level}`;
		},
		categoryHeight() {
			if (this.isNested) return "";
			return `${this.level * 4 + 30}px`;
		},
		categoryPlaceholder() {
			const levels = this.$root.lang().posts.changelog.form_levels;
			switch (this.level) {
				case 4:
					return levels.primary;
				case 5:
					return levels.secondary;
				default:
					return levels.item_category;
			}
		},
		togglerTitle() {
			return this.childrenVisible
				? this.$root.lang().posts.changelog.close_category
				: this.$root.lang().posts.changelog.open_category;
		},
	},
	watch: {
		value: {
			handler(n) {
				this.item = n;
			},
			deep: true,
			immediate: true,
		},
		item: {
			handler(n) {
				this.$emit("input", n);
			},
			deep: true,
		},
	},
};
</script>
