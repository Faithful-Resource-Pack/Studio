<template>
	<v-container class="form-container">
		<div class="d-flex flex-wrap align-center justify-space-between my-4 ga-4">
			<h1 class="text-h4">{{ $root.lang().profile.title }}</h1>
			<v-btn
				color="secondary"
				:href="`https://faithfulpack.net/user/${$root.user.id}`"
				:disabled="localUser.anonymous"
				target="_blank"
				rel="noopener noreferrer"
			>
				<v-icon left>mdi-open-in-new</v-icon>
				{{ $root.lang().profile.public_profile }}
			</v-btn>
		</div>
		<v-card class="main-container mb-2 pa-4">
			<h2 class="text-h5 mb-5">{{ $root.lang().profile.general.title }}</h2>
			<general-section v-model="localUser" :validate="validate" />

			<h2 class="text-h5 mb-5">{{ $root.lang().profile.general.bio.label }}</h2>
			<tabbed-text-field
				v-model="localUser.bio"
				class="mb-5"
				:textareaProps="{
					rules: bioRules,
					counter: bioMaxLength,
					placeholder: $root.lang().profile.general.bio.placeholder,
					hint: $root.lang().profile.general.bio.hint,
				}"
			/>

			<h2 class="text-h5 mb-5">{{ $root.lang().profile.social.title }}</h2>
			<social-section v-model="localUser" :validate="validate" />

			<v-card-actions class="form-actions mt-5">
				<v-btn text color="error darken-1" @click="openDeleteModal">
					{{ $root.lang().profile.delete.btn }}
				</v-btn>
				<v-btn text color="darken-1" :disabled="!canSubmit" @click="send">
					{{ $root.lang().profile.save_changes }}
				</v-btn>
			</v-card-actions>
		</v-card>

		<user-remove-confirm
			v-model="deleteModalOpened"
			:data="localUser"
			profile
			@close="deleteClosed"
		/>
	</v-container>
</template>

<script>
import axios from "axios";

import GeneralSection from "./general-section.vue";
import SocialSection from "./social-section.vue";
import TabbedTextField from "@components/tabbed-text-field.vue";
import UserRemoveConfirm from "../users/user-remove-confirm.vue";

export default {
	name: "profile-page",
	components: {
		GeneralSection,
		SocialSection,
		TabbedTextField,
		UserRemoveConfirm,
	},
	data() {
		return {
			localUser: {},
			bioMaxLength: 300,
			validationObject: {},
			bioRules: [
				(b) =>
					this.validate(
						"bio:length",
						b.length <= this.bioMaxLength,
						this.$root.lang().profile.general.bio.rules.length.replace("%d", this.bioMaxLength),
					),
			],
			deleteModalOpened: false,
		};
	},
	methods: {
		validate(scope, value, msg) {
			const nonSocialScopes = ["username:", "uuid:", "bio:"];

			if (nonSocialScopes.some((tag) => scope.startsWith(tag))) {
				// socials are validated separately since there's multiple of them
				this.$set(this.validationObject, scope, value);
			}

			if (value) return true;
			return msg.toString();
		},
		send() {
			if (!this.$root.isLoggedIn) return;

			// fix if new user
			const data = {
				uuid: this.localUser.uuid || "",
				username: this.localUser.username || "",
				bio: this.localUser.bio || "",
				anonymous: this.localUser.anonymous || false,
				media: this.cleanedMedia,
			};

			return this.$root.wrapSnackBar(
				axios.post(`${this.$root.apiURL}/users/profile/`, data, this.$root.apiOptions),
			);
		},
		openDeleteModal() {
			this.deleteModalOpened = true;
		},
		deleteClosed(success = false) {
			// user deleted, sign them out and put them on the dashboard
			if (success) {
				this.$router.push({ path: "dashboard" });
				this.$root.auth.logout();
			}
		},
		getUserInfo() {
			if (!this.$root.isLoggedIn) return;

			// use cached version to speed up loading (first things on page)
			this.localUser.username = this.$root.user.username;
			this.localUser.uuid = this.$root.user.uuid;
			this.localUser.anonymous = this.$root.user.anonymous;

			axios
				.get(`${this.$root.apiURL}/users/profile/`, this.$root.apiOptions)
				.then((res) => {
					this.localUser = res.data;

					// validation fix if new user or empty user
					this.localUser.uuid ||= "";
					this.localUser.username ||= "";
					this.localUser.bio ||= "";
					this.localUser.media ||= [];
				})
				.catch((err) => {
					console.error(err);
					this.$root.showSnackBar(err, "error");
				});
		},
		update() {
			// prevents issues when deleting account
			this.$nextTick(() => this.getUserInfo());
		},
	},
	computed: {
		cleanedMedia() {
			return (this.localUser.media || [])
				.filter((m) => m.link && m.type)
				.map((m) => {
					delete m.key;
					return m;
				});
		},
		canSubmit() {
			// media handled separately since there's multiple
			if (
				(this.localUser.media || []).some((m) => {
					if (!String.urlRegex.test(m.link)) return true;
					if (!settings.socials.includes(m.type)) return true;
					return false;
				})
			)
				return false;
			return Object.values(this.validationObject).every((v) => v === true);
		},
	},
	created() {
		this.$root.auth.addChangeListener(() => this.update());
		this.update();
	},
};
</script>
