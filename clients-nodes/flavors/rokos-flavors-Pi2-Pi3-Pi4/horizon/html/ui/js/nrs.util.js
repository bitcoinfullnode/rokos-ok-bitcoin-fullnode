/******************************************************************************
 * Copyright © 2013-2015 The Nxt Core Developers.                             *
 *                                                                            *
 * See the AUTHORS.txt, DEVELOPER-AGREEMENT.txt and LICENSE.txt files at      *
 * the top-level directory of this distribution for the individual copyright  *
 * holder information and the developer policies on copyright and licensing.  *
 *                                                                            *
 * Unless otherwise agreed in a custom licensing agreement, no part of the    *
 * Nxt software, including this file, may be copied, modified, propagated,    *
 * or distributed except according to the terms contained in the LICENSE.txt  *
 * file.                                                                      *
 *                                                                            *
 * Removal or modification of this copyright notice is prohibited.            *
 *                                                                            *
 ******************************************************************************/

/**
 * @depends {nrs.js}
 */
var NRS = (function (NRS, $, undefined) {
    var LOCALE_DATE_FORMATS = {
        "ar-SA": "dd/MM/yy",
        "bg-BG": "dd.M.yyyy",
        "ca-ES": "dd/MM/yyyy",
        "zh-TW": "yyyy/M/d",
        "cs-CZ": "d.M.yyyy",
        "da-DK": "dd-MM-yyyy",
        "de-DE": "dd.MM.yyyy",
        "el-GR": "d/M/yyyy",
        "en-US": "M/d/yyyy",
        "fi-FI": "d.M.yyyy",
        "fr-FR": "dd/MM/yyyy",
        "he-IL": "dd/MM/yyyy",
        "hu-HU": "yyyy. MM. dd.",
        "is-IS": "d.M.yyyy",
        "it-IT": "dd/MM/yyyy",
        "ja-JP": "yyyy/MM/dd",
        "ko-KR": "yyyy-MM-dd",
        "nl-NL": "d-M-yyyy",
        "nb-NO": "dd.MM.yyyy",
        "pl-PL": "yyyy-MM-dd",
        "pt-BR": "d/M/yyyy",
        "ro-RO": "dd.MM.yyyy",
        "ru-RU": "dd.MM.yyyy",
        "hr-HR": "d.M.yyyy",
        "sk-SK": "d. M. yyyy",
        "sq-AL": "yyyy-MM-dd",
        "sv-SE": "yyyy-MM-dd",
        "th-TH": "d/M/yyyy",
        "tr-TR": "dd.MM.yyyy",
        "ur-PK": "dd/MM/yyyy",
        "id-ID": "dd/MM/yyyy",
        "uk-UA": "dd.MM.yyyy",
        "be-BY": "dd.MM.yyyy",
        "sl-SI": "d.M.yyyy",
        "et-EE": "d.MM.yyyy",
        "lv-LV": "yyyy.MM.dd.",
        "lt-LT": "yyyy.MM.dd",
        "fa-IR": "MM/dd/yyyy",
        "vi-VN": "dd/MM/yyyy",
        "hy-AM": "dd.MM.yyyy",
        "az-Latn-AZ": "dd.MM.yyyy",
        "eu-ES": "yyyy/MM/dd",
        "mk-MK": "dd.MM.yyyy",
        "af-ZA": "yyyy/MM/dd",
        "ka-GE": "dd.MM.yyyy",
        "fo-FO": "dd-MM-yyyy",
        "hi-IN": "dd-MM-yyyy",
        "ms-MY": "dd/MM/yyyy",
        "kk-KZ": "dd.MM.yyyy",
        "ky-KG": "dd.MM.yy",
        "sw-KE": "M/d/yyyy",
        "uz-Latn-UZ": "dd/MM yyyy",
        "tt-RU": "dd.MM.yyyy",
        "pa-IN": "dd-MM-yy",
        "gu-IN": "dd-MM-yy",
        "ta-IN": "dd-MM-yyyy",
        "te-IN": "dd-MM-yy",
        "kn-IN": "dd-MM-yy",
        "mr-IN": "dd-MM-yyyy",
        "sa-IN": "dd-MM-yyyy",
        "mn-MN": "yy.MM.dd",
        "gl-ES": "dd/MM/yy",
        "kok-IN": "dd-MM-yyyy",
        "syr-SY": "dd/MM/yyyy",
        "dv-MV": "dd/MM/yy",
        "ar-IQ": "dd/MM/yyyy",
        "zh-CN": "yyyy/M/d",
        "de-CH": "dd.MM.yyyy",
        "en-GB": "dd/MM/yyyy",
        "es-MX": "dd/MM/yyyy",
        "fr-BE": "d/MM/yyyy",
        "it-CH": "dd.MM.yyyy",
        "nl-BE": "d/MM/yyyy",
        "nn-NO": "dd.MM.yyyy",
        "pt-PT": "dd-MM-yyyy",
        "sr-Latn-CS": "d.M.yyyy",
        "sv-FI": "d.M.yyyy",
        "az-Cyrl-AZ": "dd.MM.yyyy",
        "ms-BN": "dd/MM/yyyy",
        "uz-Cyrl-UZ": "dd.MM.yyyy",
        "ar-EG": "dd/MM/yyyy",
        "zh-HK": "d/M/yyyy",
        "de-AT": "dd.MM.yyyy",
        "en-AU": "d/MM/yyyy",
        "es-ES": "dd/MM/yyyy",
        "fr-CA": "yyyy-MM-dd",
        "sr-Cyrl-CS": "d.M.yyyy",
        "ar-LY": "dd/MM/yyyy",
        "zh-SG": "d/M/yyyy",
        "de-LU": "dd.MM.yyyy",
        "en-CA": "dd/MM/yyyy",
        "es-GT": "dd/MM/yyyy",
        "fr-CH": "dd.MM.yyyy",
        "ar-DZ": "dd-MM-yyyy",
        "zh-MO": "d/M/yyyy",
        "de-LI": "dd.MM.yyyy",
        "en-NZ": "d/MM/yyyy",
        "es-CR": "dd/MM/yyyy",
        "fr-LU": "dd/MM/yyyy",
        "ar-MA": "dd-MM-yyyy",
        "en-IE": "dd/MM/yyyy",
        "es-PA": "MM/dd/yyyy",
        "fr-MC": "dd/MM/yyyy",
        "ar-TN": "dd-MM-yyyy",
        "en-ZA": "yyyy/MM/dd",
        "es-DO": "dd/MM/yyyy",
        "ar-OM": "dd/MM/yyyy",
        "en-JM": "dd/MM/yyyy",
        "es-VE": "dd/MM/yyyy",
        "ar-YE": "dd/MM/yyyy",
        "en-029": "MM/dd/yyyy",
        "es-CO": "dd/MM/yyyy",
        "ar-SY": "dd/MM/yyyy",
        "en-BZ": "dd/MM/yyyy",
        "es-PE": "dd/MM/yyyy",
        "ar-JO": "dd/MM/yyyy",
        "en-TT": "dd/MM/yyyy",
        "es-AR": "dd/MM/yyyy",
        "ar-LB": "dd/MM/yyyy",
        "en-ZW": "M/d/yyyy",
        "es-EC": "dd/MM/yyyy",
        "ar-KW": "dd/MM/yyyy",
        "en-PH": "M/d/yyyy",
        "es-CL": "dd-MM-yyyy",
        "ar-AE": "dd/MM/yyyy",
        "es-UY": "dd/MM/yyyy",
        "ar-BH": "dd/MM/yyyy",
        "es-PY": "dd/MM/yyyy",
        "ar-QA": "dd/MM/yyyy",
        "es-BO": "dd/MM/yyyy",
        "es-SV": "dd/MM/yyyy",
        "es-HN": "dd/MM/yyyy",
        "es-NI": "dd/MM/yyyy",
        "es-PR": "dd/MM/yyyy",
        "am-ET": "d/M/yyyy",
        "tzm-Latn-DZ": "dd-MM-yyyy",
        "iu-Latn-CA": "d/MM/yyyy",
        "sma-NO": "dd.MM.yyyy",
        "mn-Mong-CN": "yyyy/M/d",
        "gd-GB": "dd/MM/yyyy",
        "en-MY": "d/M/yyyy",
        "prs-AF": "dd/MM/yy",
        "bn-BD": "dd-MM-yy",
        "wo-SN": "dd/MM/yyyy",
        "rw-RW": "M/d/yyyy",
        "qut-GT": "dd/MM/yyyy",
        "sah-RU": "MM.dd.yyyy",
        "gsw-FR": "dd/MM/yyyy",
        "co-FR": "dd/MM/yyyy",
        "oc-FR": "dd/MM/yyyy",
        "mi-NZ": "dd/MM/yyyy",
        "ga-IE": "dd/MM/yyyy",
        "se-SE": "yyyy-MM-dd",
        "br-FR": "dd/MM/yyyy",
        "smn-FI": "d.M.yyyy",
        "moh-CA": "M/d/yyyy",
        "arn-CL": "dd-MM-yyyy",
        "ii-CN": "yyyy/M/d",
        "dsb-DE": "d. M. yyyy",
        "ig-NG": "d/M/yyyy",
        "kl-GL": "dd-MM-yyyy",
        "lb-LU": "dd/MM/yyyy",
        "ba-RU": "dd.MM.yy",
        "nso-ZA": "yyyy/MM/dd",
        "quz-BO": "dd/MM/yyyy",
        "yo-NG": "d/M/yyyy",
        "ha-Latn-NG": "d/M/yyyy",
        "fil-PH": "M/d/yyyy",
        "ps-AF": "dd/MM/yy",
        "fy-NL": "d-M-yyyy",
        "ne-NP": "M/d/yyyy",
        "se-NO": "dd.MM.yyyy",
        "iu-Cans-CA": "d/M/yyyy",
        "sr-Latn-RS": "d.M.yyyy",
        "si-LK": "yyyy-MM-dd",
        "sr-Cyrl-RS": "d.M.yyyy",
        "lo-LA": "dd/MM/yyyy",
        "km-KH": "yyyy-MM-dd",
        "cy-GB": "dd/MM/yyyy",
        "bo-CN": "yyyy/M/d",
        "sms-FI": "d.M.yyyy",
        "as-IN": "dd-MM-yyyy",
        "ml-IN": "dd-MM-yy",
        "en-IN": "dd-MM-yyyy",
        "or-IN": "dd-MM-yy",
        "bn-IN": "dd-MM-yy",
        "tk-TM": "dd.MM.yy",
        "bs-Latn-BA": "d.M.yyyy",
        "mt-MT": "dd/MM/yyyy",
        "sr-Cyrl-ME": "d.M.yyyy",
        "se-FI": "d.M.yyyy",
        "zu-ZA": "yyyy/MM/dd",
        "xh-ZA": "yyyy/MM/dd",
        "tn-ZA": "yyyy/MM/dd",
        "hsb-DE": "d. M. yyyy",
        "bs-Cyrl-BA": "d.M.yyyy",
        "tg-Cyrl-TJ": "dd.MM.yy",
        "sr-Latn-BA": "d.M.yyyy",
        "smj-NO": "dd.MM.yyyy",
        "rm-CH": "dd/MM/yyyy",
        "smj-SE": "yyyy-MM-dd",
        "quz-EC": "dd/MM/yyyy",
        "quz-PE": "dd/MM/yyyy",
        "hr-BA": "d.M.yyyy.",
        "sr-Latn-ME": "d.M.yyyy",
        "sma-SE": "yyyy-MM-dd",
        "en-SG": "d/M/yyyy",
        "ug-CN": "yyyy-M-d",
        "sr-Cyrl-BA": "d.M.yyyy",
        "es-US": "M/d/yyyy"
    };

    var LANG = window.navigator.userLanguage || window.navigator.language;

    var LOCALE_DATE_FORMAT = LOCALE_DATE_FORMATS[LANG] || 'dd/MM/yyyy';

    NRS.formatVolume = function (volume) {
        var sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        if (volume == 0) return '0 B';
        var i = parseInt(Math.floor(Math.log(volume) / Math.log(1024)));

        volume = Math.round(volume / Math.pow(1024, i));
        var size = sizes[i];

        var digits = [], formattedVolume = "";
        do {
            digits[digits.length] = volume % 10;
            volume = Math.floor(volume / 10);
        } while (volume > 0);
        for (i = 0; i < digits.length; i++) {
            if (i > 0 && i % 3 == 0) {
                formattedVolume = "'" + formattedVolume;
            }
            formattedVolume = digits[i] + formattedVolume;
        }
        return formattedVolume + " " + size;
    };

    NRS.formatWeight = function (weight) {
        var digits = [],
            formattedWeight = "",
            i;
        do {
            digits[digits.length] = weight % 10;
            weight = Math.floor(weight / 10);
        } while (weight > 0);
        for (i = 0; i < digits.length; i++) {
            if (i > 0 && i % 3 == 0) {
                formattedWeight = "'" + formattedWeight;
            }
            formattedWeight = digits[i] + formattedWeight;
        }
        return formattedWeight.escapeHTML();
    };

    NRS.formatOrderPricePerWholeQNT = function (price, decimals) {
        price = NRS.calculateOrderPricePerWholeQNT(price, decimals, true);

        return NRS.format(price);
    };

    NRS.calculateOrderPricePerWholeQNT = function (price, decimals, returnAsObject) {
        if (typeof price != "object") {
            price = new BigInteger(String(price));
        }

        return NRS.convertToNXT(price.multiply(new BigInteger("" + Math.pow(10, decimals))), returnAsObject);
    };

    NRS.calculatePricePerWholeQNT = function (price, decimals) {
        price = String(price);

        if (decimals) {
            var toRemove = price.slice(-decimals);

            if (!/^[0]+$/.test(toRemove)) {
                //return new Big(price).div(new Big(Math.pow(10, decimals))).round(8, 0);
                throw $.t("error_invalid_input");
            } else {
                return price.slice(0, -decimals);
            }
        } else {
            return price;
        }
    };

    NRS.calculateOrderTotalNQT = function (quantityQNT, priceNQT) {
        if (typeof quantityQNT != "object") {
            quantityQNT = new BigInteger(String(quantityQNT));
        }

        if (typeof priceNQT != "object") {
            priceNQT = new BigInteger(String(priceNQT));
        }

        var orderTotal = quantityQNT.multiply(priceNQT);

        return orderTotal.toString();
    };

    NRS.calculateOrderTotal = function (quantityQNT, priceNQT) {
        if (typeof quantityQNT != "object") {
            quantityQNT = new BigInteger(String(quantityQNT));
        }

        if (typeof priceNQT != "object") {
            priceNQT = new BigInteger(String(priceNQT));
        }

        return NRS.convertToNXT(quantityQNT.multiply(priceNQT));
    };

    NRS.calculatePercentage = function (a, b, rounding_mode) {
        if (rounding_mode != undefined) { // Rounding mode from Big.js
            Big.RM = rounding_mode;
        }
        a = new Big(String(a));
        b = new Big(String(b));

        var result = a.div(b).times(new Big("100")).toFixed(2);
        Big.RM = 1;

        return result.toString();
    };

    NRS.convertToNXT = function (amount, returnAsObject) {
        var negative = "";
        var afterComma = "";

        if (typeof amount != "object") {
            amount = new BigInteger(String(amount));
        }

        var fractionalPart = amount.mod(new BigInteger("100000000")).toString(); //.replace(/0+$/, ""); //todo: check if equal to zero first

        amount = amount.divide(new BigInteger("100000000"));

        if (amount.compareTo(BigInteger.ZERO) < 0) {
            amount = amount.abs();
            negative = "-";
        }

        if (fractionalPart && fractionalPart != "0") {
            afterComma = ".";

            for (var i = fractionalPart.length; i < 8; i++) {
                afterComma += "0";
            }

            afterComma += fractionalPart.replace(/0+$/, "");
        }

        amount = amount.toString();

        if (returnAsObject) {
            return {
                "negative": negative,
                "amount": amount,
                "afterComma": afterComma
            };
        } else {
            return negative + amount + afterComma;
        }
    };

    NRS.amountToPrecision = function (amount, decimals) {
        amount = String(amount);

        var parts = amount.split(".");

        //no fractional part
        if (parts.length == 1) {
            return parts[0];
        } else if (parts.length == 2) {
            var fraction = parts[1];
            fraction = fraction.replace(/0+$/, "");

            if (fraction.length > decimals) {
                fraction = fraction.substring(0, decimals);
            }

            return parts[0] + "." + fraction;
        } else {
            throw $.t("error_invalid_input");
        }
    };

    NRS.convertToNQT = function (currency) {
        currency = String(currency);

        var parts = currency.split(".");

        var amount = parts[0];

        //no fractional part
        var fraction;
        if (parts.length == 1) {
            fraction = "00000000";
        } else if (parts.length == 2) {
            if (parts[1].length <= 8) {
                fraction = parts[1];
            } else {
                fraction = parts[1].substring(0, 8);
            }
        } else {
            throw $.t("error_invalid_input");
        }

        for (var i = fraction.length; i < 8; i++) {
            fraction += "0";
        }

        var result = amount + "" + fraction;

        //in case there's a comma or something else in there.. at this point there should only be numbers
        if (!/^\d+$/.test(result)) {
            throw $.t("error_invalid_input");
        }

        //remove leading zeroes
        result = result.replace(/^0+/, "");

        if (result === "") {
            result = "0";
        }

        return result;
    };

    NRS.convertToQNTf = function (quantity, decimals, returnAsObject) {
        quantity = String(quantity);

        if (quantity.length < decimals) {
            for (var i = quantity.length; i < decimals; i++) {
                quantity = "0" + quantity;
            }
        }

        var afterComma = "";

        if (decimals) {
            afterComma = "." + quantity.substring(quantity.length - decimals);
            quantity = quantity.substring(0, quantity.length - decimals);

            if (!quantity) {
                quantity = "0";
            }

            afterComma = afterComma.replace(/0+$/, "");

            if (afterComma == ".") {
                afterComma = "";
            }
        }

        if (returnAsObject) {
            return {
                "amount": quantity,
                "afterComma": afterComma
            };
        } else {
            return quantity + afterComma;
        }
    };

    NRS.convertToQNT = function (quantity, decimals) {
        quantity = String(quantity);

        var parts = quantity.split(".");

        var qnt = parts[0];

        //no fractional part
        var i;
        if (parts.length == 1) {
            if (decimals) {
                for (i = 0; i < decimals; i++) {
                    qnt += "0";
                }
            }
        } else if (parts.length == 2) {
            var fraction = parts[1];
            if (fraction.length > decimals) {
                throw $.t("error_fraction_decimals", {
                    "decimals": decimals
                });
            } else if (fraction.length < decimals) {
                for (i = fraction.length; i < decimals; i++) {
                    fraction += "0";
                }
            }
            qnt += fraction;
        } else {
            throw $.t("error_invalid_input");
        }

        //in case there's a comma or something else in there.. at this point there should only be numbers
        if (!/^\d+$/.test(qnt)) {
            throw $.t("error_invalid_input_numbers");
        }
        try {
            if (parseInt(qnt) === 0) {
                return "0";
            }
        } catch (e) {
        }

        //remove leading zeroes
        return qnt.replace(/^0+/, "");
    };

    NRS.format = function (params, no_escaping) {
        var amount;
        if (typeof params != "object") {
            amount = String(params);
            var negative = amount.charAt(0) == "-" ? "-" : "";
            if (negative) {
                amount = amount.substring(1);
            }
            params = {
                "amount": amount,
                "negative": negative,
                "afterComma": ""
            };
        }

        amount = String(params.amount);

        var digits = amount.split("").reverse();
        var formattedAmount = "";

        for (var i = 0; i < digits.length; i++) {
            if (i > 0 && i % 3 == 0) {
                formattedAmount = "'" + formattedAmount;
            }
            formattedAmount = digits[i] + formattedAmount;
        }

        var output = (params.negative ? params.negative : "") + formattedAmount + params.afterComma;

        if (!no_escaping) {
            output = output.escapeHTML();
        }

        return output;
    };

    NRS.formatQuantity = function (quantity, decimals, no_escaping) {
        return NRS.format(NRS.convertToQNTf(quantity, decimals, true), no_escaping);
    };

    NRS.formatAmount = function (amount, round, no_escaping) {
        if (typeof amount == "undefined") {
            return "0";
        } else if (typeof amount == "string") {
            amount = new BigInteger(amount);
        }

        var negative = "";
        var afterComma = "";

        if (typeof amount == "object") {
            var params = NRS.convertToNXT(amount, true);

            negative = params.negative;
            amount = params.amount;
            afterComma = params.afterComma;
        } else {
            //rounding only applies to non-nqt
            if (round) {
                amount = (Math.round(amount * 100) / 100);
            }

            if (amount < 0) {
                amount = Math.abs(amount);
                negative = "-";
            }

            amount = "" + amount;
            if (amount.indexOf(".") !== -1) {
                afterComma = amount.substr(amount.indexOf("."));
                amount = amount.replace(afterComma, "");
            } else {
                afterComma = "";
            }
        }

        return NRS.format({
            "negative": negative,
            "amount": amount,
            "afterComma": afterComma
        }, no_escaping);
    };

    NRS.fromEpochTime = function (epochTime) {
        if (NRS.constants.EPOCH_BEGINNING == 0) {
            throw "undefined epoch beginning";
        }
        return epochTime * 1000 + NRS.constants.EPOCH_BEGINNING - 500;
    };

    NRS.toEpochTime = function (currentTime) {
        if (currentTime == undefined) {
            currentTime = new Date();
        }
        if (NRS.constants.EPOCH_BEGINNING == 0) {
            throw "undefined epoch beginning";
        }
        return Math.floor((currentTime - NRS.constants.EPOCH_BEGINNING) / 1000);
    };

    NRS.formatTimestamp = function (timestamp, date_only, isAbsoluteTime) {
        var date;
        if (typeof timestamp == "object") {
            date = timestamp;
        } else if (isAbsoluteTime) {
            date = new Date(timestamp);
        } else {
            date = new Date(NRS.fromEpochTime(timestamp));
        }

        if (!isNaN(date) && typeof(date.getFullYear) == 'function') {
            var d = date.getDate();
            var dd = d < 10 ? '0' + d : d;
            var M = date.getMonth() + 1;
            var MM = M < 10 ? '0' + M : M;
            var yyyy = date.getFullYear();
            var yy = String(yyyy).substring(2);

            var res = LOCALE_DATE_FORMAT
                .replace(/dd/g, dd)
                .replace(/d/g, d)
                .replace(/MM/g, MM)
                .replace(/M/g, M)
                .replace(/yyyy/g, yyyy)
                .replace(/yy/g, yy);

            if (!date_only) {
                var hours = date.getHours();
                var originalHours = hours;
                var minutes = date.getMinutes();
                var seconds = date.getSeconds();

                if (NRS.settings["24_hour_format"] == "0") {
                    if (originalHours == 0) {
                        hours += 12;
                    } else if (originalHours >= 13 && originalHours <= 23) {
                        hours -= 12;
                    }
                }
                if (minutes < 10) {
                    minutes = "0" + minutes;
                }
                if (seconds < 10) {
                    seconds = "0" + seconds;
                }
                res += " " + hours + ":" + minutes + ":" + seconds;

                if (NRS.settings["24_hour_format"] == "0") {
                    res += " " + (originalHours >= 12 ? "PM" : "AM");
                }
            }

            return res;
        } else {
            return date.toLocaleString();
        }
    };

    NRS.isPrivateIP = function (ip) {
        if (!/^\d+\.\d+\.\d+\.\d+$/.test(ip)) {
            return false;
        }
        var parts = ip.split('.');
        return parts[0] === '10' || parts[0] == '127' || parts[0] === '172' && (parseInt(parts[1], 10) >= 16 && parseInt(parts[1], 10) <= 31) || parts[0] === '192' && parts[1] === '168';
    };

    NRS.convertToHex16 = function (str) {
        var hex, i;
        var result = "";
        for (i = 0; i < str.length; i++) {
            hex = str.charCodeAt(i).toString(16);
            result += ("000" + hex).slice(-4);
        }

        return result;
    };

    NRS.convertFromHex16 = function (hex) {
        var j;
        var hexes = hex.match(/.{1,4}/g) || [];
        var back = "";
        for (j = 0; j < hexes.length; j++) {
            back += String.fromCharCode(parseInt(hexes[j], 16));
        }

        return back;
    };

    NRS.convertFromHex8 = function (hex) {
        var hexStr = hex.toString(); //force conversion
        var str = '';
        for (var i = 0; i < hexStr.length; i += 2) {
            str += String.fromCharCode(parseInt(hexStr.substr(i, 2), 16));
        }
        return str;
    };

    NRS.convertToHex8 = function (str) {
        var hex = '';
        for (var i = 0; i < str.length; i++) {
            hex += '' + str.charCodeAt(i).toString(16);
        }
        return hex;
    };

    NRS.getFormData = function ($form, unmodified) {
        var serialized = $form.serializeArray();
        var data = {};
        var multiValuedFields = ["phasingWhitelisted"];
        for (var s in serialized) {
            if (!serialized.hasOwnProperty(s)) {
                continue;
            }
            if (multiValuedFields.indexOf(serialized[s]["name"]) > -1) {
                if (serialized[s]['value'] != "") {
                    if (serialized[s]['name'] in data) {
                        var index = data[serialized[s]['name']].length;
                        data[serialized[s]['name']][index] = serialized[s]['value'];
                    } else {
                        data[serialized[s]['name']] = [serialized[s]['value']]; //all data as list (traditional, to allow multiple values)
                    }
                }
            } else {
                data[serialized[s]['name']] = serialized[s]['value'];
            }
        }
        if (!unmodified) {
            delete data.request_type;
            delete data.converted_account_id;
            delete data.merchant_info;
        }
        return data;
    };

    NRS.convertNumericToRSAccountFormat = function (account) {
        if (/^NHZ\-/i.test(account)) {
            return String(account).escapeHTML();
        } else {
            var address = new NxtAddress();

            if (address.set(account)) {
                return address.toString().escapeHTML();
            } else {
                return "";
            }
        }
    };

    NRS.getAccountLink = function (object, accountKey, accountRef, title) {
        var accountRS;
        if (typeof object[accountKey + "RS"] != "undefined") {
            accountRS = object[accountKey + "RS"];
        } else if (typeof object[accountKey] != "undefined") {
            accountRS = NRS.convertNumericToRSAccountFormat(object[accountKey]);
        } else {
            return '/';
        }
        var accountTitle;
        if (accountRef && accountRS == accountRef) {
            accountTitle = $.t(title);
        } else {
            accountTitle = NRS.getAccountTitle(object, accountKey);
        }
        return "<a href='#' data-user='" + String(accountRS).escapeHTML() +
            "' class='show_account_modal_action user-info'>" + accountTitle + "</a>";
    };

    NRS.getAccountTitle = function (object, acc) {
        var type = typeof object;

        var formattedAcc = "";

        if (type == "string" || type == "number") {
            formattedAcc = object;
            object = null;
        } else {
            if (object == null || typeof object[acc + "RS"] == "undefined") {
                return "/";
            } else {
                formattedAcc = String(object[acc + "RS"]).escapeHTML();
            }
        }

        if (formattedAcc == NRS.account || formattedAcc == NRS.accountRS) {
            return $.t("you");
        } else if (formattedAcc in NRS.contacts) {
            return NRS.contacts[formattedAcc].name.escapeHTML();
        } else {
            return String(formattedAcc).escapeHTML();
        }
    };

    NRS.getAccountFormatted = function (object, acc) {
        var type = typeof object;

        if (type == "string" || type == "number") {
            return String(object).escapeHTML();
        } else {
            if (typeof object[acc + "RS"] == "undefined") {
                return "";
            } else {
                return String(object[acc + "RS"]).escapeHTML();
            }
        }
    };

    NRS.setupClipboardFunctionality = function () {
        var elements = "#asset_id_dropdown .dropdown-menu a, #account_id_dropdown .dropdown-menu a";

        if (NRS.isLocalHost) {
            $("#account_id_dropdown li.remote_only, #asset_info_dropdown li.remote_only").remove();
        }

        var $el = $(elements);

        if (NRS.inApp) {
            $el.on("click", function () {
                parent.postMessage({
                    "type": "copy",
                    "text": NRS.getClipboardText($(this).data("type"))
                }, "*");

                $.growl($.t("success_clipboard_copy"), {
                    "type": "success"
                });
            });
        } else {
            var clipboard = new ZeroClipboard($el, {
                moviePath: "js/3rdparty/zeroclipboard.swf"
            });

            clipboard.on("dataRequested", function (client) {
                client.setText(NRS.getClipboardText($(this).data("type")));
            });

            if ($el.hasClass("dropdown-toggle")) {
                $el.removeClass("dropdown-toggle").data("toggle", "");
                $el.parent().remove(".dropdown-menu");
            }

            clipboard.on("complete", function () {
                $.growl($.t("success_clipboard_copy"), {
                    "type": "success"
                });
            });

            if (!NRS.getCookie("clipboard_warning_shown")) {
                clipboard.on("noflash", function () {
                    $("#account_id_dropdown .dropdown-menu, #asset_id_dropdown .dropdown-menu").remove();
                    $("#account_id_dropdown, #asset_id").data("toggle", "");
                    $.growl($.t("error_clipboard_copy_noflash"), {
                        "type": "danger"
                    });
                });
                NRS.setCookie("clipboard_warning_shown", "1", 30);
            }

            clipboard.on("wrongflash", function () {
                $("#account_id_dropdown .dropdown-menu, #asset_id_dropdown .dropdown-menu").remove();
                $("#account_id_dropdown, #asset_id").data("toggle", "");
                $.growl($.t("error_clipboard_copy_wrongflash"));
            });
        }
    };

    NRS.getClipboardText = function (type) {
        var assetId = $("#asset_id");
        switch (type) {
            case "account_rs":
                return NRS.accountRS;
                break;
            case "message_link":
                return document.URL.replace(/#.*$/, "") + "#message:" + encodeURIComponent(NRS.accountRS);
                break;
            case "send_link":
                return document.URL.replace(/#.*$/, "") + "#send:" + encodeURIComponent(NRS.accountRS);
                break;
            case "asset_id":
                return assetId.text();
                break;
            case "asset_link":
                return document.URL.replace(/#.*/, "") + "#asset:" + assetId.text();
                break;
            default:
                return "";
                break;
        }
    };

    NRS.dataLoaded = function (data, noPageLoad) {
        var $el = $("#" + NRS.currentPage + "_contents");

        if ($el.length) {
            $el.empty().append(data);
        } else {
            $el = $("#" + NRS.currentPage + "_table");
            $el.find("tbody").empty().append(data);
        }

        NRS.dataLoadFinished($el);

        if (!noPageLoad) {
            NRS.pageLoaded();
        }
    };

    NRS.dataLoadFinished = function ($el, fadeIn) {
        var $parent = $el.parent();

        if (fadeIn) {
            $parent.hide();
        }

        $parent.removeClass("data-loading");

        var extra = $parent.data("extra");

        var empty = false;

        if ($el.is("table")) {
            if ($el.find("tbody tr").length > 0) {
                $parent.removeClass("data-empty");
                if ($parent.data("no-padding")) {
                    $parent.parent().addClass("no-padding");
                }

                if (extra) {
                    $(extra).show();
                }
            } else {
                empty = true;
            }
        } else {
            if ($.trim($el.html()).length == 0) {
                empty = true;
            }
        }

        if (empty) {
            $parent.addClass("data-empty");
            if ($parent.data("no-padding")) {
                $parent.parent().removeClass("no-padding");
            }
            if (extra) {
                $(extra).hide();
            }
        } else {
            $parent.removeClass("data-empty");
        }

        if (fadeIn) {
            $parent.stop(true, true).fadeIn(400, function () {
                $parent.show();
            });
        }
    };

    NRS.createInfoTable = function (data, fixed) {
        var rows = "";
        for (var key in data) {
            if (!data.hasOwnProperty(key)) {
                continue;
            }
            var value = data[key];

            var match = key.match(/(.*)(NQT|QNT|RS)$/);
            var type = "";

            if (match && match[1]) {
                key = match[1];
                type = match[2];
            }

            key = key.replace(/\s+/g, "").replace(/([A-Z])/g, function ($1) {
                return "_" + $1.toLowerCase();
            });

            //no need to mess with input, already done if Formatted is at end of key
            if (/_formatted_html$/i.test(key)) {
                key = key.replace("_formatted_html", "");
                value = String(value);
            } else if (/_formatted$/i.test(key)) {
                key = key.replace("_formatted", "");
                value = String(value).escapeHTML();
            } else if ((key == "quantity" || key == "units" || key == "initial_buy_supply" || key == "initial_sell_supply" ||
                key == "total_buy_limit" || key == "total_sell_limit" || key == "units_exchanged" || key == "total_exchanged" ||
                key == "initial_units" || key == "reserve_units" || key == "max_units" || key == "quantity_traded") && $.isArray(value)) {
                if ($.isArray(value)) {
                    value = NRS.formatQuantity(value[0], value[1]);
                } else {
                    value = NRS.formatQuantity(value, 0);
                }
            } else if (key == "price" || key == "total" || key == "amount" || key == "fee" || key == "refund" || key == "discount") {
                value = NRS.formatAmount(new BigInteger(String(value))) + " HZ";
            } else if (key == "sender" || key == "recipient" || key == "account" || key == "seller" || key == "buyer" || key == "lessee") {
                value = "<a href='#' data-user='" + String(value).escapeHTML() + "' class='show_account_modal_action'>" + NRS.getAccountTitle(value) + "</a>";
            } else if (key == "request_processing_time") { /* Skip from displaying request processing time */
                continue;
            } else {
                value = String(value).escapeHTML().nl2br();
            }

            rows += "<tr><td style='font-weight:bold" + (fixed ? ";width:150px" : "") + "'>" + $.t(key).escapeHTML() + (type ? " " + type.escapeHTML() : "") + ":</td><td style='width:90%;word-break:break-all'>" + value + "</td></tr>";
        }

        return rows;
    };

    NRS.getSelectedText = function () {
        var t = "";
        if (window.getSelection) {
            t = window.getSelection().toString();
        } else if (document.getSelection) {
            t = document.getSelection().toString();
        } else if (document.selection) {
            t = document.selection.createRange().text;
        }
        return t;
    };

    NRS.formatStyledAmount = function (strAmount, round) {
        var amount = NRS.formatAmount(strAmount, round).split(".");
        if (amount.length == 2) {
            return amount[0] + "<span style='font-size:12px'>." + amount[1] + "</span>";
        } else {
            return amount[0];
        }
    };

    NRS.getUnconfirmedTransactionsFromCache = function (type, subtype, fields, single) {
        if (!NRS.unconfirmedTransactions.length) {
            return false;
        }

        if (typeof type == "number") {
            type = [type];
        }

        if (typeof subtype == "number") {
            subtype = [subtype];
        }

        var unconfirmedTransactions = [];

        for (var i = 0; i < NRS.unconfirmedTransactions.length; i++) {
            var unconfirmedTransaction = NRS.unconfirmedTransactions[i];

            if (type.indexOf(unconfirmedTransaction.type) == -1 || (subtype.length > 0 && subtype.indexOf(unconfirmedTransaction.subtype) == -1)) {
                continue;
            }

            if (fields) {
                for (var key in fields) {
                    if (!fields.hasOwnProperty(key)) {
                        continue;
                    }
                    if (unconfirmedTransaction[key] == fields[key]) {
                        if (single) {
                            return NRS.completeUnconfirmedTransactionDetails(unconfirmedTransaction);
                        } else {
                            unconfirmedTransactions.push(unconfirmedTransaction);
                        }
                    }
                }
            } else {
                if (single) {
                    return NRS.completeUnconfirmedTransactionDetails(unconfirmedTransaction);
                } else {
                    unconfirmedTransactions.push(unconfirmedTransaction);
                }
            }
        }

        if (single || unconfirmedTransactions.length == 0) {
            return false;
        } else {
            $.each(unconfirmedTransactions, function (key, val) {
                unconfirmedTransactions[key] = NRS.completeUnconfirmedTransactionDetails(val);
            });

            return unconfirmedTransactions;
        }
    };

    NRS.completeUnconfirmedTransactionDetails = function (unconfirmedTransaction) {
        if (unconfirmedTransaction.type == 3 && unconfirmedTransaction.subtype == 4 && !unconfirmedTransaction.name) {
            NRS.sendRequest("getDGSGood", {
                "goods": unconfirmedTransaction.attachment.goods
            }, function (response) {
                unconfirmedTransaction.name = response.name;
                unconfirmedTransaction.buyer = unconfirmedTransaction.sender;
                unconfirmedTransaction.buyerRS = unconfirmedTransaction.senderRS;
                unconfirmedTransaction.seller = response.seller;
                unconfirmedTransaction.sellerRS = response.sellerRS;
            }, false);
        } else if (unconfirmedTransaction.type == 3 && unconfirmedTransaction.subtype == 0) {
            unconfirmedTransaction.goods = unconfirmedTransaction.transaction;
        }

        return unconfirmedTransaction;
    };

    NRS.hasTransactionUpdates = function (transactions) {
        return ((transactions && transactions.length) || NRS.unconfirmedTransactionsChange);
    };

    NRS.showMore = function ($el) {
        if (!$el) {
            $el = $("#" + NRS.currentPage + "_contents");
            if (!$el.length) {
                $el = $("#" + NRS.currentPage + "_table");
            }
        }
        var adjustheight = 40;
        var moreText = "Show more...";
        var lessText = "Show less...";

        $el.find(".showmore > .moreblock").each(function () {
            if ($(this).height() > adjustheight) {
                $(this).css("height", adjustheight).css("overflow", "hidden");
                $(this).parent(".showmore").append(' <a href="#" class="adjust"></a>');
                $(this).parent(".showmore").find("a.adjust").text(moreText).click(function (e) {
                    e.preventDefault();

                    if ($(this).text() == moreText) {
                        $(this).parents("div:first").find(".moreblock").css('height', 'auto').css('overflow', 'visible');
                        $(this).parents("div:first").find("p.continued").css('display', 'none');
                        $(this).text(lessText);
                    } else {
                        $(this).parents("div:first").find(".moreblock").css('height', adjustheight).css('overflow', 'hidden');
                        $(this).parents("div:first").find("p.continued").css('display', 'block');
                        $(this).text(moreText);
                    }
                });
            }
        });
    };

    NRS.showFullDescription = function ($el) {
        $el.addClass("open").removeClass("closed");
        $el.find(".description_toggle").text("Less...");
    };

    NRS.showPartialDescription = function ($el) {
        if ($el.hasClass("open") || $el.height() > 40) {
            $el.addClass("closed").removeClass("open");
            $el.find(".description_toggle").text("More...");
        } else {
            $el.find(".description_toggle").text("");
        }
    };

    $("body").on(".description_toggle", "click", function (e) {
        e.preventDefault();

        if ($(this).closest(".description").hasClass("open")) {
            NRS.showPartialDescription();
        } else {
            NRS.showFullDescription();
        }
    });

    $("#offcanvas_toggle").on("click", function (e) {
        e.preventDefault();

        //If window is small enough, enable sidebar push menu
        var leftSide = $(".left-side");
        var rightSide = $(".right-side");
        if ($(window).width() <= 992) {
            var rowOffCanvas = $('.row-offcanvas');
            rowOffCanvas.toggleClass('active');
            leftSide.removeClass("collapse-left");
            rightSide.removeClass("strech");
            rowOffCanvas.toggleClass("relative");
        } else {
            //Else, enable content streching
            leftSide.toggleClass("collapse-left");
            rightSide.toggleClass("strech");
        }

        leftSide.one($.support.transition.end,
            function () {
                $(".content.content-stretch:visible").width($(".page:visible").width());
            });
    });

    $.fn.tree = function () {
        return this.each(function () {
            var btn = $(this).children("a").first();
            var menu = $(this).children(".treeview-menu").first();
            var isActive = $(this).hasClass('active');

            //initialize already active menus
            if (isActive) {
                menu.show();
                btn.children(".fa-angle-right").first().removeClass("fa-angle-right").addClass("fa-angle-down");
            }
            //Slide open or close the menu on link click
            btn.click(function (e) {
                e.preventDefault();
                if (isActive) {
                    //Slide up to close menu
                    menu.slideUp();
                    isActive = false;
                    btn.children(".fa-angle-down").first().removeClass("fa-angle-down").addClass("fa-angle-right");
                    btn.parent("li").removeClass("active");
                } else {
                    //Slide down to open menu
                    menu.slideDown();
                    isActive = true;
                    btn.children(".fa-angle-right").first().removeClass("fa-angle-right").addClass("fa-angle-down");
                    btn.parent("li").addClass("active");
                }
            });
        });
    };

    NRS.setCookie = function (name, value, days) {
        var expires;
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        } else {
            expires = "";
        }
        //noinspection JSDeprecatedSymbols
        document.cookie = escape(name) + "=" + escape(value) + expires + "; path=/";
    };

    NRS.getCookie = function (name) {
        //noinspection JSDeprecatedSymbols
        var nameEQ = escape(name) + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1, c.length);
            }
            if (c.indexOf(nameEQ) === 0) {
                //noinspection JSDeprecatedSymbols
                return unescape(c.substring(nameEQ.length, c.length));
            }
        }
        return null;
    };

    NRS.deleteCookie = function (name) {
        NRS.setCookie(name, "", -1);
    };

    NRS.translateServerError = function (response) {
        var match;
        if (!response.errorDescription) {
            if (response.errorMessage) {
                response.errorDescription = response.errorMessage;
            } else if (response.error) {
                if (typeof response.error == "string") {
                    response.errorDescription = response.error;
                    response.errorCode = -1;
                } else {
                    return $.t("error_unknown");
                }
            } else {
                return $.t("error_unknown");
            }
        }

        switch (response.errorCode) {
            case -1:
                switch (response.errorDescription) {
                    case "Invalid ordinary payment":
                        return $.t("error_invalid_ordinary_payment");
                        break;
                    case "Missing alias name":
                        return $.t("error_missing_alias_name");
                        break;
                    case "Transferring aliases to Genesis account not allowed":
                        return $.t("error_alias_transfer_genesis");
                        break;
                    case "Ask order already filled":
                        return $.t("error_ask_order_filled");
                        break;
                    case "Bid order already filled":
                        return $.t("error_bid_order_filled");
                        break;
                    case "Only text encrypted messages allowed":
                        return $.t("error_encrypted_text_messages_only");
                        break;
                    case "Missing feedback message":
                        return $.t("error_missing_feedback_message");
                        break;
                    case "Only text public messages allowed":
                        return $.t("error_public_text_messages_only");
                        break;
                    case "Purchase does not exist yet or not yet delivered":
                        return $.t("error_purchase_delivery");
                        break;
                    case "Purchase does not exist or is not delivered or is already refunded":
                        return $.t("error_purchase_refund");
                        break;
                    case "Recipient account does not have a public key, must attach a public key announcement":
                        return $.t("error_recipient_no_public_key_announcement");
                        break;
                    case "Transaction is not signed yet":
                        return $.t("error_transaction_not_signed");
                        break;
                    case "Transaction already signed":
                        return $.t("error_transaction_already_signed");
                        break;
                    case "PublicKeyAnnouncement cannot be attached to transactions with no recipient":
                        return $.t("error_public_key_announcement_no_recipient");
                        break;
                    case "Announced public key does not match recipient accountId":
                        return $.t("error_public_key_different_account_id");
                        break;
                    case "Public key for this account has already been announced":
                        return $.t("error_public_key_already_announced");
                        break;
                    default:
                        if (response.errorDescription.indexOf("Alias already owned by another account") != -1) {
                            return $.t("error_alias_owned_by_other_account");
                        } else if (response.errorDescription.indexOf("Invalid alias sell price") != -1) {
                            return $.t("error_invalid_alias_sell_price");
                        } else if (response.errorDescription.indexOf("Alias hasn't been registered yet") != -1) {
                            return $.t("error_alias_not_yet_registered");
                        } else if (response.errorDescription.indexOf("Alias doesn't belong to sender") != -1) {
                            return $.t("error_alias_not_from_sender");
                        } else if (response.errorDescription.indexOf("Alias is owned by account other than recipient") != -1) {
                            return $.t("error_alias_not_from_recipient");
                        } else if (response.errorDescription.indexOf("Alias is not for sale") != -1) {
                            return $.t("error_alias_not_for_sale");
                        } else if (response.errorDescription.indexOf("Invalid alias name") != -1) {
                            return $.t("error_invalid_alias_name");
                        } else if (response.errorDescription.indexOf("Invalid URI length") != -1) {
                            return $.t("error_invalid_alias_uri_length");
                        } else if (response.errorDescription.indexOf("Invalid ask order") != -1) {
                            return $.t("error_invalid_ask_order");
                        } else if (response.errorDescription.indexOf("Invalid bid order") != -1) {
                            return $.t("error_invalid_bid_order");
                        } else if (response.errorDescription.indexOf("Goods price or quantity changed") != -1) {
                            return $.t("error_dgs_price_quantity_changed");
                        } else if (response.errorDescription.indexOf("Invalid digital goods price change") != -1) {
                            return $.t("error_invalid_dgs_price_change");
                        } else if (response.errorDescription.indexOf("Invalid digital goods refund") != -1) {
                            return $.t("error_invalid_dgs_refund");
                        } else if (response.errorDescription.indexOf("Purchase does not exist yet, or already delivered") != -1) {
                            return $.t("error_purchase_not_exist_or_delivered");
                        } else if (response.errorDescription.match(/Goods.*not yet listed or already delisted/)) {
                            return $.t("error_dgs_not_listed");
                        } else if (response.errorDescription.match(/Delivery deadline has already expired/)) {
                            return $.t("error_dgs_delivery_deadline_expired");
                        } else if (response.errorDescription.match(/Invalid effective balance leasing:.*recipient account.*not found or no public key published/)) {
                            return $.t("error_invalid_balance_leasing_no_public_key");
                        } else if (response.errorDescription.indexOf("Invalid effective balance leasing") != -1) {
                            return $.t("error_invalid_balance_leasing");
                        } else if (response.errorDescription.match(/Wrong buyer for.*expected:.*/)) {
                            return $.t("error_wrong_buyer_for_alias");
                        } else {
                            return response.errorDescription;
                        }

                        break;
                }
            case 1:
                switch (response.errorDescription) {
                    case "This request is only accepted using POST!":
                        return $.t("error_post_only");
                        break;
                    case "Incorrect request":
                        return $.t("error_incorrect_request");
                        break;
                    default:
                        return response.errorDescription;
                        break;
                }
                break;
            case 2:
                return response.errorDescription;
                break;
            case 3:
                match = response.errorDescription.match(/"([^"]+)" not specified/i);
                if (match && match[1]) {
                    return $.t("error_not_specified", {
                        "name": NRS.getTranslatedFieldName(match[1]).toLowerCase()
                    }).capitalize();
                }

                match = response.errorDescription.match(/At least one of \[(.*)\] must be specified/i);
                if (match && match[1]) {
                    var fieldNames = match[1].split(",");
                    var translatedFieldNames = [];
                    for (var i=0; i<fieldNames.length; i++) {
                        translatedFieldNames.push(NRS.getTranslatedFieldName(fieldNames[i]));
                    }

                    var translatedFieldNamesJoined = translatedFieldNames.join(", ");

                    return $.t("error_not_specified", {
                        "names": translatedFieldNamesJoined,
                        "count": translatedFieldNames.length
                    }).capitalize();
                } else {
                    return response.errorDescription;
                }
                break;
            case 4:
                match = response.errorDescription.match(/Incorrect "(.*)"(.*)/i);
                if (match && match[1] && match[2]) {
                    return $.t("error_incorrect_name", {
                        "name": NRS.getTranslatedFieldName(match[1]).toLowerCase(),
                        "reason": match[2]
                    }).capitalize();
                } else {
                    return response.errorDescription;
                }
                break;
            case 5:
                match = response.errorDescription.match(/Unknown (.*)/i);
                if (match && match[1]) {
                    return $.t("error_unknown_name", {
                        "name": NRS.getTranslatedFieldName(match[1]).toLowerCase()
                    }).capitalize();
                }

                if (response.errorDescription == "Account is not forging") {
                    return $.t("error_not_forging");
                } else {
                    return response.errorDescription;
                }
                break;
            case 6:
                switch (response.errorDescription) {
                    case "Not enough assets":
                        return $.t("error_not_enough_assets");
                        break;
                    case "Not enough funds":
                        return $.t("error_not_enough_funds");
                        break;
                    default:
                        return response.errorDescription;
                        break;
                }
                break;
            case 7:
                if (response.errorDescription == "Not allowed") {
                    return $.t("error_not_allowed");
                } else {
                    return response.errorDescription;
                }
                break;
            case 8:
                switch (response.errorDescription) {
                    case "Goods have not been delivered yet":
                        return $.t("error_goods_not_delivered_yet");
                        break;
                    case "Feedback already sent":
                        return $.t("error_feedback_already_sent");
                        break;
                    case "Refund already sent":
                        return $.t("error_refund_already_sent");
                        break;
                    case "Purchase already delivered":
                        return $.t("error_purchase_already_delivered");
                        break;
                    case "Decryption failed":
                        return $.t("error_decryption_failed");
                        break;
                    case "No attached message found":
                        return $.t("error_no_attached_message");
                    case "recipient account does not have public key":
                        return $.t("error_recipient_no_public_key");
                    default:
                        return response.errorDescription;
                        break;
                }
                break;
            case 9:
                if (response.errorDescription == "Feature not available") {
                    return $.t("error_feature_not_available");
                } else {
                    return response.errorDescription;
                }
                break;
            default:
                return response.errorDescription;
                break;
        }
    };

    NRS.getTranslatedFieldName = function (name) {
        var nameKey = String(name).replace(/NQT|QNT|RS$/, "").replace(/\s+/g, "").replace(/([A-Z])/g, function ($1) {
            return "_" + $1.toLowerCase();
        });

        if (nameKey.charAt(0) == "_") {
            nameKey = nameKey.substring(1);
        }

        if ($.i18n.exists(nameKey)) {
            return $.t(nameKey).escapeHTML();
        } else {
            return nameKey.replace(/_/g, " ").escapeHTML();
        }
    };

    NRS.isControlKey = function (charCode) {
        return !(charCode >= 32 || charCode == 10 || charCode == 13);
    };

    NRS.validateDecimals = function (maxFractionLength, charCode, val, e) {
        if (maxFractionLength) {
            //allow 1 single period character
            if (charCode == 110 || charCode == 190) {
                if (val.indexOf(".") != -1) {
                    e.preventDefault();
                    return false;
                } else {
                    return true;
                }
            }
        } else {
            //do not allow period
            if (charCode == 110 || charCode == 190 || charCode == 188) {
                $.growl($.t("error_fractions"), {
                    "type": "danger"
                });
                e.preventDefault();
                return false;
            }
        }
        if (charCode >= 96 && charCode <= 105) {
            // convert numeric keyboard code to normal ascii otherwise String.fromCharCode()
            // returns the wrong value
            charCode = charCode + 48 - 96;
        }
        var input = val + String.fromCharCode(charCode);

        var afterComma = input.match(/\.(\d*)$/);

        //only allow as many as there are decimals allowed..
        if (afterComma && afterComma[1].length > maxFractionLength) {
            var selectedText = NRS.getSelectedText();

            if (selectedText != val) {
                var errorMessage = $.t("error_decimals", {
                    "count": maxFractionLength
                });
                $.growl(errorMessage, {
                    "type": "danger"
                });

                e.preventDefault();
                return false;
            }
        }

        //numeric characters, left/right key, backspace, delete
        if (charCode == 8 || charCode == 37 || charCode == 39 || charCode == 46 || (charCode >= 48 && charCode <= 57 && !isNaN(String.fromCharCode(charCode)))) {
            return true;
        } else {
            //comma
            if (charCode == 188) {
                $.growl($.t("error_comma_not_allowed"), {
                    "type": "danger"
                });
            }
            e.preventDefault();
            return false;
        }
    };

    NRS.getUrlParameter = function (sParam) {
        var sPageURL = window.location.search.substring(1);
        var sURLVariables = sPageURL.split('&');
        for (var i = 0; i < sURLVariables.length; i++) {
            var sParameterName = sURLVariables[i].split('=');
            if (sParameterName[0] == sParam) {
                return sParameterName[1];
            }
        }
        return false;
    };

    // http://stackoverflow.com/questions/12518830/java-string-getbytesutf8-javascript-analog
    NRS.getUtf8Bytes = function (str) {
        //noinspection JSDeprecatedSymbols
        var utf8 = unescape(encodeURIComponent(str));
        var arr = [];
        for (var i = 0; i < utf8.length; i++) {
            arr[i] = utf8.charCodeAt(i);
        }
        return arr;
    };

    NRS.getTransactionStatusIcon = function (phasedEntity) {
        var statusIcon;
        if (phasedEntity.expectedCancellation == true) {
            statusIcon = "<i class='fa fa-ban' title='" + $.t("cancelled") + "'></i>";
        } else if (phasedEntity.phased == true) {
            statusIcon = "<i class='fa fa-gavel' title='" + $.t("phased") + "'></i>";
        } else if (phasedEntity.phased == false) {
            statusIcon = "<i class='fa fa-circle-o' title='" + $.t("unconfirmed") + "'></i>";
        } else {
            statusIcon = "<i class='fa fa-circle' title='" + $.t("confirmed") + "'></i>";
        }
        return statusIcon;
    };

    return NRS;
}(NRS || {}, jQuery));