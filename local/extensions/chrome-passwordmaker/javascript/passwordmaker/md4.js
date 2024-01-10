/*
 * A JavaScript implementation of the RSA Data Security, Inc. MD4 Message Digest Algorithm, as defined in RFC 1320.
 * Version 2.1 Copyright (C) Jerrad Pierce, Paul Johnston 1999 - 2002.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 *
 * Modified by Eric H. Jung (grimholtz@yahoo.com)
 */

if (typeof PasswordMaker_MD4 !== "object") {
    var PasswordMaker_MD4 = {
        any_md4: function(s, e) {
            return PasswordMaker_HashUtils.rstr2any(this.rstr_md4(s), e);
        },
        any_hmac_md4: function(k, d, e) {
            return PasswordMaker_HashUtils.rstr2any(this.rstr_hmac_md4(k, d), e);
        },

        /*
         * Calculate the MD4 of a raw string
         */
        rstr_md4: function(s) {
            return PasswordMaker_HashUtils.binl2rstr(this.binl_md4(PasswordMaker_HashUtils.rstr2binl(s), s.length * 8));
        },

        /*
         * Calculate the HMAC-MD4 of a key and some data
         */
        rstr_hmac_md4: function(key, data) {
            var ipad = Array(16),
                opad = Array(16),
                bkey = PasswordMaker_HashUtils.rstr2binl(key);
            if (bkey.length > 16) {
                bkey = this.binl_md4(bkey, key.length * 8);
            }
            for (var i = 0; i < 16; i++) {
                ipad[i] = bkey[i] ^ 0x36363636;
                opad[i] = bkey[i] ^ 0x5C5C5C5C;
            }

            var hash = this.binl_md4(ipad.concat(PasswordMaker_HashUtils.rstr2binl(data)), 512 + data.length * 8);
            return PasswordMaker_HashUtils.binl2rstr(this.binl_md4(opad.concat(hash), 512 + 128));
        },

        /*
         * Calculate the MD4 of an array of little-endian words, and a bit length
         */
        binl_md4: function(x, len) {
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

                a = this.md4_ff(a, b, c, d, x[i + 0], 3);
                d = this.md4_ff(d, a, b, c, x[i + 1], 7);
                c = this.md4_ff(c, d, a, b, x[i + 2], 11);
                b = this.md4_ff(b, c, d, a, x[i + 3], 19);
                a = this.md4_ff(a, b, c, d, x[i + 4], 3);
                d = this.md4_ff(d, a, b, c, x[i + 5], 7);
                c = this.md4_ff(c, d, a, b, x[i + 6], 11);
                b = this.md4_ff(b, c, d, a, x[i + 7], 19);
                a = this.md4_ff(a, b, c, d, x[i + 8], 3);
                d = this.md4_ff(d, a, b, c, x[i + 9], 7);
                c = this.md4_ff(c, d, a, b, x[i + 10], 11);
                b = this.md4_ff(b, c, d, a, x[i + 11], 19);
                a = this.md4_ff(a, b, c, d, x[i + 12], 3);
                d = this.md4_ff(d, a, b, c, x[i + 13], 7);
                c = this.md4_ff(c, d, a, b, x[i + 14], 11);
                b = this.md4_ff(b, c, d, a, x[i + 15], 19);

                a = this.md4_gg(a, b, c, d, x[i + 0], 3);
                d = this.md4_gg(d, a, b, c, x[i + 4], 5);
                c = this.md4_gg(c, d, a, b, x[i + 8], 9);
                b = this.md4_gg(b, c, d, a, x[i + 12], 13);
                a = this.md4_gg(a, b, c, d, x[i + 1], 3);
                d = this.md4_gg(d, a, b, c, x[i + 5], 5);
                c = this.md4_gg(c, d, a, b, x[i + 9], 9);
                b = this.md4_gg(b, c, d, a, x[i + 13], 13);
                a = this.md4_gg(a, b, c, d, x[i + 2], 3);
                d = this.md4_gg(d, a, b, c, x[i + 6], 5);
                c = this.md4_gg(c, d, a, b, x[i + 10], 9);
                b = this.md4_gg(b, c, d, a, x[i + 14], 13);
                a = this.md4_gg(a, b, c, d, x[i + 3], 3);
                d = this.md4_gg(d, a, b, c, x[i + 7], 5);
                c = this.md4_gg(c, d, a, b, x[i + 11], 9);
                b = this.md4_gg(b, c, d, a, x[i + 15], 13);

                a = this.md4_hh(a, b, c, d, x[i + 0], 3);
                d = this.md4_hh(d, a, b, c, x[i + 8], 9);
                c = this.md4_hh(c, d, a, b, x[i + 4], 11);
                b = this.md4_hh(b, c, d, a, x[i + 12], 15);
                a = this.md4_hh(a, b, c, d, x[i + 2], 3);
                d = this.md4_hh(d, a, b, c, x[i + 10], 9);
                c = this.md4_hh(c, d, a, b, x[i + 6], 11);
                b = this.md4_hh(b, c, d, a, x[i + 14], 15);
                a = this.md4_hh(a, b, c, d, x[i + 1], 3);
                d = this.md4_hh(d, a, b, c, x[i + 9], 9);
                c = this.md4_hh(c, d, a, b, x[i + 5], 11);
                b = this.md4_hh(b, c, d, a, x[i + 13], 15);
                a = this.md4_hh(a, b, c, d, x[i + 3], 3);
                d = this.md4_hh(d, a, b, c, x[i + 11], 9);
                c = this.md4_hh(c, d, a, b, x[i + 7], 11);
                b = this.md4_hh(b, c, d, a, x[i + 15], 15);

                a += olda | 0;
                b += oldb | 0;
                c += oldc | 0;
                d += oldd | 0;
            }
            return [a, b, c, d];
        },

        /*
         * These functions implement the basic operation for each round of the
         * algorithm.
         */
        md4_cmn: function(q, a, b, x, s, t) {
            return PasswordMaker_HashUtils.bit_rol(a + q + (x | 0) + t, s) + b;
        },
        md4_ff: function(a, b, c, d, x, s) {
            return this.md4_cmn((b & c) | ((~b) & d), a, 0, x, s, 0);
        },
        md4_gg: function(a, b, c, d, x, s) {
            return this.md4_cmn((b & c) | (b & d) | (c & d), a, 0, x, s, 1518500249);
        },
        md4_hh: function(a, b, c, d, x, s) {
            return this.md4_cmn(b ^ c ^ d, a, 0, x, s, 1859775393);
        }
    };
}
