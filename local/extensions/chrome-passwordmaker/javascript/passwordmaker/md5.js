/*
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message Digest Algorithm, as defined in RFC 1321.
 * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 *
 * Modified by Eric H. Jung (grimholtz@yahoo.com)
 * Modified by Eric Aguiar (ultimate.evil@gmail.com)
 */

if (typeof PasswordMaker_MD5 !== "object") {
    var PasswordMaker_MD5 = {
        any_md5: function(s, e) {
            return PasswordMaker_HashUtils.rstr2any(this.rstr_md5(s), e);
        },
        any_hmac_md5: function(k, d, e) {
            return PasswordMaker_HashUtils.rstr2any(this.rstr_hmac_md5(k, d), e);
        },

        /*
         * Calculate the MD5 of a raw string
         */
        rstr_md5: function(s) {
            return PasswordMaker_HashUtils.binl2rstr(this.binl_md5(PasswordMaker_HashUtils.rstr2binl(s), s.length * 8));
        },

        /*
         * Calculate the HMAC-MD5 of a key and some data (raw strings)
         */
        rstr_hmac_md5: function(key, data) {
            var ipad = Array(16),
                opad = Array(16),
                bkey = PasswordMaker_HashUtils.rstr2binl(key);
            if (bkey.length > 16) {
                bkey = this.binl_md5(bkey, key.length * 8);
            }
            for (var i = 0; i < 16; i++) {
                ipad[i] = bkey[i] ^ 0x36363636;
                opad[i] = bkey[i] ^ 0x5C5C5C5C;
            }

            var hash = this.binl_md5(ipad.concat(PasswordMaker_HashUtils.rstr2binl(data)), 512 + data.length * 8);
            return PasswordMaker_HashUtils.binl2rstr(this.binl_md5(opad.concat(hash), 512 + 128));
        },

        /*
         * Calculate the MD5 of an array of little-endian words, and a bit length.
         */
        binl_md5: function(x, len) {
            /* append padding */
            x[len >> 5] |= 0x80 << (len % 32);
            x[(((len + 64) >>> 9) << 4) + 14] = len;

            var a = 1732584193,
                b = -271733879,
                c = -1732584194,
                d = 271733878;

            for (var i = 0; i < x.length; i += 16) {
                var olda = a,
                    oldb = b,
                    oldc = c,
                    oldd = d;

                a = this.md5_ff(a, b, c, d, x[i + 0], 7, -680876936);
                d = this.md5_ff(d, a, b, c, x[i + 1], 12, -389564586);
                c = this.md5_ff(c, d, a, b, x[i + 2], 17, 606105819);
                b = this.md5_ff(b, c, d, a, x[i + 3], 22, -1044525330);
                a = this.md5_ff(a, b, c, d, x[i + 4], 7, -176418897);
                d = this.md5_ff(d, a, b, c, x[i + 5], 12, 1200080426);
                c = this.md5_ff(c, d, a, b, x[i + 6], 17, -1473231341);
                b = this.md5_ff(b, c, d, a, x[i + 7], 22, -45705983);
                a = this.md5_ff(a, b, c, d, x[i + 8], 7, 1770035416);
                d = this.md5_ff(d, a, b, c, x[i + 9], 12, -1958414417);
                c = this.md5_ff(c, d, a, b, x[i + 10], 17, -42063);
                b = this.md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
                a = this.md5_ff(a, b, c, d, x[i + 12], 7, 1804603682);
                d = this.md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
                c = this.md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
                b = this.md5_ff(b, c, d, a, x[i + 15], 22, 1236535329);

                a = this.md5_gg(a, b, c, d, x[i + 1], 5, -165796510);
                d = this.md5_gg(d, a, b, c, x[i + 6], 9, -1069501632);
                c = this.md5_gg(c, d, a, b, x[i + 11], 14, 643717713);
                b = this.md5_gg(b, c, d, a, x[i + 0], 20, -373897302);
                a = this.md5_gg(a, b, c, d, x[i + 5], 5, -701558691);
                d = this.md5_gg(d, a, b, c, x[i + 10], 9, 38016083);
                c = this.md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
                b = this.md5_gg(b, c, d, a, x[i + 4], 20, -405537848);
                a = this.md5_gg(a, b, c, d, x[i + 9], 5, 568446438);
                d = this.md5_gg(d, a, b, c, x[i + 14], 9, -1019803690);
                c = this.md5_gg(c, d, a, b, x[i + 3], 14, -187363961);
                b = this.md5_gg(b, c, d, a, x[i + 8], 20, 1163531501);
                a = this.md5_gg(a, b, c, d, x[i + 13], 5, -1444681467);
                d = this.md5_gg(d, a, b, c, x[i + 2], 9, -51403784);
                c = this.md5_gg(c, d, a, b, x[i + 7], 14, 1735328473);
                b = this.md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);

                a = this.md5_hh(a, b, c, d, x[i + 5], 4, -378558);
                d = this.md5_hh(d, a, b, c, x[i + 8], 11, -2022574463);
                c = this.md5_hh(c, d, a, b, x[i + 11], 16, 1839030562);
                b = this.md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
                a = this.md5_hh(a, b, c, d, x[i + 1], 4, -1530992060);
                d = this.md5_hh(d, a, b, c, x[i + 4], 11, 1272893353);
                c = this.md5_hh(c, d, a, b, x[i + 7], 16, -155497632);
                b = this.md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
                a = this.md5_hh(a, b, c, d, x[i + 13], 4, 681279174);
                d = this.md5_hh(d, a, b, c, x[i + 0], 11, -358537222);
                c = this.md5_hh(c, d, a, b, x[i + 3], 16, -722521979);
                b = this.md5_hh(b, c, d, a, x[i + 6], 23, 76029189);
                a = this.md5_hh(a, b, c, d, x[i + 9], 4, -640364487);
                d = this.md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
                c = this.md5_hh(c, d, a, b, x[i + 15], 16, 530742520);
                b = this.md5_hh(b, c, d, a, x[i + 2], 23, -995338651);

                a = this.md5_ii(a, b, c, d, x[i + 0], 6, -198630844);
                d = this.md5_ii(d, a, b, c, x[i + 7], 10, 1126891415);
                c = this.md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
                b = this.md5_ii(b, c, d, a, x[i + 5], 21, -57434055);
                a = this.md5_ii(a, b, c, d, x[i + 12], 6, 1700485571);
                d = this.md5_ii(d, a, b, c, x[i + 3], 10, -1894986606);
                c = this.md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
                b = this.md5_ii(b, c, d, a, x[i + 1], 21, -2054922799);
                a = this.md5_ii(a, b, c, d, x[i + 8], 6, 1873313359);
                d = this.md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
                c = this.md5_ii(c, d, a, b, x[i + 6], 15, -1560198380);
                b = this.md5_ii(b, c, d, a, x[i + 13], 21, 1309151649);
                a = this.md5_ii(a, b, c, d, x[i + 4], 6, -145523070);
                d = this.md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
                c = this.md5_ii(c, d, a, b, x[i + 2], 15, 718787259);
                b = this.md5_ii(b, c, d, a, x[i + 9], 21, -343485551);

                a += olda | 0;
                b += oldb | 0;
                c += oldc | 0;
                d += oldd | 0;
            }
            return [a, b, c, d];
        },

        /*
         * These functions implement the four basic operations the algorithm uses.
         */
        md5_cmn: function(q, a, b, x, s, t) {
            return PasswordMaker_HashUtils.bit_rol(a + q + (x | 0) + t, s) + b;
        },
        md5_ff: function(a, b, c, d, x, s, t) {
            return this.md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
        },
        md5_gg: function(a, b, c, d, x, s, t) {
            return this.md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
        },
        md5_hh: function(a, b, c, d, x, s, t) {
            return this.md5_cmn(b ^ c ^ d, a, b, x, s, t);
        },
        md5_ii: function(a, b, c, d, x, s, t) {
            return this.md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
        }
    };
}

/*
 * Refactored to share as much as possible from the primary PasswordMaker_MD5 algorithm while keeping 0.6 api compatilbility.
 * Bug: if the charCodeAt value is less than 15 on the first iteration of the loop, the value is still appended as a 0 as
 * the first character in the resulting string.
 */

if (typeof PasswordMaker_MD5_V6 !== "object") {
    var PasswordMaker_MD5_V6 = {
        hex_md5: function(key) {
            return this.buggy2hex(PasswordMaker_MD5.rstr_md5(key));
        },
        hex_hmac_md5: function(key, data) {
            return this.buggy2hex(PasswordMaker_MD5.rstr_hmac_md5(key, data));
        },

        buggy2hex: function(input) {
            var hex = "0123456789abcdef",
                output = "";
            for (var i = 0; i < input.length; i++) {
                var x = input.charCodeAt(i);
                output += hex.charAt((x >> 4) & 0xF);
                output += hex.charAt(x & 0xF);
            }
            return output;
        }
    };
}
