/*
 * A JavaScript implementation of the Secure Hash Algorithm, SHA-256, as defined in FIPS 180-2
 * Version 2.2 Copyright Angel Marin, Paul Johnston 2000 - 2009.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for details.
 * Also http://anmar.eu.org/projects/jssha2/
 *
 * Modified by Eric H. Jung (grimholtz@yahoo.com)
 * Modified by Eric Aguiar (ultimate.evil@gmail.com)
 *
 */

if (typeof PasswordMaker_SHA256 !== "object") {
    var PasswordMaker_SHA256 = {
        any_sha256: function(s, e) {
            return PasswordMaker_HashUtils.rstr2any(this.rstr_sha256(s), e);
        },
        any_hmac_sha256: function(k, d, e, b) {
            return PasswordMaker_HashUtils.rstr2any(this.rstr_hmac_sha256(k, d, b), e);
        },

        /*
         * Calculate the sha256 of a raw string
         */
        rstr_sha256: function(s) {
            return PasswordMaker_HashUtils.binb2rstr(this.binb_sha256(PasswordMaker_HashUtils.rstr2binb(s), s.length * 8));
        },

        /*
         * Calculate the HMAC-sha256 of a key and some data (raw strings)
         */
        rstr_hmac_sha256: function(key, data, bug) {
            var ipad = Array(16),
                opad = Array(16),
                bkey = PasswordMaker_HashUtils.rstr2binb(key);
            if (bkey.length > 16) {
                bkey = this.binb_sha256(bkey, key.length * 8);
            }
            for (var i = 0; i < 16; i++) {
                ipad[i] = bkey[i] ^ 0x36363636;
                opad[i] = bkey[i] ^ 0x5C5C5C5C;
            }

            var hash = this.binb_sha256(ipad.concat(PasswordMaker_HashUtils.rstr2binb(data)), 512 + data.length * 8);
            return PasswordMaker_HashUtils.binb2rstr(this.binb_sha256(opad.concat(hash), 512 + ((bug) ? 160 : 256)));
        },

        /*
         * Main sha256 function, with its support functions
         */
        S: function(X, n) {
            return (X >>> n) | (X << (32 - n));
        },
        Sigma0256: function(x) {
            return (this.S(x, 2) ^ this.S(x, 13) ^ this.S(x, 22));
        },
        Sigma1256: function(x) {
            return (this.S(x, 6) ^ this.S(x, 11) ^ this.S(x, 25));
        },
        Gamma0256: function(x) {
            return (this.S(x, 7) ^ this.S(x, 18) ^ (x >>> 3));
        },
        Gamma1256: function(x) {
            return (this.S(x, 17) ^ this.S(x, 19) ^ (x >>> 10));
        },
        Sigma0512: function(x) {
            return (this.S(x, 28) ^ this.S(x, 34) ^ this.S(x, 39));
        },
        Sigma1512: function(x) {
            return (this.S(x, 14) ^ this.S(x, 18) ^ this.S(x, 41));
        },
        Gamma0512: function(x) {
            return (this.S(x, 1) ^ this.S(x, 8) ^ (x >>> 7));
        },
        Gamma1512: function(x) {
            return (this.S(x, 19) ^ this.S(x, 61) ^ (x >>> 6));
        },

        sha256_K: [
            1116352408, 1899447441, -1245643825, -373957723, 961987163, 1508970993, -1841331548, -1424204075, -670586216, 310598401, 607225278, 1426881987, 1925078388, -2132889090, -1680079193, -1046744716, -459576895, -272742522, 264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986, -1740746414, -1473132947, -1341970488, -1084653625, -958395405, -710438585, 113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291, 1695183700, 1986661051, -2117940946, -1838011259, -1564481375, -1474664885, -1035236496, -949202525, -778901479, -694614492, -200395387, 275423344, 430227734, 506948616, 659060556, 883997877, 958139571, 1322822218, 1537002063, 1747873779, 1955562222, 2024104815, -2067236844, -1933114872, -1866530822, -1538233109, -1090935817, -965641998
        ],

        binb_sha256: function(x, len) {
            var HASH = [1779033703, -1150833019, 1013904242, -1521486534, 1359893119, -1694144372, 528734635, 1541459225];
            var W = Array(64);
            var a, b, c, d, e, f, g, h;
            var i, j, T1, T2;

            /* append padding */
            x[len >> 5] |= 0x80 << (24 - len % 32);
            x[(((len + 64) >>> 9) << 4) + 15] = len;

            for (i = 0; i < x.length; i += 16) {
                a = HASH[0];
                b = HASH[1];
                c = HASH[2];
                d = HASH[3];
                e = HASH[4];
                f = HASH[5];
                g = HASH[6];
                h = HASH[7];

                for (j = 0; j < 64; j++) {
                    if (j < 16) {
                        W[j] = x[j + i];
                    } else {
                        W[j] = this.Gamma1256(W[j - 2]) + (W[j - 7] | 0) + this.Gamma0256(W[j - 15]) + (W[j - 16] | 0);
                    }

                    T1 = this.Sigma1256(e) + ((e & f) ^ (~e & g)) + this.sha256_K[j] + h + (W[j] | 0);
                    T2 = this.Sigma0256(a) + ((a & b) ^ (a & c) ^ (b & c));
                    h = g;
                    g = f;
                    f = e;
                    e = d + T1;
                    d = c;
                    c = b;
                    b = a;
                    a = T1 + T2;
                }
                HASH[0] += a | 0;
                HASH[1] += b | 0;
                HASH[2] += c | 0;
                HASH[3] += d | 0;
                HASH[4] += e | 0;
                HASH[5] += f | 0;
                HASH[6] += g | 0;
                HASH[7] += h | 0;
            }
            return HASH;
        }
    };
}
