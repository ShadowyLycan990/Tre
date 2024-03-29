"use strict";
import localization from "../../localization.js";
import fs_js from "../../../library/fs/implement.js";
import { readline_normal } from "../../../readline/prompt/util.js";

export default async function processFilePaths(
    executor_file_need_avoid: string,
    extension: string = ".json"
): Promise<string> {
    const is_windows_explorer_open: boolean = fs_js.create_toolkit_view(
        "open_windows_explorer"
    ) as boolean;
    let filePath: string = is_windows_explorer_open
        ? await fs_js.openWindowsExplorer("file", extension)
        : readline_normal();
    while (filePath !== "") {
        if (filePath === "./") {
            console.error(`"./" ${localization("not_a_valid_file_path")}`);
            filePath = is_windows_explorer_open
                ? await fs_js.openWindowsExplorer("file", extension)
                : readline_normal();
            continue;
        }
        if (filePath === executor_file_need_avoid) {
            console.error(
                `${localization(
                    "cannot_apply_patch_file_is_using"
                )} ${executor_file_need_avoid}`
            );
            filePath = is_windows_explorer_open
                ? await fs_js.openWindowsExplorer("file", extension)
                : readline_normal();
            continue;
        }
        if (filePath[0] === '"' && filePath[filePath.length - 1] === '"') {
            filePath = filePath.slice(1, -1);
        }
        try {
            const stats = fs_js.view_io_stream(filePath);
            if (stats.isDirectory()) {
                console.error(
                    `${filePath} ${localization("is_a_directory_not_a_file")}`
                );
                filePath = is_windows_explorer_open
                    ? await fs_js.openWindowsExplorer("file", extension)
                    : readline_normal();
                continue;
            }
            if (!stats.isFile() || !filePath.toLowerCase().endsWith(".json")) {
                console.error(
                    `${filePath} ${localization(
                        "is_a_directory_not_a_valid_json_file"
                    )}`
                );
                filePath = is_windows_explorer_open
                    ? await fs_js.openWindowsExplorer("file", extension)
                    : readline_normal();
                continue;
            }
            break;
        } catch (err: any) {
            console.error(
                `${filePath} ${localization("not_a_valid_file_path")}`
            );
            filePath = is_windows_explorer_open
                ? await fs_js.openWindowsExplorer("file", extension)
                : readline_normal();
        }
    }
    return filePath;
}
