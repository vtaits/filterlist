export class LoadListError<ErrorType, Additional> extends Error {
	error?: ErrorType;

	additional?: Additional;

	total?: number | null;

	constructor({
		error,
		additional,
		total,
	}: {
		error?: ErrorType;
		additional?: Additional;
		total?: number | null;
	}) {
		super("List loading failed");

		this.error = error;
		this.additional = additional;
		this.total = total;
	}
}
