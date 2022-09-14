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
        .find(j.VariableDeclaration, {
            declarations: [{
                type: "VariableDeclarator",
                id: {
                    type: "Identifier"
                },
                init: {
                    type: "CallExpression",
                    callee: {
                        type: "MemberExpression",
                        object: {
                            type: "CallExpression",
                            callee: {
                                type: "Identifier",
                                name: "require"
                            },
                            arguments: [{
                                type: "Literal",
                                value: "@ui5/logger"
                            }]
                        },
                        property: {
                            type: "Identifier",
                            name: "getLogger"
                        }
                    }
                }
            }]
        })
        .filter(isTopNode);

    ಠ_ಠ.log(`${nodes.length} nodes will be transformed`);

    // ----------------------------------------------------------------- REPLACE
    nodes
        .replaceWith((path) => {
            path.node.declarations[0].init.callee.object = j.identifier("logger");
            return [j.importDeclaration([j.importDefaultSpecifier(j.identifier("logger"))], j.literal("@ui5/logger")), path.node];
        });

    // If the first node has been modified or deleted, reattach the comments
    const firstNode2 = getFirstNode();
    if (firstNode2 !== firstNode) {
        firstNode2.comments = comments;
        firstNode.comments = null;
    }

    return root.toSource();
}

export default transformer;
