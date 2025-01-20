import crypto from 'crypto';

export function findMostSimilarString(inputString, stringArray) {
		let highestSimilarity = -1;
		let mostSimilarString = null;
		let mostSimilarIndex = -1;

		// Iterate through the array of strings
		for (let i = 0; i < stringArray.length; i++) {
				// Calculate similarity percentage for the current string
				let similarity = stringSimilarity(inputString, stringArray[i]);
				
				// Update most similar string if the current similarity is higher
				if (similarity > highestSimilarity) {
						highestSimilarity = similarity;
						mostSimilarString = stringArray[i];
						mostSimilarIndex = i;
				}
		}

		// Return the most similar string and its index
		return { string: mostSimilarString, index: mostSimilarIndex, similarity: highestSimilarity };
}

// Function to calculate Levenshtein distance
function levenshteinDistance(s1, s2) {
		let matrix = [];
		let i, j;

		// Initialize the matrix with zeros
		for (i = 0; i <= s1.length; i++) {
				matrix[i] = [i];
		}

		for (j = 0; j <= s2.length; j++) {
				matrix[0][j] = j;
		}

		// Fill in the matrix
		for (i = 1; i <= s1.length; i++) {
				for (j = 1; j <= s2.length; j++) {
						let cost = (s1[i - 1] === s2[j - 1]) ? 0 : 1;
						matrix[i][j] = Math.min(
								matrix[i - 1][j] + 1,     // deletion
								matrix[i][j - 1] + 1,     // insertion
								matrix[i - 1][j - 1] + cost // substitution
						);
				}
		}

		// Return the Levenshtein distance
		return matrix[s1.length][s2.length];
}

// Function to calculate string similarity
function stringSimilarity(string1, string2) {
		// Calculate the Levenshtein distance between the two strings
		let distance = levenshteinDistance(string1, string2);

		// Calculate the maximum possible distance (length of the longer string)
		let maxLength = Math.max(string1.length, string2.length);

		// Calculate the similarity percentage
		let similarityPercentage = ((maxLength - distance) / maxLength) * 100;
		return similarityPercentage;
}

export function sha256(data) {
		const hash = crypto.createHash('sha256');
		hash.update(data);
		return hash.digest('hex');
}

export function shuffleArray(array) {
		for (let i = array.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[array[i], array[j]] = [array[j], array[i]];
		}
		return array;
}

export function customSort(input, arr) {
		arr.sort((a, b) => {
				const hashA = sha256(a + input);
				const hashB = sha256(b + input);
				return hashA.localeCompare(hashB);
		});
		return arr;
}

export function getNextValidator(hash, validatorArray) {

		const idealScores = [];

		const bestScoreDifferences = [];
		let mostSimilar = "";

	for (let i = 0; i < hash.length; i++) {
		const charCode = hash.charCodeAt(i);
			idealScores.push(charCode);
				bestScoreDifferences.push(128);
	}

		for (const [index, validator] of Object.entries(validatorArray)) {

				for (let i = 0; i < idealScores.length; i++) {
						
						const scoreDifference = Math.abs(idealScores[i] - validator.charCodeAt(0));

						if (scoreDifference == bestScoreDifferences[i]) {
								bestScoreDifferences[i] = scoreDifference;
						} else if (scoreDifference < bestScoreDifferences[i]) {
								bestScoreDifferences[i] = scoreDifference;
								mostSimilar = validator;
						} else {
								break;
						}

				}

		}

		console.log(bestScoreDifferences);

		return mostSimilar;

}

export class SpecialObject {
		constructor() {
			this.data = {};
		}
		insert(index, item) {
			const newData = {};
			// Copy existing data to the new object
			for (const key in this.data) {
				const numericKey = parseInt(key);
				if (numericKey >= index) {
					// Shift existing keys greater than or equal to the new index by one position
					newData[numericKey + 1] = this.data[numericKey];
				} else {
					newData[numericKey] = this.data[numericKey];
				}
			}
			// Insert the new item at the specified index
			newData[index] = item;
			// Update the data reference
			this.data = newData;
		}
		getData() {
			return this.data;
		}
	}
	
export class SpecialObject2 {
	
		constructor() {
			this.data = {};
		}
	
		insert(index, item) {
			const newData = {};
	
			// Copy existing data to the new object
			for (const key in this.data) {
				if (key.localeCompare(index) >= 0) {
					// Shift existing keys greater than or equal to the new index by one position
					newData[this.getNextAlphabeticalKey(key)] = this.data[key];
				} else {
					newData[key] = this.data[key];
				}
			}
	
			// Insert the new item at the specified index
			newData[index] = item;
	
			// Update the data reference
			this.data = newData;
		}
	
		getData() {
			return this.data;
		}
	
		getNextAlphabeticalKey(key) {
			const nextCharCode = key.charCodeAt(0) + 1;
			return String.fromCharCode(nextCharCode) + key.slice(1);
		}
}
	


