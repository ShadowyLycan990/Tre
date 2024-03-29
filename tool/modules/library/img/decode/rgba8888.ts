"use strict";
import sharp from "sharp";
import localization from "../../../callback/localization.js";
import * as color from "../../color/color.js";
import max_sharp from "../exception/evaluate.js";
import fs_js from "../../fs/implement.js";
import { Console } from "../../../callback/console.js";

export default async function (
    dir: string,
    width: number,
    height: number,
    not_notify_console_log: boolean = false,
): Promise<void> {
    if (!not_notify_console_log) {
        Console.WriteLine(color.fggreen_string(`◉ ${localization("execution_information")}: `) + "rgba8888");
        Console.WriteLine(
            color.fggreen_string(`◉ ${localization("execution_in")}:\n     `) + `${fs_js.get_full_path(dir)}`,
        );
        Console.WriteLine(color.fggreen_string(`◉ ${localization("execution_display_width")}: `) + `${width}`);
        Console.WriteLine(color.fggreen_string(`◉ ${localization("execution_display_height")}: `) + `${height}`);
    }
    max_sharp(width, height);
    fs_js.js_remove(`${dir}/../${fs_js.parse_fs(dir).name}.png`);
    await sharp(fs_js.read_file(dir, "buffer"), {
        raw: {
            width: width,
            height: height,
            channels: 4,
        },
    })
        .toBuffer()
        .then((result) => {
            if (!not_notify_console_log) {
                Console.WriteLine(
                    color.fggreen_string(`◉ ${localization("execution_out")}:\n     `) +
                        `${fs_js.resolve(`${dir}/../${fs_js.parse_fs(dir).name}.png`)}`,
                );
            }
            return fs_js.write_file(`${dir}/../${fs_js.parse_fs(dir).name}.png`, result);
        })
        .catch((error: any) => {
            throw new Error(localization("popcap_ptx_decode_native_error"));
        });
}
