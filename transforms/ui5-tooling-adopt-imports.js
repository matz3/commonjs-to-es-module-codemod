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

const builtInModules = [
    "assert",
    "async_hooks",
    "asynchronous_context_tracking",
    "buffer",
    "child_process",
    "cluster",
    "console",
    "crypto",
    "dgram",
    "diagnostics_channel",
    "dns",
    "domain",
    "fs",
    "http",
    "http/2",
    "https",
    "inspector",
    "module",
    "os",
    "path",
    "performance_measurement_apis",
    "punycode",
    "querystring",
    "readline",
    "repl",
    "stream",
    "string_decoder",
    "test_runner",
    "timers",
    "tls_(ssl)",
    "trace_events",
    "tty",
    "url",
    "util",
    "vm",
    "web_crypto_api",
    "web_streams_api",
    "webassembly_system_interface_(wasi)",
    "worker_threads",
    "zlib",
];

function transformer(file, api, options) {
    const j = api.jscodeshift;

    function adoptImport(node) {
        if (j.Literal.check(node.source)) {
            if (
                node.source.value.startsWith(".") && !/\.(m|c)js$/.test(node.source.value) &&
                !node.source.value.endsWith("/")
            ) {
                node.source = j.literal(node.source.value + ".js");
            } else if (builtInModules.includes(node.source.value)) {
                // Prefix native node modules
                node.source = j.literal("node:" + node.source.value);
            } else if (node.source.value === "mock-require") {
                // mock-require should be replaced by esmock
                node.source = j.literal("esmock");
                if (
                    node.specifiers.length === 1 && j.ImportDefaultSpecifier.check(node.specifiers[0]) &&
                    j.Identifier.check(node.specifiers[0].local)
                ) {
                    node.specifiers[0].local = j.identifier("esmock");
                }
            }
        }
        return node;
    }

    const ಠ_ಠ = new Logger(file, options);

    const root = j(file.source);

    const getFirstNode = () => root.find(j.Program).get('body', 0).node;

    // Save the comments attached to the first node
    const firstNode = getFirstNode();
    const { comments } = firstNode;

    // ------------------------------------------------------------------ SEARCH
    const nodes = root
        .find(j.ImportDeclaration);

    ಠ_ಠ.log(`${nodes.length} nodes will be transformed`);

    // ----------------------------------------------------------------- REPLACE
    nodes
        .replaceWith((path) => {
            return adoptImport(path.node);
        });

    // If the first node has been modified or deleted, reattach the comments
    const firstNode2 = getFirstNode();
    if (firstNode2 !== firstNode) {
        firstNode2.comments = comments;
    }

    return root.toSource();
}

export default transformer;
