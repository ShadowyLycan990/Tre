"use strict";
import sharp from "sharp";
import { dimension } from "../util.js";
import localization from "../../../callback/localization.js";
import * as color from "../../color/color.js";
import max_sharp from "../exception/evaluate.js";
import fs_js from "../../fs/implement.js";
import { Console } from "../../../callback/console.js";

export default async function (dir: string, not_notify_console_log: boolean = false): Promise<void> {
    const img_data: { width: number; height: number } = await dimension(dir).then(
        (result: { width: number; height: number }) => {
            return result;
        },
    );
    if (!not_notify_console_log) {
        Console.WriteLine(color.fggreen_string(`◉ ${localization("execution_information")}: `) + "argb8888");
        Console.WriteLine(
            color.fggreen_string(`◉ ${localization("execution_in")}:\n     `) + `${fs_js.get_full_path(dir)}`,
        );
        Console.WriteLine(color.fggreen_string(`◉ ${localization("execution_display_width")}: `) + `${img_data.width}`);
        Console.WriteLine(
            color.fggreen_string(`◉ ${localization("execution_display_height")}: `) + `${img_data.height}`,
        );
    }
    max_sharp(img_data.width, img_data.height);
    fs_js.js_remove(fs_js.resolve(dir + "/../" + fs_js.parse_fs(dir).name + ".ptx"));
    const blue = await sharp(dir)
        .extractChannel("blue")
        .toBuffer()
        .catch((error: any) => {
            throw new Error(localization("cannot_read_blue_channel"));
        });
    const green = await sharp(dir)
        .extractChannel("green")
        .toBuffer()
        .catch((error: any) => {
            throw new Error(localization("cannot_read_green_channel"));
        });
    const red = await sharp(dir)
        .extractChannel("red")
        .toBuffer()
        .catch((error: any) => {
            throw new Error(localization("cannot_read_red_channel"));
        });
    const alpha = await sharp(dir)
        .extractChannel("alpha")
        .toBuffer()
        .catch((error: any) => {
            throw new Error(localization("cannot_read_alpha_channel"));
        });
    if (typeof blue === "object" && typeof green === "object" && typeof red === "object" && typeof alpha === "object") {
        const data: any = await sharp(blue)
            .joinChannel(green)
            .joinChannel(red)
            .joinChannel(alpha)
            .raw()
            .toBuffer()
            .then((result: ArrayBuffer) => {
                return result;
            })
            .catch((error: any) => {
                throw new Error(localization("cannot_read_image_data"));
            });
        fs_js.write_file(dir + "/../" + fs_js.parse_fs(dir).name + ".ptx", data);
        if (!not_notify_console_log) {
            Console.WriteLine(
                color.fggreen_string(`◉ ${localization("execution_out")}:\n     `) +
                    `${fs_js.resolve(dir + "/../" + fs_js.parse_fs(dir).name + ".ptx")}`,
            );
        }
    }
    return;
}
