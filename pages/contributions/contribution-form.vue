<template>
	<!-- wrapped by contribution-modal -->
	<v-form lazy-validation>
		<v-row class="d-flex flex-column flex-sm-row justify-center">
			<v-col class="flex-grow-0 flex-shrink-0">
				<quick-date-picker
					v-model="contrib.date"
					:class="$vuetify.breakpoint.mdAndDown && 'mx-auto'"
					:color="color"
					flat
					:months="months"
					:labels="$root.lang().global.datepicker"
				/>
			</v-col>
			<v-col>
				<v-text-field
					v-if="!add"
					v-model="contrib.id"
					disabled
					persistent-hint
					:hint="'⚠️ ' + $root.lang().database.contributions.modal.id_hint"
					:label="$root.lang().database.contributions.modal.id"
					:color="color"
				/>
				<v-select
					v-model="contrib.pack"
					:label="$root.lang().database.contributions.modal.pack"
					:items="packList"
					:color="color"
					:item-color="color"
					item-text="label"
					item-value="value"
					:hide-details="add"
					required
				/>
				<!-- must manually handle v-model to prevent type errors -->
				<multi-range-input
					v-if="add"
					:color="color"
					:value="Array.isArray(contrib.texture) ? contrib.texture : []"
					:label="$root.lang().database.contributions.modal.texture_ids"
					:errors="$root.lang().database.contributions.modal.id_field_errors"
					:hide-details="add"
					@input="
						(value) => {
							contrib.texture = value;
						}
					"
				/>
				<div v-else class="d-flex align-center">
					<v-text-field
						v-model.number="contrib.texture"
						:color="color"
						:label="$root.lang().database.contributions.modal.texture_id"
						required
						:hide-details="add"
						class="mr-2"
						min="0"
					/>
					<v-btn
						icon
						:title="$root.lang().database.contributions.modal.increment_texture"
						@click="incrementTextureID"
					>
						<v-icon>mdi-chevron-up</v-icon>
					</v-btn>
					<v-btn
						icon
						:title="$root.lang().database.contributions.modal.decrement_texture"
						@click="decrementTextureID"
					>
						<v-icon>mdi-chevron-down</v-icon>
					</v-btn>
				</div>
				<user-select
					v-model="contrib.authors"
					:users="contributors"
					:label="$root.lang().database.contributions.contributors"
					:limit="add ? 3 : 15"
					:placeholder="$root.lang().database.contributions.modal.one_contributor"
					:error-messages="
						contrib.length === 0 ? [$root.lang().database.contributions.authorless] : []
					"
					:color="color"
					@newUser="(users) => $emit('newUser', users)"
				/>
			</v-col>
		</v-row>
	</v-form>
</template>

<script>
import { Info } from "luxon";

import UserSelect from "@components/user-select.vue";
import QuickDatePicker from "@components/quick-date-picker.vue";
import MultiRangeInput from "@components/multi-range-input.vue";

export default {
	name: "contribution-form",
	components: {
		UserSelect,
		QuickDatePicker,
		MultiRangeInput,
	},
	props: {
		value: {
			type: Object,
			required: true,
		},
		add: {
			type: Boolean,
			required: false,
			default: false,
		},
		packs: {
			type: Object,
			required: true,
		},
		contributors: {
			type: Array,
			required: true,
		},
		color: {
			type: String,
			required: false,
			default: "primary",
		},
	},
	emits: ["newUser", "input"],
	data() {
		return {
			contrib: this.value,
		};
	},
	methods: {
		incrementTextureID() {
			++this.contrib.texture;
		},
		decrementTextureID() {
			--this.contrib.texture;
			// clamp
			if (this.contrib.texture < 0) this.contrib.texture = 0;
		},
	},
	computed: {
		packList() {
			return Object.values(this.packs).map((p) => ({
				label: p.name,
				value: p.id,
			}));
		},
		months() {
			// computed so if user changes language things update properly
			return Info.months("short", { locale: this.$root.translation.current.bcp47 });
		},
	},
	watch: {
		value: {
			handler(n, o) {
				if (n !== undefined && JSON.stringify(n) !== JSON.stringify(o)) this.contrib = n;
			},
			immediate: true,
			deep: true,
		},
		contrib: {
			handler(n) {
				this.$emit("input", n);
			},
			deep: true,
		},
	},
};
</script>
