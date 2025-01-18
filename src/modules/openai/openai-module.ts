import { Configuration, OpenAIApi } from 'openai';

export class OpenAIModule {
    private openai: OpenAIApi;

    constructor(apiKey: string) {
        const configuration = new Configuration({
            apiKey: apiKey
        });
        this.openai = new OpenAIApi(configuration);
    }
}