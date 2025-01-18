export class AdvancedErrorHandler extends Error {
    private context: ErrorContext;

    constructor(moduleName: string) {
        super();
        this.context = {
            module: moduleName,
            operation: '',
            timestamp: new Date()
        };
    }
}