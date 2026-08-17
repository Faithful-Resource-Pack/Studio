export default [
	{
		date: "2026-08-08",
		description: `
While there aren't any headliner features like in the past few updates, we've continued refining the studio to be the best it's ever been.

## Visual

- Improved widescreen support.
- Added a brand-new loading page to prevent a logged-out version of the app flashing for a second.
- Implemented keyboard navigation: Using the up and down arrow keys, hold Alt/Option to switch tabs and Ctrl+Alt/Cmd+Option to switch categories.
- Improved accessibility by adding alt text to all images and icon buttons, improving color contrast, and using more semantic HTML elements.
- Cleaned up the sidebar, with larger icons, more descriptive labels, and a smaller overall footprint.
- Made title styles in modal dialogs consistent with other titles throughout the studio.
- Made success notices show for less time than failure notices (so you can copy the error).
- Show total number of items in titles when applicable (e.g. submitted add-ons).
- Fall back to Steve skin if no UUID is provided on profile page.
- Improve PWA color scheme, app icon, and titling.

## Gallery

- Cleaned up gallery modal a bit to remove redundant texture-related information and utilize the toolbar title better.
- Use more descriptive icons and add icons to the gallery grid size slider and "no results found" screen.
- Added a banner when a texture is ignored to the gallery modal.
- Path versions sometimes being sorted incorrectly.

## Add-ons

- Sort add-on submissions by date, improve the delete popup, and overhaul review reason styling.
- Added lazy loading to the add-on submission page to reduce lag when you have many submitted add-ons.
- Improved notice when you have no add-ons, and added a prominent create new button to the page.
- Submitting an add-on automatically redirects to the submissions page instead of leaving you on the submitted form.

Additionally, special thanks to @robertr11 and @pure_shadow. for the updated German and Brazilian Portuguese translations, respectively.
		`,
	},
	{
		date: "2026-03-15",
		description: `
Say hello to the brand-new Faithful account switcher! We've also reshuffled around some account-related components, improved accessibility, and fixed several long-standing visual bugs.

## New features

- Overhauled the account setup and added a brand-new account switching mechanism.
- Overhauled the navigation bar to add a user menu and directly link to your profile page, the Faithful website, and more.
- Made the profile card much more useful by removing the deprecated role view and adding a button to view your website profile directly.
- Restyled profile card on logout to match the rest of the dashboard more closely (this previously used almost entirely unique styling).
- Revamped the site footer to match the API and Faithful Docs footer more closely, and added a link to the web app source.
- Added close buttons to the top right of every modal on the website (usually a cancel button was visible but now there's a universal place to close it from if one isn't present).
- Added basic browser language detection to the web app. If your language isn't supported, you can help translate the web app on [our Crowdin](https://translate.faithfulpack.net).
- Changed all buttons to put icons on the left to match with modern convention, and made icons more specific when possible (instead of having five billion + icons everywhere).
- Made the primary green color in light mode more accessible and high-contrast.
- Made gallery modal skeleton more accurate.

## Fixes

- Fixed basically all forms on mobile being practically unusable due to icons clipping into their containers.
- Fixed all scrollbars again (blame Safari for making literally no sense lol).
- Fixed the dashboard on specific device widths having clipping issues.
- Fixed the dark sidebar checkbox looking disabled when actually clickable.
- Fixed sidebar categories defaulting to closed on creation.
- Made add-on form titles a bit less lopsided and improved their spacing.
- Added missing placeholder text to tabbed text boxes.
- Added some missing icons to the add-on card.
		`,
	},
	{
		date: "2026-02-11",
		description: `
Over the past few months, we've been focusing on tweaking the overall appearance of the web app to just feel "right". From a full overhaul of our light mode to a ton of minor spacing and sizing tweaks, the web app has never been more polished!

## Visual changes

- Completely revamped light mode to be prettier, more accessible, and look less like a poorly modified version of dark mode.
- Redid the user card at the top of the sidebar to be more legible and stylistically consistent with the rest of the app.
- Overhauled the profile page to look much more complete and be much more informative.
- Improved the status message system to show more information and use less unpleasant colors.
- Overhauled all loading states to use the modern skeleton standard instead of loading spinners.
- Increased the gallery column maximum number and made the search settings more compact.
- Fixed white screen flashbang when the web app is loading on dark mode.
- Fixed all scrollbars (these were really bad before).
- Fixed miscellaneous spacing, sizing, and border radii-related issues throughout the entire app.

## Other changes

- Made opening the web app much faster (previously, loading website settings was done really inefficiently)
- Replaced the incredibly inaccurate user card on the dashboard with a more informative texture card that links directly to the gallery.
- Added Markdown-powered Faithful bios to the profile page and a button to directly go to your public profile page.
- Removed ancient contribution statistics page that never worked properly.
- Fixed gallery edition and version desync issue (again).
- Added the ability to link to a specific gallery tab by appending #information, #authors, or #animation to the share URL.
- Add some missing translations.
- Added alt text to gallery images.
`,
	},
	{
		date: "2025-11-19",
		description: `
Your eyes do not deceive you—we've fully overhauled the application sidebar! Not only have we brought the appearance into the 2020s, but we've also added category collapsing, a much smaller design, and improved mobile support. We've also added and updated several quality of life features for our five power users.

## New features

- You can now mark your Faithful account as anonymous, which will remove your username and skin from your add-ons and contributions. Your Discord ID will still be accessible by contributors for the purposes of crediting textures, but will not be shown anywhere on the site.
- Animated gallery textures now display with their respective animation and MCMETA.
- You can copy a given contribution's authors by clicking on the table field in the gallery modal.
- Completely revamped the sidebar with persistent category collapsing and a more compact design.

## Quality of life changes

- Removed lots of unused CSS, which caused bloat and unnecessary bandwidth usage.
- Replaced the old add-on description markdown preview with GitHub-style tabbed boxes to save on vertical space.
- The "Return to Top" gallery button now works properly.
- The footer is now properly pinned to the bottom of the screen on smaller pages.
- Added several missing ARIA labels and alt text, which caused accessibility issues.
- Hide dashboard heatmap scrollbars on small screens unless actually needed.
- Overhauled significant amounts of the gallery grid rendering mechanism to be more efficient, faster, and less buggy.
- Added autofocusing to the gallery search field on page load.
- Paths are now intelligently truncated on small screens on the gallery modal to no longer overflow
- Added a real error message to the gallery modal (previously it would just show a blank screen and an infinite loading status if something went wrong)
- Improved light mode support throughout the web app, including but not limited to the dashboard cards, sidebar icons, and form backgrounds.
		`,
	},
];
