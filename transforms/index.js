import toImportDefault from "./require-to-import-default";
import toNamedImport from "./require-with-props-to-named-import";
import toExportDefault from "./module-exports-to-export-default";
import toNamedExport from "./module-exports-to-named-export";
import singleRequire from "./single-require";
import singleRequireLazy from "./single-require-lazy";

import ui5ToolingAdoptImports from "./ui5-tooling-adopt-imports";
import ui5ToolingFixGetLogger from "./ui5-tooling-fix-getLogger";

const transformScripts = (fileInfo, api, options) => {
    return [toExportDefault, toNamedImport, singleRequire, singleRequireLazy, toImportDefault, toNamedExport, ui5ToolingAdoptImports, ui5ToolingFixGetLogger].reduce((input, script) => {
        return script(
            {
                source: input
            },
            api,
            options
        );
    }, fileInfo.source);
};

module.exports = transformScripts;
