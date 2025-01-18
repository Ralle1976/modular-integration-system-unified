export abstract class BaseService {
    protected logger: Logger;

    constructor() {
        this.logger = new Logger();
    }

    protected async handleError(error: Error): Promise<void> {
        this.logger.error(error.message);
    }
}