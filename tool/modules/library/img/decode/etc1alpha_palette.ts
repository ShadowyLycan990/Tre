"use strict";
import sharp from "sharp";
import * as color from "../../color/color.js";
import localization from "../../../callback/localization.js";
import bitstream from "bit-buffer";
import exception_encode_dimension from "../exception/encode.js";
import fs_js from "../../fs/implement.js";
import { Console } from "../../../callback/console.js";
import { args } from "../../../implement/arguments.js";

export default async function (
    dir: string,
    width: number,
    height: number,
    not_notify_console_log: boolean = false
): Promise<void> {
    if (!not_notify_console_log) {
        Console.WriteLine(
            color.fggreen_string(
                `◉ ${localization("execution_information")}: `
            ) + "rgb_etc1_a_palette"
        );
        Console.WriteLine(
            color.fggreen_string(`◉ ${localization("execution_in")}:\n     `) +
                `${fs_js.get_full_path(dir)}`
        );
        Console.WriteLine(
            color.fggreen_string(
                `◉ ${localization("execution_display_width")}: `
            ) + `${width}`
        );
        Console.WriteLine(
            color.fggreen_string(
                `◉ ${localization("execution_display_height")}: `
            ) + `${height}`
        );
    }
    const checker_dimension = exception_encode_dimension(width, height);
    if (checker_dimension && fs_js.check_etcpak()) {
        fs_js.js_remove(
            `${fs_js.parse_fs(dir).dir}/${fs_js
                .parse_fs(dir)
                .name.toUpperCase()}.png`
        );
        const tre_thirdparty =
            fs_js.dirname(args.main_js as any) + "/extension/third/encode/";
        let cmd = `etcpak.exe --etc1 -v "${fs_js.parse_fs(dir).base}" "${fs_js
            .parse_fs(dir)
            .name.toUpperCase()}.png"`;
        let pvr_header = Buffer.from(
            "505652030000000006000000000000000000000000000000BBBBBBBBAAAAAAAA0100000001000000010000000100000000000000",
            "hex"
        );
        pvr_header.writeInt32LE(("0x" + width.toString(16)) as any, 28);
        pvr_header.writeInt32LE(("0x" + height.toString(16)) as any, 24);
        const originalImage = Buffer.concat([
            pvr_header,
            fs_js.read_file(dir, "buffer").slice(0, (width * height) / 2),
        ]);
        fs_js.write_file(
            `${tre_thirdparty}${fs_js.parse_fs(dir).base}`,
            originalImage
        );
        fs_js.evaluate_powershell(cmd, tre_thirdparty, "ignore");
        await sharp(
            `${tre_thirdparty}${fs_js.parse_fs(dir).name.toUpperCase()}.png`
        )
            .removeAlpha()
            .toBuffer()
            .then(async (slice_alpha) => {
                const alpha_channel_palette = fs_js
                    .read_file(dir, "buffer")
                    .slice((width * height) / 2);
                const square = width * height;
                const indexNumber = alpha_channel_palette[0];
                let bitsLength: number;
                let indexTable: any;
                let bufferbyte: number;
                if (indexNumber === 0) {
                    bitsLength = 1;
                    indexTable = Buffer.from([0, 255]);
                } else {
                    bitsLength =
                        indexNumber === 1
                            ? 1
                            : Math.floor(Math.log2(indexNumber - 1)) + 1;
                    indexTable = new Array();
                    for (let i = 0; i < indexNumber; i++) {
                        bufferbyte = alpha_channel_palette[i + 1];
                        indexTable.push((bufferbyte << 4) | bufferbyte);
                    }
                }
                const alpha_channel_palette_slice_header = Buffer.concat([
                    alpha_channel_palette.slice(17),
                    Buffer.alloc(17),
                ]);
                const bitstream_alpha = new bitstream.BitStream(
                    alpha_channel_palette_slice_header
                );
                bitstream_alpha.bigEndian = true;
                let alpha_channel_raw = new Array();
                for (let i = 0; i < square; i++) {
                    alpha_channel_raw.push(
                        indexTable[bitstream_alpha.readBits(bitsLength)]
                    );
                }
                await sharp(Buffer.from(alpha_channel_raw), {
                    raw: { width: width, height: height, channels: 1 },
                })
                    .toBuffer()
                    .then(async (alpha: Buffer) => {
                        await sharp(slice_alpha)
                            .joinChannel(alpha)
                            .toBuffer()
                            .then((buffer: Buffer) => {
                                if (!not_notify_console_log) {
                                    Console.WriteLine(
                                        color.fggreen_string(
                                            `◉ ${localization(
                                                "execution_out"
                                            )}:\n     `
                                        ) +
                                            `${fs_js.resolve(
                                                `${
                                                    fs_js.parse_fs(dir).dir
                                                }/${fs_js
                                                    .parse_fs(dir)
                                                    .name.toUpperCase()}.png`
                                            )}`
                                    );
                                }
                                fs_js.write_file(
                                    `${fs_js.parse_fs(dir).dir}/${fs_js
                                        .parse_fs(dir)
                                        .name.toUpperCase()}.png`,
                                    buffer
                                );
                            });
                        for (let item of fs_js.one_reader(tre_thirdparty)) {
                            fs_js.parse_fs(item).ext.toUpperCase() !== ".EXE"
                                ? fs_js.js_remove(`${tre_thirdparty}${item}`)
                                : {};
                        }
                    })
                    .catch((error: any) => {
                        throw new Error(
                            localization("popcap_ptx_decode_native_error")
                        );
                    });
            });
    }
}
