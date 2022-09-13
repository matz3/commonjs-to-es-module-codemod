import j from "jscodeshift";

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

export function normalizeSourcePath(node) {
    if (!j.Literal.check(node)) {
        return node;
    }
    if (node.value.startsWith(".") && !/\.(m|c)js$/.test(node.value)) {
        return j.literal(node.value + ".js");
    } else if (builtInModules.includes(node.value)) {
        return j.literal("node:" + node.value);
    } else {
        return node;
    }
}