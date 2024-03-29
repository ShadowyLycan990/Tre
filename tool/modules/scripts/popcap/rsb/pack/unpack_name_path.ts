"use strict";
import { res_pack } from "../../../../scripts/popcap/resources/util.js";
import rsg_pack from "../../rsg/rsg_pack.js";
import * as color from "../../../../library/color/color.js";
import localization from "../../../../callback/localization.js";
import fs_js from "../../../../library/fs/implement.js";
import { Console } from "../../../../callback/console.js";

export default async function (
    rsb_path: string,
    RSG_items_list: any,
    pack_method: any,
    RSG_file_data_list: any
) {
    const rsg_packet_info = new Array();
    const rsg_data_info = new Array();
    const RSG_file_data_list_clone = RSG_file_data_list.slice();
    function Unpack_Packet(rsg_data: any, composite_index: any, rsg_name: any) {
        const part1_ZSize = rsg_data.slice(44, 48).readInt32LE();
        const info_size = rsg_data.slice(72, 76).readInt32LE();
        const info_offset = rsg_data.slice(76, 80).readInt32LE();
        const info_limit = info_size + info_offset;
        let ptx_number = 0;
        function CheckPtxFormat(square_ratio: any) {
            let format_ptx = 0;
            switch (square_ratio) {
                case 20:
                    format_ptx = 0;
                    break;
                case 2:
                    format_ptx = 30;
                    break;
                case 5 && 7:
                    format_ptx = 147;
                    break;
                default:
                    Console.WriteLine(
                        color.fgred_string(
                            localization("unknown_ptx_format_detected")
                        )
                    );
                    break;
            }
            return format_ptx;
        }
        function WriteFile(
            name_path: string,
            temp_offset: number,
            atlas: boolean,
            ...any_any: number[]
        ) {
            if (atlas) {
                const file_data_size = rsg_data
                    .slice(temp_offset - 4, temp_offset)
                    .readInt32LE();
                const image_width = rsg_data
                    .slice(temp_offset + 12, temp_offset + 16)
                    .readInt32LE();
                const image_height = rsg_data
                    .slice(temp_offset + 16, temp_offset + 20)
                    .readInt32LE();
                const format = CheckPtxFormat(
                    parseInt(
                        (((file_data_size / (image_width * image_height)) *
                            10) /
                            2) as any
                    )
                );
                ptx_number++;
                rsg_packet_info.push({
                    name_path,
                    composite_index,
                    image_width,
                    image_height,
                    format,
                });
            } else {
                rsg_packet_info.push({
                    name_path,
                    composite_index,
                    image_width: 0,
                    image_height: 0,
                });
            }
        }
        function Extract_File(atlas: boolean, temp_offset: number) {
            let name_path = "";
            let name_dict = new Array();
            while (temp_offset < info_limit) {
                const character_byte = rsg_data.slice(
                    temp_offset,
                    (temp_offset += 1)
                );
                const temp_bytes =
                    Buffer.concat([
                        rsg_data.slice(temp_offset, (temp_offset += 3)),
                        Buffer.alloc(1),
                    ]).readInt32LE() * 4;
                if (character_byte === "\x00") {
                    if (temp_bytes !== 0) {
                        name_dict.push({ name_path, temp_bytes });
                    }
                    atlas
                        ? WriteFile(
                              name_path,
                              (temp_offset += 12),
                              true,
                              (temp_offset += 20)
                          )
                        : WriteFile(name_path, (temp_offset += 12), false);
                    name_dict.forEach((value, index) => {
                        value.temp_bytes + info_offset < temp_offset
                            ? name_dict.slice(index, index + 1)
                            : (name_path = value.name_path);
                    });
                } else {
                    if (temp_bytes !== 0) {
                        name_dict.push({ name_path, temp_bytes });
                        name_path += character_byte;
                    } else {
                        name_path += character_byte;
                    }
                }
            }
        }
        part1_ZSize !== 0
            ? Extract_File(true, info_offset)
            : Extract_File(false, info_offset);
        rsg_data_info.push({ rsg_name, composite_index, ptx_number });
    }
    const pack_simple_system_data = new Array();
    for (let rsg_item of RSG_items_list) {
        if (
            pack_method === "simple" &&
            rsg_item.name_path.toUpperCase() === "PACKAGES"
        ) {
            const packages_data = await rsg_pack(
                `${rsb_path}/RES/PACKAGES`,
                true,
                true,
                false,
                true
            );
            Unpack_Packet(
                packages_data,
                rsg_item.composite_index,
                rsg_item.name_path
            );
            pack_simple_system_data.push(packages_data);
        } else if (
            pack_method === "simple" &&
            rsg_item.name_path.toUpperCase().indexOf("__MANIFESTGROUP__") !== -1
        ) {
            let resources_data;
            if (fs_js.is_file(`${rsb_path}/Res/PROPERTIES/RESOURCES.res`)) {
                res_pack(
                    `${rsb_path}/Res/PROPERTIES/RESOURCES.res`,
                    0,
                    0,
                    true
                ),
                    true;
                resources_data = await rsg_pack(
                    `${rsb_path}/Res\\PROPERTIES\\RESOURCES.JSON`,
                    true,
                    true,
                    true,
                    true
                );
            } else {
                if (
                    fs_js.is_file(`${rsb_path}/Res/PROPERTIES/RESOURCES.json`)
                ) {
                    resources_data = await rsg_pack(
                        `${rsb_path}/Res\\PROPERTIES\\RESOURCES.JSON`,
                        true,
                        true,
                        true,
                        true
                    );
                } else if (
                    fs_js.is_file(`${rsb_path}/Res/PROPERTIES/RESOURCES.rton`)
                ) {
                    resources_data = await rsg_pack(
                        `${rsb_path}/Res\\PROPERTIES\\RESOURCES.RTON`,
                        true,
                        true,
                        true,
                        true
                    );
                } else {
                    throw new Error(localization("cannot_get_res_data"));
                }
            }
            Unpack_Packet(
                resources_data,
                rsg_item.composite_index,
                rsg_item.name_path
            );
            pack_simple_system_data.push(resources_data);
        } else if (pack_method === "everything") {
            for (let h = 0; h < RSG_file_data_list_clone.length; h++) {
                if (
                    RSG_file_data_list_clone[h].rsg_name.toUpperCase() ===
                    rsg_item.name_path.toUpperCase()
                ) {
                    Unpack_Packet(
                        RSG_file_data_list_clone[h].rsg_data,
                        rsg_item.composite_index,
                        rsg_item.name_path
                    );
                    RSG_file_data_list_clone.splice(h, 1);
                    break;
                }
            }
        } else {
            Unpack_Packet(
                fs_js.read_file(
                    `${rsb_path}/Packet/${rsg_item.name_path}.rsg`,
                    "buffer"
                ),
                rsg_item.composite_index,
                rsg_item.name_path
            );
        }
    }
    return [rsg_packet_info, rsg_data_info, pack_simple_system_data];
}
