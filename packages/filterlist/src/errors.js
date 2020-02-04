import ExtendableError from 'es6-error';

export class LoadListError extends ExtendableError {
  constructor({
    error,
    additional,
  }) {
    super('List loading failed');
    this.error = error;
    this.additional = additional;
  }
}
