import mongoose from "mongoose";
import { AnyExpression, BooleanExpression, EntityType, ExpressionVariable, State } from "picbot-engine";

export const expressionToFilter = <E extends EntityType>(expression: AnyExpression<E, any>, vars: Record<string, any>): mongoose.FilterQuery<{}> => {
    if (expression instanceof BooleanExpression) {
        if (expression.operator == 'not') {
            return { $not: expressionToFilter(expression.subExpressions[0]!, vars) };
        }

        return { ['$' + expression.operator]: expression.subExpressions.map(e => expressionToFilter(e, vars)) };
    }

    const leftState = expression.left.name;

    if (expression.right instanceof State) {
        const rightState = '$' + expression.right.name;
        return { [leftState]: { ['$' + expression.operator]: rightState } };
    }

    if (expression.right instanceof ExpressionVariable) {
        return { [leftState]: { ['$' + expression.operator]: vars[expression.right.name] } };
    }

    return { [leftState]: { ['$' + expression.operator]: expression.right } };
};
