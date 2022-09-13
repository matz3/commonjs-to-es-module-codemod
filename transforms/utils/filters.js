import j from "jscodeshift";

const isTopNode = (path) => j.Program.check(path.parent.value);

const isWithinAsyncFunction = (path) => {
    let currentPath = path.parent;
    while (!j.Program.check(currentPath.value)) {
        if (
            j.FunctionDeclaration.check(currentPath.value) ||
            j.FunctionExpression.check(currentPath.value)
        ) {
            return currentPath.value.async;
        }
        currentPath = currentPath.parent;
    }
    return false;
}

export { isTopNode, isWithinAsyncFunction };
