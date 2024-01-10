/*
 * PasswordMaker - Creates and manages passwords
 * Copyright (C) 2005 Eric H. Jung and LeahScape, Inc.
 * http://passwordmaker.org/
 * grimholtz@yahoo.com
 *
 * Common functions used by md4, md5, ripemd5, sha1, and sha256.
 * Version 2.2 Copyright (C) Jerrad Pierce, Paul Johnston 1999 - 2009.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 *
 * Modified by Eric H. Jung (grimholtz@yahoo.com)
 * Modified by Eric Aguiar (ultimate.evil@gmail.com)
 */

if (typeof PasswordMaker_HashUtils !== "object") {
    var PasswordMaker_HashUtils = {

        /*
         * Convert a raw string to an array of little-endian words
         * Characters >255 have their high-byte silently ignored.
         */
        rstr2binl: function(input) {
            var output = [];
            for (var i = 0; i < input.length * 8; i += 8) {
                output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (i % 32);
            }
            return output;
        },

        /*
         * Convert an array of little-endian words to a string
         */
        binl2rstr: function(input) {
            var output = "";
            for (var i = 0; i < input.length * 32; i += 8) {
                output += String.fromCharCode((input[i >> 5] >> (i % 32)) & 0xFF);
            }
            return output;
        },

        /*
         * Convert a raw string to an arbitrary string encoding
         */
        rstr2any: function(input, encoding) {
            var divisor = encoding.length,
                remainders = [],
                i = 0;
            /* Convert to an array of 16-bit big-endian values, forming the dividend */
            var dividend = [];
            for (i = 0; i < (input.length / 2); i++) {
                dividend[i] = (input.charCodeAt(i * 2) << 8) | input.charCodeAt(i * 2 + 1);
            }
            while (dividend.length > 0) {
                var quotient = [];
                var x = 0;
                for (i = 0; i < dividend.length; i++) {
                    x = (x << 16) + dividend[i];
                    var q = Math.floor(x / divisor);
                    x -= q * divisor;
                    if (quotient.length > 0 || q > 0) {
                        quotient.push(q);
                    }
                }
                remainders.push(x);
                dividend = quotient;
            }
            var output = "";
            while (remainders.length > 0) {
                output += encoding.charAt(remainders.pop());
            }
            return output;
        },

        ///===== big endian =====///
        /*
         * Convert a raw string to an array of big-endian words
         * Characters >255 have their high-byte silently ignored.
         */
        rstr2binb: function(input) {
            var output = [];
            for (var i = 0; i < input.length * 8; i += 8) {
                output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (24 - i % 32);
            }
            return output;
        },

        /*
         * Convert an array of big-endian words to a string
         */
        binb2rstr: function(input) {
            var output = "";
            for (var i = 0; i < input.length * 32; i += 8) {
                output += String.fromCharCode((input[i >> 5] >> (24 - i % 32)) & 0xFF);
            }
            return output;
        },

        /*
         * Bitwise rotate a 32-bit number to the left.
         */
        bit_rol: function(num, cnt) {
            return (num << cnt) | (num >>> (32 - cnt));
        }
    };
}
