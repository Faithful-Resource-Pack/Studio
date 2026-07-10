import axios from "axios";

// pages used in sidebar
import DashboardPage from "../pages/dashboard/index.vue";
import ProfilePage from "../pages/profile/index.vue";
import GalleryPage from "../pages/gallery/index.vue";
import AddonSubmissionsPage from "../pages/addon/addon-submissions.vue";
import NewAddonPage from "../pages/addon/new-addon-form.vue";
import EditAddonPage from "../pages/addon/edit-addon-form.vue";
import ReviewAddonsPage from "../pages/addon/review/index.vue";
import PostListPage from "../pages/post/post-grid.vue";
import EditPostPage from "../pages/post/edit-post.vue";
import NewPostPage from "../pages/post/new-post.vue";
import ContributionPage from "../pages/contribution/index.vue";
import UsersPage from "../pages/users/index.vue";
import TexturePage from "../pages/texture/index.vue";
import VersionPage from "../pages/version/index.vue";
import PackPage from "../pages/pack/index.vue";
import SettingsPage from "../pages/settings/index.vue";

/** @type {import("../resources/types.d.ts").SidebarTab[]} */
export default [
	{
		id: "general",
		subtabs: [
			{
				id: "dashboard",
				icon: "mdi-view-dashboard",
				public: true,
				// no name for dashboard (default page)
				routes: [
					{
						path: "/dashboard",
						component: DashboardPage,
					},
				],
			},
			{
				id: "profile",
				icon: "mdi-account-circle",
				routes: [
					{
						path: "/profile",
						component: ProfilePage,
						name: "Profile",
					},
				],
			},
			{
				id: "gallery",
				icon: "mdi-image-multiple",
				public: true,
				// note: first route will be matched by the sidebar
				routes: [
					{
						path: "/gallery",
						redirect: "/gallery/java/default/latest/all/",
					},
					{
						path: "/gallery/:edition/:pack/:version/:tag/:search*",
						component: GalleryPage,
						name: "Gallery",
					},
				],
			},
		],
	},
	{
		id: "addons",
		subtabs: [
			{
				id: "upload",
				icon: "mdi-plus-thick",
				routes: [
					{
						path: "/addons/new",
						component: NewAddonPage,
						name: "Submit new add-on",
					},
					{
						path: "/addons/edit/:id",
						component: EditAddonPage,
						name: "Edit add-on",
					},
				],
			},
			{
				id: "submissions",
				icon: "mdi-plus-box-multiple",
				routes: [
					{
						path: "/addons/submissions",
						component: AddonSubmissionsPage,
						name: "Add-on submissions",
					},
				],
			},
			{
				id: "review",
				roles: ["Administrator", "Art Director Council"],
				icon: "mdi-gavel",
				badge: (app) =>
					axios.get(`${app.apiURL}/addons/pending`, app.apiOptions).then((r) => r.data.length || 0),
				routes: [
					{
						path: "/addons/review",
						component: ReviewAddonsPage,
						name: "Review add-ons",
					},
					// legacy compatibility
					{
						path: "/review/addons",
						redirect: "/addons/review",
					},
				],
			},
		],
	},
	{
		id: "posts",
		roles: ["Administrator"],
		subtabs: [
			{
				id: "create",
				icon: "mdi-post",
				routes: [
					{
						path: "/posts/new",
						component: NewPostPage,
						name: "Create new post",
					},
					{
						path: "/posts/edit/:id",
						component: EditPostPage,
						name: "Edit post",
					},
				],
			},
			{
				id: "list",
				icon: "mdi-newspaper-variant-multiple",
				routes: [
					{
						path: "/posts/list",
						component: PostListPage,
						name: "All posts",
					},
				],
			},
		],
	},
	{
		id: "database",
		roles: ["Developer", "Administrator"],
		subtabs: [
			{
				id: "contributions",
				icon: "mdi-file-multiple",
				routes: [
					{
						cleanPath: "/contributions",
						path: "/contributions/:name*",
						component: ContributionPage,
						name: "Contributions",
					},
				],
			},
			{
				id: "users",
				icon: "mdi-account-multiple",
				routes: [
					{
						path: "/users",
						redirect: "/users/all",
					},
					{
						path: "/users/:role?/:name*",
						component: UsersPage,
						name: "Users",
					},
				],
			},
			{
				id: "textures",
				icon: "mdi-texture",
				routes: [
					{
						path: "/textures",
						redirect: "/textures/all",
					},
					{
						path: "/textures/:tag?/:name*",
						component: TexturePage,
						name: "Textures",
					},
				],
			},
			{
				id: "versions",
				icon: "mdi-tag-multiple",
				routes: [
					{
						path: "/versions",
						redirect: "/versions/all",
					},
					{
						path: "/versions/:edition?",
						component: VersionPage,
						name: "Versions",
					},
				],
			},
			{
				id: "packs",
				icon: "mdi-cube",
				routes: [
					{
						path: "/packs",
						redirect: "/packs/all",
					},
					{
						path: "/packs/:tag?",
						component: PackPage,
						name: "Packs",
					},
				],
			},
			{
				id: "settings",
				icon: "mdi-cog",
				routes: [
					{
						path: "/settings",
						component: SettingsPage,
						name: "Edit global settings",
					},
				],
			},
		],
	},
];
