function updateStyle(element, selected, isSelected) {
    if (isSelected) {
        element.classList.add(selected);
    } else {
        element.classList.remove(selected);
    }
}

function updateExample() {
    updateStyle(document.getElementById("exprotocol"), "selected", document.getElementById("protocolCB").checked);
    updateStyle(document.getElementById("exsubdomain"), "selected", document.getElementById("subdomainCB").checked);
    updateStyle(document.getElementById("exdomain"), "selected", document.getElementById("domainCB").checked);
    updateStyle(document.getElementById("expath"), "selected", document.getElementById("pathCB").checked);
}

function updateLeet() {
    document.getElementById("leetLevelLB").disabled = (document.getElementById("whereLeetLB").value === "off");
    updateStyle(document.getElementById("leetLevelLabel"), "disabled", document.getElementById("whereLeetLB").value === "off");
}

function addProfile() {
    var p = Object.create(Profile);
    p.title = "No name";
    Settings.addProfile(p);
    updateProfileList().then(() => {
        setCurrentProfile(p);
    })
}

function removeProfile() {
    if (confirm("Really delete this profile?")) {
        Settings.deleteProfile(Settings.currentProfile);
        updateProfileList();
        setCurrentProfile(Settings.profiles[0]);
    }
}

function removeAllProfiles() {
    if (confirm("Really delete ALL local profile customizations and reset to the default profiles?")) {
        chrome.storage.local.remove("profiles").then(() => {
            Settings.loadProfiles().then(() => {
                updateProfileList();
            });
        })
    }
}

function setCurrentProfile(profile) {
    Settings.currentProfile = profile.id;
    document.getElementById("profileNameTB").value = profile.title;
    document.getElementById("siteList").value = (profile.siteList).replace(/\s/g, "\n");
    document.getElementById("protocolCB").checked = profile.url_protocol;
    document.getElementById("subdomainCB").checked = profile.url_subdomain;
    document.getElementById("domainCB").checked = profile.url_domain;
    document.getElementById("pathCB").checked = profile.url_path;
    document.getElementById("inputUseThisText").value = profile.strUseText;
    document.getElementById("whereLeetLB").value = profile.whereToUseL33t;
    document.getElementById("leetLevelLB").value = profile.l33tLevel;
    document.getElementById("hashAlgorithmLB").value = profile.hashAlgorithm;
    document.getElementById("passwdLength").value = profile.passwordLength;
    document.getElementById("usernameTB").value = profile.username;
    document.getElementById("modifier").value = profile.modifier;
    document.getElementById("passwordPrefix").value = profile.passwordPrefix;
    document.getElementById("passwordSuffix").value = profile.passwordSuffix;
    document.getElementById("description").value = profile.description;

    document.getElementById("charset").replaceChildren();
    for (var i = 0; i < CHARSET_OPTIONS.length; i++) {
        document.getElementById("charset").appendChild(new Option(CHARSET_OPTIONS[i]));
    }
    document.getElementById("charset").appendChild(new Option("Custom charset"));

    if (CHARSET_OPTIONS.includes(profile.selectedCharset)) {
        document.getElementById("charset").value = profile.selectedCharset;
    } else {
        document.getElementById("charset").value = "Custom charset";
        document.getElementById("customCharset").value = profile.selectedCharset;
    }

    updateCustomCharsetField();
    updateExample();
    updateLeet();
    highlightProfile();
    // Keeps profile #1 around so it can only be re-named
    if (Settings.profiles[0].id === profile.id) {
        document.getElementById("remove").style.display = "none";
    } else {
        document.getElementById("remove").style.display = "";
    }

    showSection("profile_settings");
    oldHashWarning(profile.hashAlgorithm);
}

function updateCustomCharsetField() {
    if (document.getElementById("charset").value === "Custom charset") {
        document.getElementById("customCharset").value = Settings.getProfile(Settings.currentProfile).selectedCharset;
        document.getElementById("customCharset").style.display = "";
    } else {
        document.getElementById("customCharset").style.display = "none";
    }
}

function oldHashWarning(hash) {
    // Be as annoying as possible to try and stop people from using the bugged algorithms
    var bugged = {
        "md5_v6": 1,
        "hmac-md5_v6": 1,
        "hmac-sha256": 1
    };
    if (bugged[hash]) {
        if (confirm("Are you sure you want to continue using a legacy algorithm which is incorrectly implemented?")) {
            alert("Please change to using a correct & secure algorithm!\n\nThe old/bugged/legacy algorithms " +
                "are harmful to your online security and should be avoided at ALL costs.\n\n" +
                "Please change your passwords on the sites which you are using this algorithm if you are able to " +
                "as soon as possible.\n\nThank you\n");
        } else {
            alert("Please select one of the correct and secure hash algorithms below :)");
        }
    }
}

function showImport() {
    showSection("import_settings");
}

function showExport() {
    showSection("export_settings");
    document.getElementById("exportText").value = RdfImporter.dumpDoc();
}

function importRdf() {
    var txt = document.getElementById("importText").value;

    if (txt.trim().length === 0) {
        alert("Import text is empty");
        return false;
    }

    var rdfDoc = RdfImporter.loadDoc(txt);
    // Check that profiles have been parsed and are available before wiping current data
    if (rdfDoc.profiles.length > 0 && document.getElementById("importOverwrite").checked) {
        Settings.profiles = [];
    }

    if (RdfImporter.saveProfiles(rdfDoc.profiles) === 0) {
        alert("Sorry, no profiles found");
        return false;
    }

    updateProfileList();
}

function copyRdfExport() {
    navigator.clipboard.writeText(document.getElementById("exportText").value).then(() => {
        document.getElementById("exportText").select();
    });
}

function showOptions() {
    chrome.storage.sync.get().then((result) => {
        if (Object.keys(result).length > 0) {
            chrome.storage.local.set({ "syncDataAvailable": true });
        }
    });

    chrome.storage.local.get(["storeLocation", "expire_password_minutes", "master_password_hash"]).then((result) => {
        document.getElementById("store_location").value = result["storeLocation"];
        document.getElementById("expirePasswordMinutes").value = (result["expire_password_minutes"] || 5);
        updateStyle(document.getElementById("password_expire_row"), "hidden", (result["storeLocation"] !== "memory_expire"));
        updateStyle(document.getElementById("master_password_row"), "hidden", (result["master_password_hash"] === undefined));
        document.getElementById("masterPassword").setAttribute("placeholder", "Encrypted In Storage");
        showSection("general_settings");
    }).then(() => {
        updateSyncStatus().then(() => {
            filterProfiles();
        });
    });
}

function showInformation() {
    showSection("general_information");
}

function showSection(showId) {
    document.getElementById("checkStrength").checked = false;
    showStrengthSection();
    Array.from(document.querySelectorAll("section")).concat(Array.from(document.querySelectorAll("aside"))).filter((el) => {
        return el.id !== showId;
    }).forEach((el) => el.style.display = "none");
    document.getElementById(showId).style.display = "block";
}

function highlightProfile() {
    document.querySelectorAll(".highlight").forEach((el) => el.classList.remove("highlight"));
    document.getElementById("profile_" + Settings.currentProfile).classList.add("highlight");
}

function updateStorageLocation() {
    var storeLocation = document.getElementById("store_location").value;
    chrome.storage.local.set({ "storeLocation": storeLocation }).then(() => {
        Settings.setStoreLocation(storeLocation);
        updateStyle(document.getElementById("password_expire_row"), "hidden", (storeLocation !== "memory_expire"));
    });
}

function saveProfile() {
    var selected = Settings.getProfile(Settings.currentProfile);

    selected.title          = document.getElementById("profileNameTB").value.trim();
    selected.siteList       = document.getElementById("siteList").value.trim().split(/\s+/).join(" ");
    selected.url_protocol   = document.getElementById("protocolCB").checked;
    selected.url_subdomain  = document.getElementById("subdomainCB").checked;
    selected.url_domain     = document.getElementById("domainCB").checked;
    selected.url_path       = document.getElementById("pathCB").checked;
    selected.strUseText     = document.getElementById("inputUseThisText").value.trim();
    selected.whereToUseL33t = document.getElementById("whereLeetLB").value;
    selected.l33tLevel      = document.getElementById("leetLevelLB").value;
    selected.hashAlgorithm  = document.getElementById("hashAlgorithmLB").value;
    selected.passwordLength = document.getElementById("passwdLength").value;
    selected.username       = document.getElementById("usernameTB").value.trim();
    selected.modifier       = document.getElementById("modifier").value.trim();
    selected.passwordPrefix = document.getElementById("passwordPrefix").value;
    selected.passwordSuffix = document.getElementById("passwordSuffix").value;
    selected.description    = document.getElementById("description").value;

    // make sure default profile siteList and strUseText stays blank/generic
    if (Settings.profiles[0].id === selected.id) {
        selected.siteList = "";
        selected.strUseText = "";
    }

    if (document.getElementById("charset").value === "Custom charset") {
        selected.selectedCharset = document.getElementById("customCharset").value;
    } else {
        selected.selectedCharset = document.getElementById("charset").value;
    }

    Settings.saveProfiles();
    updateProfileList().then(() => {
        setCurrentProfile(selected);
        highlightProfile();
        oldHashWarning(selected.hashAlgorithm);
    });
}

function cloneProfile() {
    var p = Object.assign(Object.create(Profile), Settings.getProfile(Settings.currentProfile));
    p.title = p.title + " Copy";
    Settings.addProfile(p);
    updateProfileList().then(() => {
        setCurrentProfile(p);
    });
}

function editProfile(event) {
    if (event.target.classList.contains("link")) {
        var targetId = event.target.id.slice(-1);
        setCurrentProfile(Settings.getProfile(targetId));
    }
}

function updateProfileList() {
    return chrome.storage.local.get(["alpha_sort_profiles"]).then((result) => {
        if (result["alpha_sort_profiles"]) Settings.alphaSortProfiles();

        document.getElementById("profile_list").replaceChildren();
        for (var i = 0; i < Settings.profiles.length; i++) {
            document.getElementById("profile_list").insertAdjacentHTML("beforeend", `<li><span id="profile_${Settings.profiles[i].id}" class="link">${Settings.profiles[i].title}</span></li>`);
        }
    });
}

function syncSucccess(syncPassHash) {
    Settings.saveSyncedProfiles(syncPassHash, Settings.encrypt(syncPassHash, JSON.stringify(Settings.profiles)));
    chrome.storage.local.set({ "sync_profiles": true, "sync_profiles_password": syncPassHash }).then(() => {
        updateProfileList().then(() => {
            document.getElementById("syncProfilesPassword").value = "";
            updateSyncStatus();
        });
    });
}

function setSyncPassword() {
    var syncPassValue = document.getElementById("syncProfilesPassword").value.trim();
    if (syncPassValue.length === 0) {
        alert("Please enter a password to enable sync");
        return;
    }

    chrome.storage.local.get(["syncDataAvailable", "synced_profiles"]).then((result1) => {
        var syncPassHash = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(syncPassValue));
        
        if (result1["syncDataAvailable"] === true) {
            if (result1["synced_profiles"]) {
                var profiles = Settings.decrypt(syncPassHash, result1["synced_profiles"]);
                if (profiles.length !== 0) {
                    Settings.loadProfilesFromString(profiles);
                    syncSucccess(syncPassHash);
                } else {
                    alert("Wrong password. Please specify the password you used when initially synced your data");
                }
            }
        } else {
            syncSucccess(syncPassHash);
        }
    });
}

function clearSyncData() {
    chrome.storage.sync.clear().then(() => {
        chrome.storage.local.remove(["syncDataAvailable", "sync_profiles", "synced_profiles", "synced_profiles_keys", "sync_profiles_password"]).then(() => {
            Settings.loadProfiles().then(() => {
                updateProfileList().then(() => {
                    updateSyncStatus();
                });
            });
        });
    });
}

function updateSyncStatus() {
    document.querySelectorAll("#sync_profiles_row, #no_sync_password, #sync_data_exists, #sync_password_set").forEach((el) => el.style.display = "none");
    document.getElementById("set_sync_password").classList.add("hidden");
    document.getElementById("clear_sync_data").classList.add("hidden");

    if (document.getElementById("syncProfiles").checked) {
        return chrome.storage.local.get(["syncDataAvailable", "sync_profiles_password", "synced_profiles"]).then((result) => {
            var syncHash = result["sync_profiles_password"] || "";
            var profiles = Settings.decrypt(syncHash, result["synced_profiles"]);
            if (profiles.length !== 0) {
                document.getElementById("sync_password_set").style.display = "";
                document.getElementById("clear_sync_data").classList.remove("hidden");
            } else if (result["syncDataAvailable"]) {
                document.querySelectorAll("#sync_profiles_row, #sync_data_exists").forEach((el) => el.style.display = "");
                document.querySelectorAll("#set_sync_password, #clear_sync_data").forEach((el) => el.classList.remove("hidden"));
            } else {
                document.querySelectorAll("#sync_profiles_row, #no_sync_password").forEach((el) => el.style.display = "");
                document.getElementById("set_sync_password").classList.remove("hidden");
            }
        });
    } else {
        return chrome.storage.local.remove(["sync_profiles", "sync_profiles_password"]).then(() => {
            Settings.loadProfiles().then(() => {
                updateProfileList();
            });
        });
    }
}

function updateMasterHash() {
    if (document.getElementById("keepMasterPasswordHash").checked) {
        document.getElementById("master_password_row").classList.remove("hidden");
        var master_pass = document.getElementById("masterPassword").value;
        if (master_pass.length > 0) {
            chrome.storage.local.set({ "master_password_hash": JSON.stringify(Settings.make_pbkdf2(master_pass)) });
        } else {
            chrome.storage.local.remove("master_password_hash");
        }
    } else {
        document.getElementById("master_password_row").classList.add("hidden");
        document.getElementById("masterPassword").value = "";
        chrome.storage.local.remove("master_password_hash");
    }
}

function updateHidePassword() {
    if (document.getElementById("hidePassword").checked) {
        chrome.storage.local.set({ "hide_generated_password": true });
    } else {
        chrome.storage.local.remove("hide_generated_password");
    }
}

function updateUseVerificationCode() {
    if (document.getElementById("useVerificationCode").checked) {
        chrome.storage.local.set({ "use_verification_code": true });
    } else {
        chrome.storage.local.remove("use_verification_code");
    }
}

function updateShowStrength() {
    if (document.getElementById("showPasswordStrength").checked) {
        chrome.storage.local.set({ "show_password_strength": true });
    } else {
        chrome.storage.local.remove("show_password_strength");
    }
}

function updateAlphaSortProfiles() {
    if (document.getElementById("alphaSortProfiles").checked) {
        chrome.storage.local.set({ "alpha_sort_profiles": true });
    } else {
        chrome.storage.local.remove("alpha_sort_profiles");
    }
    Settings.loadProfiles().then(() => {
        updateProfileList().then(() => {
            filterProfiles();
        });
    });
}

function sanitizePasswordLength() {
    var field = document.getElementById("passwdLength");
    if (field.value < 4) field.value = "4";
    if (field.value > 512) field.value = "512";
}

function sanitizeExpireTime(newExpireTime) {
    var field = document.getElementById("expirePasswordMinutes");
    if (newExpireTime < 1) {
        newExpireTime = 1;
        field.value = "1";
    }
    if (newExpireTime > 720) {
        newExpireTime = 720;
        field.value = "720";
    }
    newExpireTime = parseInt(newExpireTime, 10);
    field.value = newExpireTime;
    return newExpireTime;
}

function updateExpireTime() {
    chrome.storage.local.get(["expire_password_minutes", "storeLocation"]).then((result) => {
        var oldExpireTime = result["expire_password_minutes"] || 5;
        var newExpireTime = document.getElementById("expirePasswordMinutes").value;
        if (result["storeLocation"] === "memory_expire") {
            newExpireTime = sanitizeExpireTime(newExpireTime);
            if (newExpireTime !== oldExpireTime) {
                chrome.storage.local.set({ "expire_password_minutes": newExpireTime }).then(() => {
                    Settings.createExpirePasswordAlarm(newExpireTime);
                });
            }
        } else {
            chrome.alarms.clear("expire_password");
        }
    });
}

function fileImport() {
    var file = document.getElementById("fileInput").files[0];
    if ((/rdf|xml/i).test(file.type)) {
        var reader = new FileReader();
        reader.onload = () => {
            document.getElementById("importText").value = reader.result;
        };
        reader.readAsText(file);
    } else {
        document.getElementById("importText").value = "Please select an RDF or XML file containing PasswordMaker profile data.";
    }
}

function fileExport() {
    var textFileAsBlob = new Blob([document.getElementById("exportText").value], {
        type: "application/rdf+xml"
    });
    var downloadLink = document.createElement("a");
    downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
    downloadLink.download = "PasswordMaker.org Profile Data.rdf";
    downloadLink.click();
}

function showStrengthSection() {
    if (document.getElementById("checkStrength").checked) {
        document.getElementById("strength_section").style.display = "inline-block";
        document.querySelectorAll(".testInput").forEach((el) => {
            ["change", "keyup"].forEach((event) => el.addEventListener(event, checkPassStrength));
        });
        checkPassStrength();
    } else {
        document.getElementById("strength_section").style.display = "none";
        document.querySelectorAll(".testInput").forEach((el) => {
            ["change", "keyup"].forEach((event) => el.removeEventListener(event, checkPassStrength));
        });
        document.querySelectorAll(".strengthInput").forEach((el) => el.value = "");
    }
}

function filterProfiles() {
    var filter = document.getElementById("searchProfiles").value.toUpperCase();
    var list = document.getElementById("profile_list").getElementsByTagName("li");

    // Loop through all list items, and hide those which don't match the search query
    for (var i = 0; i < list.length; i++) {
        var itemId = list[i].getElementsByTagName("span")[0].id.slice(-1);
        var prof = Settings.getProfile(itemId);
        if (prof.title.toUpperCase().includes(filter) || prof.strUseText.toUpperCase().includes(filter) || prof.username.toUpperCase().includes(filter) || prof.description.toUpperCase().includes(filter) || prof.siteList.toUpperCase().includes(filter)) {
            list[i].style.display = "";
        } else {
            list[i].style.display = "none";
        }
    }
}

function checkPassStrength() {
    var selected = Settings.getProfile(Settings.currentProfile);

    selected.siteList       = document.getElementById("siteList").value.trim().replace(/[*?$+()^[\]\\|{},]/g, "").split(/\s+/).shift();
    selected.url_protocol   = document.getElementById("protocolCB").checked;
    selected.url_subdomain  = document.getElementById("subdomainCB").checked;
    selected.url_domain     = document.getElementById("domainCB").checked;
    selected.url_path       = document.getElementById("pathCB").checked;
    selected.strUseText     = document.getElementById("inputUseThisText").value.trim();
    selected.whereToUseL33t = document.getElementById("whereLeetLB").value;
    selected.l33tLevel      = document.getElementById("leetLevelLB").value;
    selected.hashAlgorithm  = document.getElementById("hashAlgorithmLB").value;
    selected.passwordLength = document.getElementById("passwdLength").value;
    selected.username       = document.getElementById("usernameTB").value.trim();
    selected.modifier       = document.getElementById("modifier").value.trim();
    selected.passwordPrefix = document.getElementById("passwordPrefix").value;
    selected.passwordSuffix = document.getElementById("passwordSuffix").value;

    if (document.getElementById("charset").value === "Custom charset") {
        selected.selectedCharset = document.getElementById("customCharset").value;
    } else {
        selected.selectedCharset = document.getElementById("charset").value;
    }

    if (selected.getText().length !== 0) {
        document.getElementById("testText").value = selected.getText();
    } else {
        document.getElementById("testText").value = selected.getUrl(selected.siteList);
    }

    document.getElementById("genPass").value = selected.getPassword(document.getElementById("testText").value, document.getElementById("testPass").value, selected.username);
    var values = Settings.getPasswordStrength(document.getElementById("genPass").value);
    document.querySelectorAll("#genStrength, #optionsMeter").forEach((el) => el.value = values.strength);
    document.getElementById("hasUpper").checked = values.hasUpper;
    document.getElementById("hasLower").checked = values.hasLower;
    document.getElementById("hasDigit").checked = values.hasDigit;
    document.getElementById("hasSymbol").checked = values.hasSymbol;
}

document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.local.get(["storeLocation"]).then((result) => {
        if (result["storeLocation"] === undefined) {
            chrome.storage.local.set({ "storeLocation": "memory" });
        }
        Settings.migrateFromStorage();

        Settings.loadProfiles().then(() => {
            updateProfileList().then(() => {
                setCurrentProfile(Settings.profiles[0]);
            });

            chrome.storage.local.get(["hide_generated_password", "sync_profiles", "master_password_hash", "use_verification_code", "show_password_strength", "alpha_sort_profiles"]).then((result) => {
                document.getElementById("hidePassword").checked = result["hide_generated_password"];
                document.getElementById("keepMasterPasswordHash").checked = result["master_password_hash"];
                document.getElementById("useVerificationCode").checked = result["use_verification_code"];
                document.getElementById("showPasswordStrength").checked = result["show_password_strength"];
                document.getElementById("syncProfiles").checked = result["sync_profiles"];
                document.getElementById("alphaSortProfiles").checked = result["alpha_sort_profiles"];
            });

            document.getElementById("profile_list").addEventListener("click", (event) => editProfile(event));
            document.getElementById("add").addEventListener("click", addProfile);
            document.getElementById("showImport").addEventListener("click", showImport);
            document.getElementById("showExport").addEventListener("click", showExport);
            document.getElementById("showSettings").addEventListener("click", showOptions);
            document.getElementById("showInformation").addEventListener("click", showInformation);

            document.getElementById("protocolCB").addEventListener("change", updateExample);
            document.getElementById("subdomainCB").addEventListener("click", updateExample);
            document.getElementById("domainCB").addEventListener("click", updateExample);
            document.getElementById("pathCB").addEventListener("click", updateExample);
            document.getElementById("whereLeetLB").addEventListener("change", updateLeet);
            document.getElementById("charset").addEventListener("change", updateCustomCharsetField);
            document.getElementById("passwdLength").addEventListener("blur", sanitizePasswordLength);

            document.getElementById("cloneProfileButton").addEventListener("click", cloneProfile);
            document.getElementById("checkStrength").addEventListener("change", showStrengthSection);
            document.getElementById("remove").addEventListener("click", removeProfile);
            document.getElementById("save").addEventListener("click", saveProfile);
            document.getElementById("importButton").addEventListener("click", importRdf);
            document.getElementById("fileInput").addEventListener("change", fileImport);
            document.getElementById("copyButton").addEventListener("click", copyRdfExport);
            document.getElementById("exportFileButton").addEventListener("click", fileExport);

            document.getElementById("store_location").addEventListener("change", updateStorageLocation);
            document.getElementById("expirePasswordMinutes").addEventListener("change", updateExpireTime);
            document.getElementById("hidePassword").addEventListener("change", updateHidePassword);
            document.getElementById("keepMasterPasswordHash").addEventListener("change", updateMasterHash);
            document.getElementById("syncProfiles").addEventListener("change", updateSyncStatus);
            document.getElementById("masterPassword").addEventListener("keyup", updateMasterHash);
            document.getElementById("useVerificationCode").addEventListener("change", updateUseVerificationCode);
            document.getElementById("showPasswordStrength").addEventListener("change", updateShowStrength);
            document.getElementById("alphaSortProfiles").addEventListener("change", updateAlphaSortProfiles);
            document.getElementById("set_sync_password").addEventListener("click", setSyncPassword);
            document.getElementById("syncProfilesPassword").addEventListener("keydown", (event) => {
                if (event.code === "Enter") setSyncPassword();
            })
            document.getElementById("clear_sync_data").addEventListener("click", clearSyncData);
            document.getElementById("resetToDefaultprofiles").addEventListener("click", removeAllProfiles);
            document.getElementById("searchProfiles").addEventListener("input", filterProfiles);
        });
    });
});
