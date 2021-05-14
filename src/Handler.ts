import mongoose from "mongoose";
import { CreateDatabaseHandler, EntityType } from "picbot-engine";
import { entityStorage } from "./EntityStorage.js";

type Options = Readonly<{
    databaseUrl: string;
    connectOptions?: mongoose.ConnectOptions;
}>;

export const mongooseDatabaseHandler = (options: Options): CreateDatabaseHandler => database => {
    const { logger, importer } = database.bot;

    const schemas = <{ [K in EntityType]: mongoose.Schema }>Object.fromEntries(
        ['guild', 'user', 'member'].map(entityType => [entityType, new mongoose.Schema({ _id: String }, { versionKey: false })])
    );

    return {
        preLoad: async () => {
            await logger.promiseTask('connect to mongodb', () => mongoose.connect(options.databaseUrl, options.connectOptions));

            await logger.promiseTask('generate schemas', () => importer.forEach('states', state => {
                schemas[state.entityType].add({ [state.name]: mongoose.Schema.Types.Mixed });
            }));
        },

        loadUsersState: () => entityStorage(mongoose.model('user', schemas.user, 'users')),

        loadGuildsState: () => entityStorage(mongoose.model('guild', schemas.guild, 'guilds')),

        loadMembersState: manager => entityStorage(mongoose.model(`member_of_${manager.guild.id}`, schemas.member, `members/${manager.guild.id}`)),

        preSave: () => logger.promiseTask('disconnect from mongodb', () => mongoose.disconnect()),
    };
};
