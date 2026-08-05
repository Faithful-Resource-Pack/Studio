<template>
	<div
		class="d-flex flex-row justify-center align-start mb-5"
		:class="{ 'flex-wrap': $vuetify.breakpoint.xs }"
	>
		<img class="mx-5" :src="avatar" :alt="$root.lang().profile.general.uuid.skin_alt_text" />
		<div class="flex-grow-1">
			<v-form lazy-validation>
				<v-text-field
					v-model="localUser.username"
					required
					:rules="usernameRules"
					:counter="usernameMaxLength"
					clearable
					:label="$root.lang().profile.general.username.label"
					:hint="$root.lang().profile.general.username.hint"
				/>
				<v-text-field
					v-model="localUser.uuid"
					placeholder="aaabbbcc-ddee-1122-3344-zzz555aadd33"
					:rules="uuidRules"
					:counter="uuidMaxLength"
					clearable
					:label="$root.lang().profile.general.uuid.label"
					:hint="$root.lang().profile.general.uuid.hint"
				/>
				<v-checkbox v-model="localUser.anonymous" class="extended-checkbox" hide-details>
					<template #label>
						<p class="text--primary mb-2">
							{{ $root.lang().profile.general.anonymous.label }}
						</p>
						<p class="my-0">{{ $root.lang().profile.general.anonymous.hint }}</p>
					</template>
				</v-checkbox>
			</v-form>
		</div>
	</div>
</template>

<script>
export default {
	name: "general-section",
	props: {
		value: {
			type: Object,
			required: true,
		},
		validate: {
			type: Function,
			required: true,
		},
	},
	emits: ["input"],
	data() {
		return {
			localUser: {},
			usernameMinLength: 2,
			usernameMaxLength: 24,
			uuidMaxLength: 36,
			usernameRules: [
				(u) =>
					this.validate(
						"username:exists",
						u && typeof u === "string" && u.trim().length > this.usernameMinLength,
						this.$root
							.lang()
							.profile.general.username.rules.min.replace("%d", this.usernameMinLength),
					),
				(u) =>
					this.validate(
						"username:length",
						u && u.length <= this.usernameMaxLength,
						this.$root
							.lang()
							.profile.general.username.rules.max.replace("%d", this.usernameMaxLength),
					),
			],
			uuidRules: [
				(u) =>
					this.validate(
						"uuid:length",
						(u && u.length === this.uuidMaxLength) || !u,
						this.$root.lang().profile.general.uuid.rules.length,
					),
			],
		};
	},
	computed: {
		avatar() {
			const base = this.$vuetify.breakpoint.xs
				? "https://vzge.me/head/128"
				: "https://vzge.me/full/256";

			const user =
				this.localUser.uuid && this.localUser.uuid.length === this.uuidMaxLength
					? this.localUser.uuid
					: "X-Steve";
			return `${base}/${user}`;
		},
	},
	watch: {
		value(newValue) {
			this.localUser = newValue;
		},
		localUser(newValue) {
			this.$emit("input", newValue);
		},
	},
};
</script>
