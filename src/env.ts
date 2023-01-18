declare global {
    namespace NodeJS {
        interface ProcessEnv {
            CLIENT_ID: string;
            GUILD_ID: string;
            TOKEN: string;

            BID: string;
            BRAINSHOP_API_KEY: string;

            EVENTS_WEBHOOK: string;
        }
    }
}

export const env: NodeJS.ProcessEnv = global.process.env || {
    NODE_ENV: process.env.NODE_ENV,
    TZ: process.env.TZ,
    CLIENT_ID: process.env.CLIENT_ID,
    GUILD_ID: process.env.GUILD_ID,
    TOKEN: process.env.TOKEN,

    BID: process.env.BID,
    BRAINSHOP_API_KEY: process.env.BRAINSHOP_API_KEY,

    EVENTS_WEBHOOK: process.env.EVENTS_WEBHOOK
};

if (process.env.NODE_ENV !== "production") global.process.env = env;
