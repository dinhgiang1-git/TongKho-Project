import bcrypt from "bcrypt";

/**
 * generate hash from password or string
 * @param {string} password
 * @returns {string}
 */
export function generateHash(password: string): string {
	return bcrypt.hashSync(password, 10);
}

/**
 * validate text with hash
 * @param {string} password
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
export function validateHash(password: string | undefined, hash: string | undefined): Promise<boolean> {
	console.log("========== Hash validate ==========");
	console.log(password);
	console.log(hash);

	if (!password || !hash) {
		console.log("stack 2");

		return Promise.resolve(false);
	}
	console.log("stack 3");

	const a = bcrypt.compare(password, hash);

	console.log("stack 4");

	console.log("aaa", a);

	return a;
}

export function getVariableName<TResult>(getVar: () => TResult): string {
	const m = /\(\)=>(.*)/.exec(getVar.toString().replace(/(\r\n|\n|\r|\s)/gm, ""));

	if (!m) {
		throw new Error("The function does not contain a statement matching 'return variableName;'");
	}

	const fullMemberName = m[1];

	const memberParts = fullMemberName.split(".");

	return memberParts[memberParts.length - 1];
}
