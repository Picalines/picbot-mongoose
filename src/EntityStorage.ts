import mongoose from "mongoose";
import { Collection } from "discord.js";
import { Entity, EntityManager, EntityStorage, EntityType } from "picbot-engine";
import { expressionToFilter } from "./Expression.js";
import { managerToModel } from "./Utils.js";

const findByIdOrCreate = async <T extends mongoose.Document>(model: mongoose.Model<T>, id: string) => {
    return await model.findById(id).exec() ?? await model.create({ _id: id });
};

const _entityStorage = <E extends EntityType>(model: mongoose.Model<mongoose.Document>): EntityStorage<E> => ({
    accessState: ({ id }, { name, defaultValue }) => ({
        set: async value => void await model.findByIdAndUpdate(
            id,
            { [name]: value },
            { setDefaultsOnInsert: true, upsert: true, useFindAndModify: false }
        ).exec(),

        value: async () => (await findByIdOrCreate(model, id)).get(name) ?? defaultValue,
    }),

    delete: async ({ id }) => void await model.deleteOne({ id }).exec(),

    clear: async () => void await model.deleteMany({}).exec(),

    async select(selector, { manager, maxCount = Infinity, variables = {} }) {
        const filter = expressionToFilter(selector.expression, variables);

        const model = managerToModel(manager);

        const selected = await model.find(filter).limit(maxCount).exec();

        return selected.map(doc => (manager.cache as Collection<string, Entity<E>>).get(doc.id)!);
    }
});

export const entityStorage = async <E extends EntityType>(manager: EntityManager<E>, model: mongoose.Model<mongoose.Document>): Promise<EntityStorage<E>> => {
    const storage = _entityStorage(model);

    await Promise.all(
        (manager.cache as Collection<string, Entity<E>>).map(entity => model.findByIdAndUpdate(entity.id, {}, {
            upsert: true, setDefaultsOnInsert: true, useFindAndModify: false
        }))
    );

    return storage;
};
