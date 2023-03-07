"use strict";
import rton2json from './rton2json.js';
import json2rton from './json2rton.js';
import { outfile, readfilebuffer, read_dir, makefolder, readjson } from '../../../Tre.Libraries/Tre.FileSystem/util.js';
import fs from 'fs-extra';
import path, { parse } from 'node:path';
import localization from '../../../Tre.Callback/localization.js';
import * as color from '../../../Tre.Libraries/Tre.Color/color.js';

export function rton_to_json(filepath?: string, this_will_stop_console_log: boolean = false): void {
    if (!filepath) {
        return;
    }

    if (fs.statSync(filepath).isDirectory()) {
        const folder = read_dir(filepath);
        makefolder(`${filepath}_json`);
        for (let file of folder) {
            if (parse(file).ext.toUpperCase() == '.RTON') {
                const jsonpath = `${filepath}/../${path.basename(filepath)}.json`;
                outfile(jsonpath, rton2json(readfilebuffer(file)) as any);
            }
        }
        if (!this_will_stop_console_log) {
            console.log(`${color.fggreen_string("◉ " + localization("execution_out"))}: ${path.resolve(`${filepath}_json`)}`);
        }
    } else {
        outfile(`${parse(filepath).dir}/${parse(filepath).name}.json`, rton2json(readfilebuffer(filepath)) as any);
        if (!this_will_stop_console_log) {
            console.log(`${color.fggreen_string("◉ " + localization("execution_out"))}: ${path.resolve(`${parse(filepath).dir}/${parse(filepath).name}.json`)}`);
        }
    }
}

export function json_to_rton(filepath?: string, this_will_stop_console_log: boolean = false): void {
    if (!filepath) {
        return;
    }
    if (fs.statSync(filepath).isDirectory()) {
        const folder = read_dir(filepath);
        makefolder(`${filepath}_rton`);
        for (let file of folder) {
            if (parse(file).ext.toUpperCase() == '.JSON') {
                const jsonpath = `${filepath}_rton${parse(file.slice(filepath.length)).dir}/${parse(file.slice(filepath.length)).name}.rton`;
                outfile(jsonpath, json2rton(readjson(file)) as any);
            }
        }
        if (!this_will_stop_console_log) {
            console.log(`${color.fggreen_string("◉ " + localization("execution_out"))}: ${path.resolve(`${filepath}_rton`)}`);
        }
    } else {
        outfile(`${parse(filepath).dir}/${parse(filepath).name}.rton`, json2rton(readjson(filepath)) as any);
        if (!this_will_stop_console_log) {
            console.log(`${color.fggreen_string("◉ " + localization("execution_out"))}: ${path.resolve(`${parse(filepath).dir}/${parse(filepath).name}.rton`)}`);
        }
    }
}
