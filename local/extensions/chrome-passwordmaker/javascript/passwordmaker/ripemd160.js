/*
 * A JavaScript implementation of the RIPEMD-160 Algorithm
 * Version 2.2 Copyright Jeremy Lin, Paul Johnston 2000 - 2009.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for details.
 * Also http://www.ocf.berkeley.edu/~jjlin/jsotp/
 *
 * Modified by Eric H. Jung (grimholtz@yahoo.com)
 * Modified by Eric Aguiar (ultimate.evil@gmail.com)
 */

if (typeof PasswordMaker_RIPEMD160 !== "object") {
    var PasswordMaker_RIPEMD160 = {
        any_rmd160: function(s, e) {
            return PasswordMaker_HashUtils.rstr2any(this.rstr_rmd160(s), e);
        },
        any_hmac_rmd160: function(k, d, e) {
            return PasswordMaker_HashUtils.rstr2any(this.rstr_hmac_rmd160(k, d), e);
        },

        /*
         * Calculate the rmd160 of a raw string
         */
        rstr_rmd160: function(s) {
            return PasswordMaker_HashUtils.binl2rstr(this.binl_rmd160(PasswordMaker_HashUtils.rstr2binl(s), s.length * 8));
        },

        /*
         * Calculate the HMAC-rmd160 of a key and some data (raw strings)
         */
        rstr_hmac_rmd160: function(key, data) {
            var ipad = Array(16),
                opad = Array(16),
                bkey = PasswordMaker_HashUtils.rstr2binl(key);
            if (bkey.length > 16) {
                bkey = this.binl_rmd160(bkey, key.length * 8);
            }
            for (var i = 0; i < 16; i++) {
                ipad[i] = bkey[i] ^ 0x36363636;
                opad[i] = bkey[i] ^ 0x5C5C5C5C;
            }

            var hash = this.binl_rmd160(ipad.concat(PasswordMaker_HashUtils.rstr2binl(data)), 512 + data.length * 8);
            return PasswordMaker_HashUtils.binl2rstr(this.binl_rmd160(opad.concat(hash), 512 + 160));
        },

        /*
         * Calculate the RIPE-MD160 of an array of little-endian words, and a bit length.
         */
        binl_rmd160: function(x, len) {
            /* append padding */
            x[len >> 5] |= 0x80 << (len % 32);
            x[(((len + 64) >>> 9) << 4) + 14] = len;

            var h0 = 0x67452301,
                h1 = 0xefcdab89,
                h2 = 0x98badcfe,
                h3 = 0x10325476,
                h4 = 0xc3d2e1f0;

            for (var i = 0; i < x.length; i += 16) {
                var T;
                var A1 = h0, B1 = h1, C1 = h2, D1 = h3, E1 = h4;
                var A2 = h0, B2 = h1, C2 = h2, D2 = h3, E2 = h4;
                for (var j = 0; j < 80; j++) {
                    T = A1 + this.rmd160_f(j, B1, C1, D1) | 0;
                    T += x[i + this.rmd160_r1[j]] | 0;
                    T += this.rmd160_K1(j) | 0;
                    T = PasswordMaker_HashUtils.bit_rol(T, this.rmd160_s1[j]) + E1 | 0;
                    A1 = E1;
                    E1 = D1;
                    D1 = PasswordMaker_HashUtils.bit_rol(C1, 10);
                    C1 = B1;
                    B1 = T;
                    T = A2 + this.rmd160_f(79 - j, B2, C2, D2) | 0;
                    T += x[i + this.rmd160_r2[j]] | 0;
                    T += this.rmd160_K2(j) | 0;
                    T = PasswordMaker_HashUtils.bit_rol(T, this.rmd160_s2[j]) + E2 | 0;
                    A2 = E2;
                    E2 = D2;
                    D2 = PasswordMaker_HashUtils.bit_rol(C2, 10);
                    C2 = B2;
                    B2 = T;
                }
                T = h1 + C1 + D2 | 0;
                h1 = h2 + D1 + E2 | 0;
                h2 = h3 + E1 + A2 | 0;
                h3 = h4 + A1 + B2 | 0;
                h4 = h0 + B1 + C2 | 0;
                h0 = T;
            }
            return [h0, h1, h2, h3, h4];
        },

        rmd160_f: function(j, x, y, z) {
            if (j < 16) return (x ^ y ^ z);
            else if (j < 32) return (x & y) | (~x & z);
            else if (j < 48) return (x | ~y) ^ z;
            else if (j < 64) return (x & z) | (y & ~z);
            else if (j < 80) return (x ^ (y | ~z));
        },

        rmd160_K1: function(j) {
            if (j < 16) return 0x00000000;
            else if (j < 32) return 0x5a827999;
            else if (j < 48) return 0x6ed9eba1;
            else if (j < 64) return 0x8f1bbcdc;
            else if (j < 80) return 0xa953fd4e;
        },

        rmd160_K2: function(j) {
            if (j < 16) return 0x50a28be6;
            else if (j < 32) return 0x5c4dd124;
            else if (j < 48) return 0x6d703ef3;
            else if (j < 64) return 0x7a6d76e9;
            else if (j < 80) return 0x00000000;
        },

        rmd160_r1: [
            0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
            7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8,
            3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12,
            1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2,
            4, 0, 5, 9, 7, 12, 2, 10, 14, 1, 3, 8, 11, 6, 15, 13
        ],

        rmd160_r2: [
            5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12,
            6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2,
            15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13,
            8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14,
            12, 15, 10, 4, 1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9, 11
        ],

        rmd160_s1: [
            11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8,
            7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12,
            11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5,
            11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12,
            9, 15, 5, 11, 6, 8, 13, 12, 5, 12, 13, 14, 11, 8, 5, 6
        ],

        rmd160_s2: [
            8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6,
            9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11,
            9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5,
            15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8,
            8, 5, 12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15, 13, 11, 11
        ]
    };
}
