/**
 * @callback ImageValidator
 * @param {HTMLImageElement} img - Image to check
 * @returns {boolean} Whether the image is valid
 */

/** @type {ImageValidator} */
export const is16x9 = (img) => (img.width / img.height).toFixed(2) == 1.78;

/**
 * Asynchronously load and check if an image blob matches a predicate
 * @param {Blob} file - Image blob to load
 * @param {ImageValidator} isValid - Predicate to check loaded image against
 * @param {string} errorMessage - Error message to use if file
 * @returns {Promise<HTMLImageElement>} Successfully loaded image element
 */
export function verifyImage(file, isValid, errorMessage) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.addEventListener("load", (ev) => {
			const image = new Image();
			image.src = ev.target.result;

			// was able to read file, but decoding as an image failed
			image.addEventListener("error", () =>
				reject("Failed to interpret file as an image!\nYour image may be corrupted or broken."),
			);

			// if predicate matches then resolve, otherwise use provided error message
			image.addEventListener("load", () =>
				isValid(image) ? resolve(image) : reject(new Error(errorMessage)),
			);
		});

		// failed to even start reading the file
		reader.onerror = () => reject("Failed to read file contents!.");

		// start file reading process after handlers are registered
		reader.readAsDataURL(file);
	});
}
