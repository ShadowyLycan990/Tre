"use strict";
import readlineSync from "readline-sync";
import localization from "../../Tre.Callback/localization.js";
export default function (): number {
    const value = readlineSync.prompt({
        limit: [16384, 8192, 4096, 2048, 1024, 512, 256, 128, 64, 32],
        limitMessage: '$<lastInput> ' + localization("not_a_valid_texture_number_input") + ' ' + localization("available") + ': "16384", "8192", "4096", "2048", "1024", "512", "256", "128", "64", "32"',
    });
    return parseInt(value);
}