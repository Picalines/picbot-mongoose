import mongoose from "mongoose";
import { EntityManager, EntityType } from "picbot-engine";
import { GuildMemberManager } from "discord.js";

export const managerToEntityType = <E extends EntityType>(manager: EntityManager<E>): E => {
    switch (manager.holds.name) {
        case 'User': return <E>'user';
        case 'Guild': return <E>'guild';
        case 'GuildMember': return <E>'member';
    }
    throw new Error('invalid manager');
};

export const managerToModelName = <E extends EntityType>(manager: EntityManager<E>) => {
    const entityType = managerToEntityType(manager);
    return entityType + (entityType == 'member' ? `_of_${(manager as GuildMemberManager).guild.id}` : '');
};

export const managerToModel = <E extends EntityType>(manager: EntityManager<E>) => {
    return mongoose.model(managerToModelName(manager));
};
