"use strict";
import check_resource from "../check.js";
import fs_js from "../../../../../library/fs/implement.js";
import localization from "../../../../../callback/localization.js";

interface res_for_work extends small_bundle_info_json {
    group_parent: string;
}

class merge_res_json extends check_resource {
    private static check_info_json<Template extends Output_Value>(res_json: Template): res_json is Template {
        if (!("information" in res_json)) {
            throw new Error(localization("property_information_is_null"));
        }
        if (!("expand_path" in res_json.information)) {
            throw new Error(localization("property_expand_path_is_null"));
        }
        if (res_json.information.expand_path !== "array" && res_json.information.expand_path !== "string") {
            throw new Error(localization("property_expand_path_does_not_meet_requirement"));
        }
        if (!("groups" in res_json)) {
            throw new Error(localization("property_groups_is_null"));
        }
        if (!Array.isArray(res_json.groups)) {
            throw new Error(localization("property_groups_is_not_type_of_list"));
        }
        return true;
    }
    private static check_data_json<Template extends small_bundle_info_json>(
        res_json: Template,
        file_path: string,
    ): res_json is Template {
        if (!("is_composite" in res_json)) {
            fs_js.exception_thrown(file_path);
            throw new Error(localization("property_is_composite_is_null"));
        }
        if (typeof res_json.is_composite !== "boolean") {
            fs_js.exception_thrown(file_path);
            throw new Error(localization("property_is_composite_is_not_type_of_boolean"));
        }
        if (!("subgroups" in res_json)) {
            fs_js.exception_thrown(file_path);
            throw new Error(localization("property_is_subgroups_is_null"));
        }
        if (!Array.isArray(res_json.subgroups)) {
            fs_js.exception_thrown(file_path);
            throw new Error(localization("property_is_subgroups_is_not_type_of_list"));
        }
        return true;
    }
    private static check_directory_info(directory_path: string): void {
        if (!fs_js.js_exists(`${directory_path}`)) {
            throw new Error(`${localization("does_not_exists")} ${directory_path}`);
        }
        if (!fs_js.js_exists(`${directory_path}/info.json`)) {
            throw new Error(`${localization("does_not_exists")} ${`${directory_path}/info.json`}`);
        }
        const groups_directory: string = `${directory_path}/groups`;
        if (!fs_js.js_exists(groups_directory)) {
            throw new Error(`${localization("does_not_exists")} ${groups_directory}`);
        }
        return;
    }
    private static check_whole_directory_inside_groups(directory: string, groups: Array<string>): void {
        for (const dir of groups) {
            const save_path: string = `${directory}/${dir}`;
            if (!fs_js.js_exists(save_path)) {
                throw new Error(`${localization("does_not_exists")} ${save_path}`);
            }
            if (!fs_js.js_exists(`${save_path}/data.json`)) {
                throw new Error(`${localization("does_not_exists")} ${`${save_path}/data.json`}`);
            }
            if (!fs_js.js_exists(`${save_path}/subgroup`)) {
                throw new Error(`${localization("does_not_exists")} ${`${save_path}/subgroup`}`);
            }
        }
        return;
    }
    private static check_whole_data_inside_groups_subgroup_directory<Template extends small_bundle_info_json>(
        group_directory: string,
        group_directory_name: string,
        groups_inventory: Template,
    ): void {
        for (const group of groups_inventory.subgroups) {
            if (!fs_js.js_exists(`${group_directory}/${group_directory_name}/subgroup/${group}.json`)) {
                fs_js.exception_thrown(`${group_directory}/${group_directory_name}/subgroup/${group}.json`);
                throw new Error(localization("does_not_exists"));
            }
        }
        return;
    }
    public static do_process_whole<Template extends Output_Value>(
        directory_path: string,
        output_file: string = `${directory_path}/../${fs_js.parse_fs(directory_path).name}.json`,
    ): void {
        this.check_directory_info(directory_path);
        const info_json_information: Template = fs_js.read_json(`${directory_path}/info.json`) as Template;
        this.check_info_json<Output_Value>(info_json_information);
        const res_json: res_json = {
            expand_path: info_json_information.information.expand_path as "array" | "string",
            groups: {},
        };
        const group_directory: string = `${directory_path}/groups`;
        this.check_whole_directory_inside_groups(group_directory, info_json_information.groups);
        const groups_inventory: Array<res_for_work> = new Array();
        for (let index: number = 0; index < info_json_information.groups.length; ++index) {
            const group: string = info_json_information.groups[index];
            const data_json_file_path: string = `${group_directory}/${group}/data.json`;
            const data_json: small_bundle_info_json = fs_js.read_json(data_json_file_path) as small_bundle_info_json;
            this.check_data_json<small_bundle_info_json>(data_json, data_json_file_path);
            groups_inventory.push({
                ...data_json,
                group_parent: group,
            });
            this.check_whole_data_inside_groups_subgroup_directory<small_bundle_info_json>(
                group_directory,
                group,
                groups_inventory[index],
            );
        }
        for (let index: number = 0; index < groups_inventory.length; ++index) {
            res_json.groups[groups_inventory[index].group_parent] = {
                is_composite: groups_inventory[index].is_composite,
                subgroup: {},
            };
            for (let j_index: number = 0; j_index < groups_inventory[index].subgroups.length; ++j_index) {
                res_json.groups[groups_inventory[index].group_parent].subgroup[
                    groups_inventory[index].subgroups[j_index]
                ] = fs_js.read_json(
                    `${group_directory}/${groups_inventory[index].group_parent}/subgroup/${groups_inventory[index].subgroups[j_index]}.json`,
                );
            }
        }
        fs_js.write_json(output_file, res_json);
        return;
    }
    /**
     *
     * @param directory_path - Pass directory here
     * @param output_file - Pass output file location, etc: "C:/Haruma-VN/test.json"
     */
    public static create_conversion(directory_path: string, output_file?: string): void {
        this.do_process_whole<Output_Value>(directory_path, output_file);
        return;
    }
}

export default merge_res_json;
