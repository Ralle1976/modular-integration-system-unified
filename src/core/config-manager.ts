export class ConfigManager {
    private config: Record<string, any> = {};

    constructor() {
        this.loadEnvironmentVariables();
    }

    private loadEnvironmentVariables(): void {
        this.config = {
            ...this.config,
            ...Object.fromEntries(
                Object.entries(process.env)
                    .filter(([_, v]) => v !== undefined)
            )
        };
    }
}