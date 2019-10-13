export class SimpleLogger {
  constructor(
    private debug: boolean,
    private logPrefix: string = 'simple-logger:: '
  ) {}

  public get log() {
    if (!this.debug) {
      return (...any) => {};
    }
    const boundLogFn: (...any) => void = console.log.bind(
      console,
      this.logPrefix
    );
    return boundLogFn;
  }

  public get warn() {
    if (!this.debug) {
      return (...any) => {};
    }
    const boundLogFn: (...any) => void = console.warn.bind(
      console,
      this.logPrefix
    );
    return boundLogFn;
  }
}
