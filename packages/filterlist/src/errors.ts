import ExtendableError from 'es6-error';

export class LoadListError<Error = any, Additional = any> extends ExtendableError {
  error: Error;

  additional: Additional;

  constructor({
    error,
    additional,
  }: {
    error?: Error;
    additional?: Additional;
  }) {
    super('List loading failed');

    this.error = error;
    this.additional = additional;
  }
}
