/**
 * Transform
 *
 *   module.exports.a = *;
 *
 * to
 *
 *   export const a = *;
 *
 * Only on global context
 */

import Logger from "./utils/logger";
import { isTopNode } from "./utils/filters";

function transformer(file, api, options) {
    const j = api.jscodeshift;
    const logger = new Logger(file, options);

    const root = j(file.source);

    const getFirstNode = () => root.find(j.Program).get('body', 0).node;

    // Save the comments attached to the first node
    const firstNode = getFirstNode();
    const { comments } = firstNode;

    // ------------------------------------------------------------------ SEARCH
    // https://astexplorer.net/#/gist/334f5bd39244c7feab38a3fd3cc0ce7f/c332a5b4cbd1a9718e644febf2dce9e9bd032d1b
    const moduleExportNodes = root
        .find(j.ExpressionStatement, {
            expression: {
                left: {
                    object: {
                        object: {
                            name: "module"
                        },
                        property: {
                            name: "exports"
                        }
                    }
                    // property is target
                },
                operator: "="
            }
        })
        .filter(isTopNode);

    const exportNodes = root
        .find(j.ExpressionStatement, {
            expression: {
                left: {
                    object: {
                        name: "exports"
                    }
                    // property is target
                },
                operator: "="
            }
        })
        .filter(isTopNode);

    logger.log(`${moduleExportNodes.length + exportNodes.length} nodes will be transformed`);
    // ----------------------------------------------------------------- REPLACE
    const replace = (path) => {
        const node = path.node;
        // Identifier node
        const id = node.expression.left.property;
        const init = node.expression.right;
        // module.export.b = a
        // → export { a as b }
        if (id.type === "Identifier" && init.type === "Identifier") {
            return j.exportNamedDeclaration(null, [j.exportSpecifier(init, id)]);
        }
        // https://babeljs.io/docs/en/babel-types#exportnameddeclaration
        const declaration = j.variableDeclaration("const", [j.variableDeclarator(id, init)]);
        return j.exportNamedDeclaration(declaration);
    }

    exportNodes
        .replaceWith(replace)
    moduleExportNodes
        .replaceWith(replace)
    
    // If the first node has been modified or deleted, reattach the comments
    const firstNode2 = getFirstNode();
    if (firstNode2 !== firstNode) {
        firstNode2.comments = comments;
    }

    return root.toSource();
}

export default transformer;
