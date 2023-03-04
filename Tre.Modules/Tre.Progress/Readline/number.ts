"use strict";
import localization from "../../Tre.Callback/localization.js";
import * as color from "../../Tre.Libraries/Tre.Color/color.js";
import prompt from "./prompt.js";
export default function (min: number, max: number): number {
    const args = new Array();
    for (let i = min; i <= max; i++) {
        args.push(i);
    };
    let message = "";
    if (max - min === 1) {
        message = `◉ ${localization("execution_error")}:` + ' $<lastInput> ' + localization("not_a_valid_integer_number") + ' ' + localization("it_should_be") + ' ' + min + ' ' + localization("or") + ' ' + max;
    }
    else {
        message = `◉ ${localization("execution_error")}:` + ' $<lastInput> ' + localization("not_a_valid_integer_number") + '. ' + localization("should_be_from_min_to_max") + ' [' + min + ' - ' + max + ']';
    }
    const value = prompt("\x1b[36m◉ ", args, true, color.fgred_string(message), color.fgred_string(message));
    return parseInt(value);
}