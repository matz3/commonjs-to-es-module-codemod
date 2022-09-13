/**
 * Transform
 *
 *   async function foo() {
 *     const lib = require('lib');
 *   }
 *
 * to
 *
 *   async function foo() {
 *     const {default: lib} = await import('lib');
 *   }
 *
 * Only within async functions
 */

import Logger from "./utils/logger";
import { isWithinAsyncFunction } from "./utils/filters";
import {normalizeSourcePath} from "./utils/sourcePath";

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
        .find(j.VariableDeclarator, {
            id: {
                type: "Identifier"
            },
            init: {
                type: "CallExpression",
                callee: {
                    type: "Identifier",
                    name: "require"
                }
            }
        })
        .filter(isWithinAsyncFunction);

    ಠ_ಠ.log(`${nodes.length} nodes will be transformed`);

    // ----------------------------------------------------------------- REPLACE
    nodes
        .replaceWith((path) => {
            const sourcePath =  normalizeSourcePath(path.node.init.arguments.pop());
            const localVariable = path.node.id;
            return j.variableDeclarator(j.objectPattern([
                j.property("init", j.identifier("default"), localVariable)
            ]), j.awaitExpression(j.importExpression(sourcePath)))
        });
    
     // If the first node has been modified or deleted, reattach the comments
     const firstNode2 = getFirstNode();
     if (firstNode2 !== firstNode) {
         firstNode2.comments = comments;
     }
 
     return root.toSource();
}

export default transformer;
