export class LoadListError<ErrorType, Additional> extends Error {
	error?: ErrorType;

	additional?: Additional;

	constructor({
		error,
		additional,
	}: {
		error?: ErrorType;
		additional?: Additional;
	}) {
		super("List loading failed");

		this.error = error;
		this.additional = additional;
	}
}
