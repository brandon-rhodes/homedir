var Settings = {
    currentUrl: ""
};

var CHARSET_OPTIONS = [
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789`~!@#$%^&*()_-+={}|[]\\:\";'<>?,./",
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
    "0123456789abcdef",
    "0123456789",
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
    "`~!@#$%^&*()_-+={}|[]\\:\";'<>?,./"
];

Settings.getProfile = (id) => {
    return Settings.profiles.filter((profile) => profile.id === parseInt(id, 10))[0];
};

Settings.getMaxId = () => {
    var maxId = Settings.profiles.reduce((prev, curr) => {
        if (curr.id > (prev.id || 0)) {
            return curr;
        } else {
            return prev;
        }
    }, 0);
    return maxId.id;
};

Settings.addProfile = (inputProfile) => {
    inputProfile.id = Settings.getMaxId() + 1;
    Settings.profiles.push(inputProfile);
};

Settings.deleteProfile = (id) => {
    Settings.profiles = Settings.profiles.filter((profile) => profile.id !== parseInt(id, 10));
    Settings.saveProfiles();
};

Settings.loadProfilesFromString = (profiles) => {
    Settings.profiles = JSON.parse(profiles).map((item) => Object.assign(Object.create(Profile), item));
};

Settings.loadProfiles = () => {
    return chrome.storage.local.get(["profiles", "sync_profiles", "synced_profiles", "sync_profiles_password"]).then((result) => {
        if (result["profiles"]) {
            Settings.loadProfilesFromString(result["profiles"]);
        } else {
            var normal = Object.create(Profile);
            var alpha = Object.create(Profile);
            alpha.id = 2;
            alpha.title = "Alphanumeric";
            alpha.selectedCharset = CHARSET_OPTIONS[1];
            Settings.profiles = [normal, alpha];
            Settings.saveProfiles();
        }

        if (result["synced_profiles"]) {
            chrome.storage.local.set({ "syncDataAvailable": true });
            if (result["sync_profiles_password"]) {
                var profiles = Settings.decrypt(result["sync_profiles_password"], result["synced_profiles"]);
                if (profiles.length !== 0) {
                    if (result["sync_profiles"]) {
                        Settings.loadProfilesFromString(profiles);
                    }
                }
            }
        }
    });
}

Settings.alphaSortProfiles = () => {
    var profiles = Settings.profiles,
        defaultProfile = profiles.shift();

    profiles.sort((a, b) => {
        if (a.title.toUpperCase() < b.title.toUpperCase()) return -1;
        if (a.title.toUpperCase() > b.title.toUpperCase()) return 1;
        return 0;
    });

    profiles.unshift(defaultProfile);
    Settings.profiles = profiles;
};

Settings.saveSyncedProfiles = (syncPassHash, profileData) => {
    var threshold = Math.round(8192 * 0.99); // 8192 is chrome.storage.sync.QUOTA_BYTES_PER_ITEM but 8146 is actual max item size

    chrome.storage.sync.clear().then(() => {
        if (profileData.length <= threshold) {
            chrome.storage.sync.set({ "synced_profiles": profileData, "sync_profiles_password": syncPassHash }).catch(() => {
                return console.log("Could not sync small data : " + chrome.runtime.lastError);
            }).then(() => {
                return chrome.storage.local.set({ "syncDataAvailable": true, "synced_profiles": profileData, "sync_profiles_password": syncPassHash });
            });
        } else {
            var splitter = new RegExp("[\\s\\S]{1," + threshold + "}", "g");
            var parts = profileData.match(splitter);
            var date = Date.now();
            var output = {};
            var keys = [];

            parts.forEach((part, index) => {
                output[date + index] = part;
                keys[index] = date + index;
            });

            output["synced_profiles_keys"] = keys;
            chrome.storage.sync.set(output).then(() => {
                chrome.storage.sync.set({ "sync_profiles_password": syncPassHash });
                chrome.storage.local.set({ "syncDataAvailable": true, "synced_profiles": profileData, "sync_profiles_password": syncPassHash });
            }).catch(() => {
                console.log("Could not sync large data : " + chrome.extension.lastError);
            });
        }
    });
};

Settings.saveProfiles = () => {
    Settings.profiles = Settings.profiles.map((profile, index) => {
        profile.id = index + 1;
        return profile;
    });

    var stringified = JSON.stringify(Settings.profiles);
    return chrome.storage.local.set({ "profiles": stringified }).then(() => {
        chrome.storage.local.get(["sync_profiles", "syncDataAvailable", "sync_profiles_password", "synced_profiles"]).then((result) => {
            var syncHash = result["sync_profiles_password"] || "";
            var profiles = Settings.decrypt(syncHash, result["synced_profiles"]);
            if (result["sync_profiles"] && (!result["syncDataAvailable"] || (profiles.length !== 0))) {
                Settings.saveSyncedProfiles(result["sync_profiles_password"], Settings.encrypt(result["sync_profiles_password"], stringified));
            }
        });
    });
};

Settings.setStoreLocation = (location) => {
    chrome.storage.local.set({ "storeLocation": location }).then(() => {
        switch (location) {
            case "memory":
                chrome.storage.local.remove(["expire_password_minutes", "password", "password_crypt", "password_key"]);
                break;
            case "memory_expire":
                chrome.storage.local.remove(["expire_password_minutes", "password", "password_crypt", "password_key"]).then(() => {
                    chrome.storage.local.set({ "expire_password_minutes": 5 });
                });
                break;
            case "disk":
                chrome.storage.session.remove(["password", "password_key"]).then(() => {
                    chrome.storage.local.remove(["expire_password_minutes"]);
                });
                break;
            case "never":
                chrome.storage.session.remove(["password", "password_key"]).then(() => {
                    chrome.storage.local.remove(["expire_password_minutes", "password", "password_crypt", "password_key"]);
                });
                break;
        }
    });
};

Settings.createExpirePasswordAlarm = () => {
    chrome.alarms.clear("expire_password").then(() => {
        chrome.storage.local.get(["expire_password_minutes"]).then((result) => {
            chrome.alarms.create("expire_password", {
                delayInMinutes: parseInt(result["expire_password_minutes"], 10)
            });
        });
    });
};

Settings.setPassword = () => {
    chrome.storage.local.get(["storeLocation"]).then((result) => {
        if (result["storeLocation"] === "never") {
            chrome.storage.local.remove("password");
            chrome.storage.session.remove("password");
        } else {
            var password = document.getElementById("password").value;
            var bits = crypto.getRandomValues(new Uint32Array(8));
            var key = sjcl.codec.base64.fromBits(bits);
            var encrypted = Settings.encrypt(key, password);
            switch (result["storeLocation"]) {
                case "memory":
                    chrome.storage.session.set({ "password": encrypted, "password_key": String(key) });
                    break;
                case "memory_expire":
                    chrome.storage.session.set({ "password": encrypted, "password_key": String(key) }).then(() => {
                        Settings.createExpirePasswordAlarm();
                    });
                    break;
                case "disk":
                    chrome.storage.local.set({ "password_crypt": encrypted, "password_key": String(key) });
                    break;
            }

        }
    });
};

Settings.make_pbkdf2 = (password, previousSalt, iter) => {
    var usedSalt = previousSalt || sjcl.codec.base64.fromBits(crypto.getRandomValues(new Uint32Array(8)));
    var iterations = iter || 10000;
    var derived = sjcl.codec.hex.fromBits(sjcl.misc.pbkdf2(password, usedSalt, iterations));
    return {
        hash: derived,
        salt: usedSalt,
        iter: iterations
    };
};

Settings.encrypt = (key, data) => {
    return sjcl.encrypt(key, data, {
        ks: 256,
        ts: 128
    });
};

Settings.decrypt = (key, data) => {
    try {
        return sjcl.decrypt(key, data);
    } catch (e) {
        return "";
    }
};

// strength calculation based on Firefox version to return an object
Settings.getPasswordStrength = (pw) => {
    // char frequency
    var uniques = new Set();
    Array.from(pw).forEach((char) => {
        uniques.add(char.charCodeAt(0));
    });
    var r0 = (uniques.size === 1) ? 0 : (uniques.size / pw.length);

    // length of the password - 1pt per char over 5, up to 15 for 10 pts total
    var r1 = pw.length;
    if (r1 >= 15) {
        r1 = 10;
    } else if (r1 < 5) {
        r1 = -5;
    } else {
        r1 -= 5;
    }

    var quarterLen = Math.round(pw.length / 4);

    // ratio of numbers in the password
    var c = pw.replace(/[0-9]/g, "");
    var nums = (pw.length - c.length);
    c = nums > quarterLen * 2 ? quarterLen : Math.abs(quarterLen - nums);
    var r2 = 1 - (c / quarterLen);

    // ratio of symbols in the password
    c = pw.replace(/\W/g, "");
    var syms = (pw.length - c.length);
    c = syms > quarterLen * 2 ? quarterLen : Math.abs(quarterLen - syms);
    var r3 = 1 - (c / quarterLen);

    // ratio of uppercase in the password
    c = pw.replace(/[A-Z]/g, "");
    var upper = (pw.length - c.length);
    c = upper > quarterLen * 2 ? quarterLen : Math.abs(quarterLen - upper);
    var r4 = 1 - (c / quarterLen);

    // ratio of lowercase in the password
    c = pw.replace(/[a-z]/g, "");
    var lower = (pw.length - c.length);
    c = lower > quarterLen * 2 ? quarterLen : Math.abs(quarterLen - lower);
    var r5 = 1 - (c / quarterLen);

    var pwStrength = (((r0 + r2 + r3 + r4 + r5) / 5) * 100) + r1;

    // make sure strength is a valid value between 0 and 100
    if (isNaN(pwStrength)) pwStrength = 0;
    if (pwStrength < 0) pwStrength = 0;
    if (pwStrength > 100) pwStrength = 100;

    // return strength as an integer + boolean usage of character type
    return {
        strength: parseInt(pwStrength, 10),
        hasUpper: Boolean(upper),
        hasLower: Boolean(lower),
        hasDigit: Boolean(nums),
        hasSymbol: Boolean(syms)
    };
};

Settings.migrateFromStorage = () => {
    if (localStorage["alpha_sort_profiles"] !== undefined) {
        chrome.storage.local.set({ "alpha_sort_profiles": Boolean(localStorage["alpha_sort_profiles"]) }).then(() => {
            localStorage.removeItem("alpha_sort_profiles");
        });
    }
    if (localStorage["expire_password_minutes"] !== undefined) {
        chrome.storage.local.set({ "expire_password_minutes": Number(localStorage["expire_password_minutes"]) }).then(() => {
            localStorage.removeItem("expire_password_minutes");
        });
    }
    if (localStorage["keep_master_password_hash"] !== undefined) {
        chrome.storage.local.set({ "keep_master_password_hash": Boolean(localStorage["keep_master_password_hash"]) }).then(() => {
            localStorage.removeItem("keep_master_password_hash");
        });
    }
    if (localStorage["master_password_hash"] !== undefined) {
        chrome.storage.local.set({ "master_password_hash": String(localStorage["master_password_hash"]) }).then(() => {
            localStorage.removeItem("master_password_hash");
        });
    }
    if (localStorage["password"] !== undefined) {
        chrome.storage.local.set({ "password": String(localStorage["password"]) }).then(() => {
            localStorage.removeItem("password");
        });
    }
    if (localStorage["password_key"] !== undefined) {
        chrome.storage.local.set({ "password_key": String(localStorage["password_key"]) }).then(() => {
            localStorage.removeItem("password_key");
        });
    }
    if (localStorage["profiles"] !== undefined) {
        chrome.storage.local.set({ "profiles": String(localStorage["profiles"]) }).then(() => {
            localStorage.removeItem("profiles");
        });
    }
    if (localStorage["show_generated_password"] !== undefined) {
        chrome.storage.local.set({ "show_generated_password": Boolean(localStorage["show_generated_password"]) }).then(() => {
            localStorage.removeItem("show_generated_password");
        });
    }
    if (localStorage["show_password_strength"] !== undefined) {
        chrome.storage.local.set({ "show_password_strength": Boolean(localStorage["show_password_strength"]) }).then(() => {
            localStorage.removeItem("show_password_strength");
        });
    }
    if (localStorage["storeLocation"] !== undefined) {
        chrome.storage.local.set({ "storeLocation": String(localStorage["storeLocation"]) }).then(() => {
            localStorage.removeItem("storeLocation");
        });
    }
    if (localStorage["use_verification_code"] !== undefined) {
        chrome.storage.local.set({ "use_verification_code": Boolean(localStorage["use_verification_code"]) }).then(() => {
            localStorage.removeItem("use_verification_code");
        });
    }
    if (localStorage["sync_profiles"] !== undefined) {
        chrome.storage.local.set({ "sync_profiles": Boolean(localStorage["sync_profiles"]) }).then(() => {
            localStorage.removeItem("sync_profiles");
        });
    }
    if (localStorage["sync_profiles_password"] !== undefined) {
        chrome.storage.local.set({ "sync_profiles_password": String(localStorage["sync_profiles_password"]) }).then(() => {
            localStorage.removeItem("sync_profiles_password");
        });
    }
    if (localStorage["synced_profiles"] !== undefined) {
        chrome.storage.local.set({ "synced_profiles": String(localStorage["synced_profiles"]) }).then(() => {
            localStorage.removeItem("synced_profiles");
        });
    }
    if (localStorage["synced_profiles_keys"] !== undefined) {
        chrome.storage.local.set({ "synced_profiles_keys": String(localStorage["synced_profiles_keys"]) }).then(() => {
            localStorage.removeItem("synced_profiles_keys");
        });
    }
    chrome.storage.local.get(["show_generated_password"]).then((result) => {
        if (result["show_generated_password"] !== undefined) {
            if (result["show_generated_password"] === false) {
                chrome.storage.local.set({ "hide_generated_password": true });
            }
            chrome.storage.local.remove(["show_generated_password"]);
        }
    });
}