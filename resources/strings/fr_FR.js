export default {
	credits: ["Juknum"],
	global: {
		name: "Faithful",
		logout: "Déconnexion",
		ends_success: "Terminé avec succès",
		loading: "Chargement, veuillez patienter…",
		no_results: "Aucun résultat n'a été trouvé",
		nyi: "N'a pas encore été implémenté.",
		themes: {
			notification: "Thème système changé en %s",
			options: {
				light: "Clair",
				dark: "Sombre",
				system: "Système",
			},
		},
		btn: {
			add: "Ajouter",
			submit: "Soumettre",
			submit_and_approve: "Soumettre et approuver",
			cancel: "Annuler",
			close: "Fermer",
			save: "Sauvegarder",
			edit: "Éditer",
			delete: "Supprimer",
			ok: "OK",
			yes: "Oui",
			deny: "Refuser",
			approve: "Approuver",
			archive: "Archiver",
			load_more: "Charger plus",
		},
		tabs: {
			general: {
				subtabs: {
					dashboard: "Dashboard",
					profile: "Profil",
					statistics: "Statistiques",
					gallery: "Galerie",
				},
			},
			addons: {
				title: "Add-on",
				subtabs: {
					submissions: "Mes add-ons",
					upload: "Upload",
				},
			},
			database: {
				title: "Database",
				subtabs: {
					contributions: "Contributions",
					users: "Utilisateurs",
					textures: "Textures",
					settings: "Paramètres",
				},
			},
		},
	},
	database: {
		titles: {
			contributions: "Contributions",
			contributors: "Contributeurs",
			textures: "Textures",
			files: "Fichiers",
			add_user: "Ajouter un contributeur",
			add_textures: "Ajouter des textures",
			add_texture: "Ajouter une texture",
			add_use: "Ajouter une utilisation",
			add_path: "Ajouter un chemin",
			add_mc_version: "Ajouter une nouvelle version Minecraft",
			edit_path: "Éditer le chemin",
			edit_use: "Éditer l'utilisation",
			edit_texture: "Éditer la texture",
			edit_user: "Éditer le contributeur",
			confirm_deletion: "Confirmer la suppression",
		},
		subtitles: {
			add_new_contribution: "Ajouter une nouvelle contribution",
			clone_contribution: "Cloner la contribution",
			resolution: "Résolution",
			pack: "Pack de Ressources",
			user: "Utilisateurs",
			select_user_role: "Sélectionnez le role de l'utilisateur",
			search: "Rechercher",
			texture_result: "Résultats des textures",
			import_json_data: "Importer des données JSON",
			uses: "Utilisation(s)",
			paths: "Chemin(s)",
		},
		labels: {
			anonymous: "Anonyme",
			anonymous_explain:
				"Si coché, l'utilisateur sera renommé \"Anonyme\" et son skin ne sera pas affichée. Cela n'est modifiable que par les administrateurs!",
			new_mc_version_edition: "Édition à laquelle ajouter une version",
			new_mc_version_path: "Version du chemin auquel ajouter la version",
			new_mc_version_name: "Nom de la nouvelle version",
			nameless: "Sans nom",
			add_textures_success: "Textures ajoutées avec succès",
			add_version_success: "Version ajoutée avec succès",
			add_new_user: "Ajouter un nouveau utilisateur",
			add_new_texture: "Ajouter une nouvelle texture",
			add_new_path: "Ajouter un nouveau chemin",
			add_new_use: "Ajouter une nouvelle utilisation",
			add_texture: "Ajouter des textures",
			add_mc_version: "Ajouter une nouvelle version Minecraft",
			ask_deletion: "Voulez-vous supprimer %s (%d)?",
			close_on_submit: "Fermer à l'envoi",
			contributors_results: "Résultats des utilisateurs",
			user_role: "Roles de l'utilisateur",
			discord_id: "ID Discord",
			edit_mc_version: "Modifier une version Minecraft",
			one_contributor: "Veuillez choisir au moins un utilisateur",
			parse_json: "Analyser le JSON en données",
			search_contributions: "Rechercher des contributions",
			search_username: "Rechercher un pseudonyme",
			search_texture: "Rechercher un nom de texture",
			select_texture_tag: "Sélectionner un type de texture",
			username: "Pseudonyme",
			uuid: "UUID du profil Minecraft",
			texture_name: "Nom de la texture",
			texture_tags: "Type de la texture",
			texture_id: "ID de la texture",
			texture_uses: "Utilisation(s) de la texture",
			use_name: "Nom de l'utilisation",
			use_id: "ID de l'utilisation",
			use_edition: "Edition de l'utilisation",
			path: "Chemin",
			path_id: "ID du chemin",
			versions: "Versions",
			no_path_found: "Aucun chemin trouvé pour cette utilisation",
			no_use_found: "Aucune utilisation trouvée pour cette texture.",
			current_mc_version: "Version MC actuelle",
			new_mc_version: "Nouvelle version MC",
			id_field_errors: {
				one_required: "Au moins un ID ou une plage d'IDs de textures requis",
				incorrect_value: 'ID ou plage d\'IDs "%value%" incorrecte',
			},
		},
		hints: {
			texture_id: "Changer l'ID de la texture peut tout casser",
			use_id: "Changer l'ID de l'utilisation peut tout casser",
			path_id: "Changer l'ID du chemin peut tout casser",
			warning_path:
				"L'utilisation doit être créée avant d'y ajouter des chemins (actuellement pas très bien supporté et un peu bugué)",
			path: "Le chemin doit commencer à partir du répertoire racine (ex: assets/…)",
			example_scenario:
				"Hm, toute la base de donnée est configurée pour télécharger les textures pour la version 1.17 mais il existe désormais une version 1.17.1, cette option est faite pour vous !",
			example_scenario_warn:
				"N'oubliez pas de mettre également à jour toutes les branches GitHub !",
		},
	},
	review: {
		titles: {
			addons: "Vérifier les Add-ons",
			pending: "En attente de validation",
			denied: "Refusé(s)",
			approved: "Accepté(s)",
			archived: "Archivé(s)",
		},
		reason_modal: {
			label: "Écrivez une raison…",
			rule: "Toute raison peut être donnée",
		},
		labels: {
			pending: "Il n'y a actuellement aucun add-on en attente !",
			denied: "Il n'y a actuellement aucun add-on refusé !",
			archived: "Il n'y a actuellement aucun add-on archivé !",
			load_approved: "Charger les add-on approuvés",
		},
		addon: {
			titles: {
				authors: "Auteur(s)",
				description: "Description",
			},
			labels: {
				approved_by: "Approuvé par %s",
				denied_by: "Refusé par %s",
				reason: "Raison",
			},
		},
	},
	addons: {
		titles: {
			submit: "Soumettre un nouvel Add-on",
			edit: "Éditer l'addon",
			submissions: "Mes Add-ons",
		},
		remove: {
			title: "Confirmer la suppression",
			labels: {
				question: "Voulez-vous vraiment supprimer %s?",
				warning: "Vous ne pouvez pas revenir en arrière après cela.",
			},
		},
		general: {
			loading_addon: "Chargement de l'addon",
			rules: "Assurez-vous que l'add-on suit les règles décrites dans la documentation",
			title: "Général",
			name: {
				label: "Nom de l'add-on",
				hint: "Un nom court sera meilleur !",
				rules: {
					name_required: "Le nom est requis.",
					name_too_big: "Le nom doit faire moins que %s caractères.",
					name_unavailable: "Ce nom est déjà pris !",
				},
			},
			description: {
				label: "Description de l'add-on",
				hint: "Vous pouvez utilisez des balises Markdown pour améliorer votre description !",
				rules: {
					description_required: "La description est requise.",
					description_too_big: "La description ne doit pas dépasser %s caractères.",
				},
			},
			authors: {
				label: "Sélectionner un ou des auteurs pour cet add-on",
				hint: "N'importe quel auteur peut modifier l'add-on une fois soumis ! | Si vous ne trouvez pas quelqu'un dans la liste, contactez un Administrateur/Développeur",
			},
		},
		images: {
			title: "Captures d'écran",
			header: {
				labels: {
					drop: "Glissez l'image d'en-tête ou cliquez pour sélectionner",
					normal: "Image d'en-tête",
					replace: "Changer l'image d'en-tête",
				},
				rules: {
					image_size:
						"L'image doit faire moins de %s KB! Utilisez https://compressor.io/ pour le compresser.",
					image_ratio: "Ratio incorrect: L'image envoyée ne possède pas un ratio en 16/9.",
					image_required: "Une image d'en-tête est requise.",
				},
			},
			screenshots: {
				labels: {
					drop: "Glissez ou cliquez pour ajouter des images additionnelles",
					normal: "Image(s) additionnelles",
					replace: "Remplacer les images additionnelles",
				},
				rule: "Ratio incorrect: Les images qui n'ont pas un ratio en 16/9 ont été enlevées.",
			},
		},
		options: {
			title: "Options",
			optifine: {
				label: "Requière OptiFine",
			},
			editions: {
				label: "Edition(s) supportées",
				rule: "Vous devez choisir au moins 1 édition.",
			},
			resolutions: {
				label: "Résolutions supportées",
				rule: "Vous devez choisir au moins 1 résolution.",
			},
		},
		downloads: {
			title: "Téléchargements",
			name: {
				placeholder: "CurseForge, GitHub…",
				label: "Nom",
				rules: {
					name_required: "Un nom est requis.",
					name_cannot_be_empty: "Le nom ne peut être vide.",
				},
			},
			link: {
				placeholder: "https://www.exemple.com/",
				label: "Lien",
				rule: "L'URL doit être valide.",
			},
		},
		status: {
			approved: "Approuvé",
			denied: "Refusé",
			pending: "En attente",
		},
	},
	profile: {
		title: "Profil",
		general: {
			title: "Général",
			uuid: {
				label: "UUID du profil Minecraft",
			},
			username: {
				label: "Pseudonyme",
				hint: "Votre pseudonyme sera affiché et utilisé sur le site pour les contributions, les add-ons et bien plus encore…",
			},
		},
		social: {
			title: "Réseaux Sociaux",
			placeholder: "https://www.exemple.com/",
		},
	},
	gallery: {
		max_items_per_row: "Maximum d'items par ligne",
		animated_switcher: "Jouer les animations",
		all: "Tout",
		title: "Galerie",
		error_message: {
			texture_not_done: "La texture n'a pas été faite !",
			user_anonymous: "Anonyme",
			user_not_found: "Utilisateur Inconnu",
			contribution_not_found: "Aucune contribution trouvée dans la base de donnée!",
		},
		category: {
			search: "Rechercher",
			tags: "Étiquettes",
			mc_version: "Versions Minecraft",
			edition: "Édition",
			resolution: "Résolution",
		},
		modal: {
			tabs: {
				information: "Information",
				authors: "Auteurs",
				animated: "Animée",
			},
			info: {
				texture: "Texture",
				uses: "Utilisations",
				paths: "Chemins",
			},
			data: {
				date: "Date",
				pack: "Pack",
				authors: "Auteur(s)",
				id: "ID",
				name: "Nom",
				tags: "Tags",
				use_id: "ID de l'utilisation",
				use_name: "Nom de l'utilisation",
				edition: "Édition",
				texture_id: "ID de la texture",
				path_id: "ID du chemin",
				resource_pack_path: "Chemin dans le Resource Pack",
				mc_versions: "Version(s) Minecraft",
			},
		},
	},
	settings: {
		title: "Settings",
		label: {
			edit_raw: "Éditer le JSON",
			edit_editor: "Éditer avec l'éditeur visuel",
		},
	},
	dashboard: {
		welcome_user: "Bienvenue %USER% !",
		totals: {
			authors: "auteurs",
			contributions: "contributions",
			last_day: "contributions dans les 48 dernières heures",
			last_week: "contributions cette semaine",
			last_month: "contributions ce mois",
		},
		activity: "Activité de %s",
		users: {
			total: "utilisateurs",
			total_anonymous: "anonymes",
			total_roles: "roles",
		},
		locale: {
			on: "le",
			less: "Moins",
			more: "Plus",
		},
	},
	datepicker: {
		year: "Année",
		month: "Mois",
		day: "Jour",
	},
};
