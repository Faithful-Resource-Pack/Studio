<template>
	<div>
		<v-row v-for="(download, index) in downloads" :key="download.key" class="align-baseline">
			<template v-if="download.category !== undefined">
				<v-col cols="12" sm="3">
					<v-text-field
						v-model="download.category"
						:label="$root.lang().posts.download.category"
						hide-details
					/>
				</v-col>
				<v-col cols="12" sm="9">
					<v-row
						v-for="(item, indexLinks) in download.items"
						:key="item.key"
						class="align-baseline"
					>
						<v-col cols="12" sm="4">
							<v-text-field
								v-model="item.name"
								:label="$root.lang().posts.download.name"
								hide-details
							/>
						</v-col>
						<v-col>
							<v-text-field
								v-model="item.link"
								:label="$root.lang().posts.download.link"
								:placeholder="$root.lang().posts.download.link_placeholder"
								hide-details
							/>
						</v-col>
						<v-col class="flex-grow-0 flex-shrink-0">
							<v-btn
								v-if="indexLinks === 0"
								icon
								:title="$root.lang().posts.download.add_item_to_category"
								@click="addItemToCategory(index)"
							>
								<v-icon>mdi-plus</v-icon>
							</v-btn>
							<v-btn
								v-else
								icon
								color="red lighten-1"
								:title="$root.lang().posts.download.remove_item_in_category"
								@click="removeItemInCategory(index, indexLinks)"
							>
								<v-icon>mdi-minus</v-icon>
							</v-btn>
						</v-col>
						<v-col v-if="indexLinks === 0" class="flex-grow-0 flex-shrink-0">
							<v-btn
								icon
								color="red lighten-1"
								:title="$root.lang().posts.download.remove_category"
								@click="removeItem(index)"
							>
								<v-icon>mdi-delete</v-icon>
							</v-btn>
						</v-col>
					</v-row>
				</v-col>
			</template>
			<template v-else>
				<v-col cols="12" sm="3">
					<v-text-field v-model="download.name" :label="$root.lang().posts.download.name" />
				</v-col>
				<v-col>
					<v-text-field
						v-model="download.link"
						:label="$root.lang().posts.download.link"
						:placeholder="$root.lang().posts.download.link_placeholder"
					/>
				</v-col>
				<v-col class="flex-grow-0 flex-shrink-0">
					<v-btn
						icon
						color="red lighten-1"
						:title="$root.lang().posts.download.remove_single_item"
						@click="removeItem(index)"
					>
						<v-icon>mdi-minus</v-icon>
					</v-btn>
				</v-col>
			</template>
		</v-row>
		<v-row>
			<v-col>
				<v-btn block color="secondary" @click="addSingleItem">
					<v-icon left>mdi-plus</v-icon>
					{{ $root.lang().posts.download.add_single_item }}
				</v-btn>
			</v-col>
			<v-col>
				<v-btn block color="secondary" @click="addCategory">
					<v-icon left>mdi-playlist-plus</v-icon>
					{{ $root.lang().posts.download.add_category }}
				</v-btn>
			</v-col>
		</v-row>
	</div>
</template>

<script>
const emptySingleItem = () => ({ key: crypto.randomUUID(), name: "", link: "" });
const emptyCategory = () => ({
	key: crypto.randomUUID(),
	category: "",
	items: [emptySingleItem()],
});

export default {
	name: "download-tab",
	props: {
		value: {
			type: Array,
			required: true,
		},
	},
	emits: ["input"],
	data() {
		return {
			downloads: [],
		};
	},
	methods: {
		addSingleItem() {
			this.downloads.push(emptySingleItem());
		},
		addCategory() {
			this.downloads.push(emptyCategory());
		},
		addItemToCategory(i) {
			this.downloads[i].items.push(emptySingleItem());
		},
		removeItem(i) {
			this.downloads.splice(i, 1);
		},
		removeItemInCategory(i, j) {
			this.downloads[i].items.splice(j, 1);
			// remove category if there's no items in it
			if (!this.downloads[i].items.length) this.downloads.splice(i, 1);
		},
	},
	watch: {
		value: {
			handler(n) {
				this.downloads = n;
			},
			immediate: true,
		},
		downloads(n) {
			this.$emit("input", n);
		},
	},
};
</script>
