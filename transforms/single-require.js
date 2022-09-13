/**
 * Transform
 *
 *   require('lib');
 *
 * to
 *
 *   import 'lib';
 *
 * Only on global context
 */

import Logger from "./utils/logger";
import { isTopNode } from "./utils/filters";

function transformer(file, api, options) {
    const j = api.jscodeshift;
    const ಠ_ಠ = new Logger(file, options);

    const root = j(file.source);

    const getFirstNode = () => root.find(j.Program).get('body', 0).node;

    // Save the comments attached to the first node
    const firstNode = getFirstNode();
    const { comments } = firstNode;

    // ------------------------------------------------------------------ SEARCH
    const nodes = root
        .find(j.ExpressionStatement, {
            expression: {
                callee: {
                    name: "require"
                }
            }
        })
        .filter(isTopNode);

    ಠ_ಠ.log(`${nodes.length} nodes will be transformed`);

    // ----------------------------------------------------------------- REPLACE
    nodes
        .replaceWith((path) => {
            const sourcePath = path.node.expression.arguments.pop();
            return j.importDeclaration([], sourcePath);
        });

    // If the first node has been modified or deleted, reattach the comments
    const firstNode2 = getFirstNode();
    if (firstNode2 !== firstNode) {
        firstNode2.comments = comments;
    }

    return root.toSource();
}

export default transformer;
