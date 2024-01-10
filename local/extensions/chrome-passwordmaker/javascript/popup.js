function setPasswordColors(foreground, background) {
    document.querySelectorAll("#generated, #password, #confirmation").forEach((el) => {
        el.style.backgroundColor = background;
        el.style.color = foreground;
    });
}

function getAutoProfileIdForUrl() {
    for (var i = 0; i < Settings.profiles.length; i++) {
        var profile = Settings.profiles[i];
        if (profile.siteList.trim().length !== 0) {
            var sites = profile.siteList.trim().split(/\s+/);
            for (var j = 0; j < sites.length; j++) {
                var regexString = /\s/;
                if ((/^\/.*\/.*$/).test(sites[j])) {
                    try {
                        regexString = new RegExp(sites[j].replace(/^\/|\/.*$/g, ""));
                    } catch (e) { void(0) }
                }
                var plain2regex = sites[j];
                plain2regex = plain2regex.replace(/[$+()^[\]\\|{},]/g, "");
                plain2regex = plain2regex.replace(/\?/g, ".");
                plain2regex = plain2regex.replace(/\*/g, ".*");
                var wildcardString = new RegExp(plain2regex, "i");

                if (regexString.test(Settings.currentUrl) || wildcardString.test(Settings.currentUrl)) {
                    return profile.id;
                }
            }
        }
    }
}

function passwordFieldSuccess() {
    var profile = Settings.getProfile(document.getElementById("profile").value);
    var profileResult = profile.getPassword(document.getElementById("usedtext").value, document.getElementById("password").value, document.getElementById("username").value);
    document.getElementById("generated").value = profileResult;
    setPasswordColors("#008000", "#FFFFFF");
    document.querySelectorAll("#password, #confirmation").forEach((el) => el.removeAttribute("style"));
    showButtons();
    return Settings.getPasswordStrength(profileResult).strength;
}

function updateFields() {
    var passwordEl = document.getElementById("password");
    var confirmationEl = document.getElementById("confirmation");
    var passStrength = 0;

    chrome.storage.local.get(["master_password_hash", "show_password_strength", "storeLocation", "use_verification_code"]).then((result) => {
        if (passwordEl.value.length === 0) {
            document.getElementById("generated").value = "Please Enter Password";
            setPasswordColors("#000000", "#85FFAB");
            hideButtons();
        } else if (result["master_password_hash"]) {
            var saved = JSON.parse(result["master_password_hash"]);
            var derived = Settings.make_pbkdf2(passwordEl.value, saved.salt, saved.iter);
            if (derived.hash !== saved.hash) {
                document.getElementById("generated").value = "Master Password Mismatch";
                setPasswordColors("#FFFFFF", "#FF7272");
                hideButtons();
            } else {
                passStrength = passwordFieldSuccess();
            }
        } else if (!result["use_verification_code"] && !result["master_password_hash"] && (passwordEl.value !== confirmationEl.value)) {
            document.getElementById("generated").value = "Passwords Don't Match";
            setPasswordColors("#FFFFFF", "#FF7272");
            hideButtons();
        } else {
            passStrength = passwordFieldSuccess();
        }

        if (result["show_password_strength"]) {
            document.getElementById("popupMeter").value = passStrength;
            document.getElementById("strengthValue").textContent = passStrength;
        }

        if (result["use_verification_code"]) {
            document.getElementById("verificationCode").value = getVerificationCode(passwordEl.value);
        }

        Settings.setPassword(passwordEl.value);

        if (passwordEl.value === "") {
            passwordEl.focus();
        }
    });
}

function delayedUpdate() {
    clearTimeout(window.delayedUpdateID);
    window.delayedUpdateID = setTimeout(updateFields, 800);
}

function updateProfileText() {
    var profile = Settings.getProfile(document.getElementById("profile").value);
    // Store either matched url or, if set, use profiles own "use text"
    if (profile.getText().length !== 0) {
        document.getElementById("usedtext").value = profile.getText();
    } else {
        document.getElementById("usedtext").value = profile.getUrl(Settings.currentUrl);
    }
    if (profile.getUsername().length !== 0) {
        document.getElementById("username").value = profile.getUsername();
    } else {
        document.getElementById("username").value = "";
    }
}

function onProfileChanged() {
    updateProfileText();
    updateFields();
}

function hideButtons() {
    var copyPassEl = document.getElementById("copypassword");
    if (!copyPassEl.classList.contains("hidden")) {
        copyPassEl.classList.add("hidden");
        
    }
    var injectPassEl = document.getElementById("injectpassword");
    if (!injectPassEl.classList.contains("hidden")) {
        injectPassEl.classList.add("hidden");
    }
}

function showButtonsScript() {
    var fields = document.getElementsByTagName("input"), fieldCount = 0;
    for (var i = 0; i < fields.length; i++) {
        if (/password/i.test(fields[i].type + ' ' + fields[i].name)) {
            fieldCount += 1;
        }
    }
    return fieldCount;
}

function showButtons() {
    document.getElementById("copypassword").classList.remove("hidden");
    // Don't run executeScript() on built-in chrome://, opera:// or about:// browser pages since it isn't allowed anyway
    // Also cant run on the Chrome Web Store/Extension Gallery
    if (!(/^about|^chrome|^edge|^opera|(chrome|chromewebstore)\.google\.com|.*extension:/i).test(Settings.currentUrl)) {
        chrome.tabs.query({active: true, currentWindow: true}).then((tabs) => {
            chrome.scripting.executeScript({
                target: {tabId: tabs[0].id, allFrames: true},
                func: showButtonsScript,
            }).then((fieldCounts) => {
                for (var frame = 0; frame < fieldCounts.length; frame++) {
                    if (fieldCounts[frame].result > 0) {
                        document.getElementById("injectpassword").classList.remove("hidden");
                    }
                }
            }).catch((err) => {
                console.log("Show button error: " + err.message);
            });
        });
    }
}

function fillFieldsScript(args) {
    // base-64 encode & decode password, string concatenation of a pasword that includes quotes here won't work
    var fields = document.getElementsByTagName("input");
    var nameFilled = false, passFilled = false;
    function isRendered(domObj) {
        var cs = document.defaultView.getComputedStyle(domObj);
        if ((domObj.nodeType !== 1) || (domObj == document.body)) return true;
        if (cs.display !== "none" && cs.visibility !== "hidden") return isRendered(domObj.parentNode);
        return false;
    }
    for (var i = 0; i < fields.length; i++) {
        var elStyle = getComputedStyle(fields[i]);
        var isVisible = isRendered(fields[i]) && (parseFloat(elStyle.width) > 0) && (parseFloat(elStyle.height) > 0);
        var isPasswordField = (/password/i).test(fields[i].type + ' ' + fields[i].name);
        var isUsernameField = (/id|un|name|user|usr|log|email|mail|acct|ssn/i).test(fields[i].name) && (/^(?!display)/i).test(fields[i].name);
        var changeEvent = new Event("change"); // MVC friendly way to force a view-model update
        if (isVisible && !passFilled && fields[i].value.length === 0 && isPasswordField) {
            fields[i].value = args[0];
            passFilled = true;
            fields[i].dispatchEvent(changeEvent);
        }
        if (isVisible && !nameFilled && fields[i].value.length === 0 && isUsernameField) {
            fields[i].value = args[1];
            if (fields[i].value.length === 0) {
                fields[i].focus();
            }
            nameFilled = true;
            fields[i].dispatchEvent(changeEvent);
        }
    }
}

function fillFields(generatedPass) {
    updateFields();
    // Don't run executeScript() on built-in chrome://, opera:// or about:// browser pages since it isn't allowed anyway
    // Also cant run on the Chrome Web Store/Extension Gallery
    if (!(/^about|^chrome|^edge|^opera|(chrome|chromewebstore)\.google\.com|.*extension:/i).test(Settings.currentUrl)) {
        chrome.tabs.query({active: true, currentWindow: true}).then((tabs) => {
            chrome.scripting.executeScript({
                target: {tabId: tabs[0].id, allFrames: true},
                args : [ generatedPass ],
                func: fillFieldsScript,
            }).then(() => {
                window.close();
            }).catch((err) => {
                console.log("Fill field error: " + err.message);
            });
        });
    }
}

function copyPassword() {
    updateFields();
    chrome.tabs.query({
        "windowType": "popup"
    }).then(() => {
        navigator.clipboard.writeText(document.getElementById("generated").value).then(() => {
            window.close();
        });
    });
}

function openOptions() {
    chrome.runtime.openOptionsPage();
    window.close();
}

function getVerificationCode(password) {
    var p = Object.create(Profile);
    p.hashAlgorithm = "sha256";
    p.passwordLength = 3;
    p.selectedCharset = CHARSET_OPTIONS[4];
    return p.getPassword("", password, "");
}

function showPasswordField() {
    document.getElementById("activatePassword").style.display = "none";
    document.getElementById("generated").style.display = "";
    chrome.storage.local.get(["show_password_strength"]).then((result) => {
        if (result["show_password_strength"]) {
            document.getElementById("strength_row").style.display = "";
        }
    });
}

function handleKeyPress(event) {
    var generatedElVal = document.getElementById("generated").value;
    var usernameElVal = document.getElementById("username").value;
    if (/Enter/.test(event.code) && !(/select/i).test(event.target.tagName)) {
        if ((/Password/).test(generatedElVal)) {
            if (document.getElementById("confirmation").style.display !== "none") {
                document.getElementById("confirmation").focus();
            }
        } else {
            fillFields([generatedElVal, usernameElVal]);
        }
    }

    // ctrl/option + c to copy the password to clipboard and close the popup
    if ((event.ctrlKey || event.metaKey) && event.code === "KeyC") {
        copyPassword();
    }
}

function sharedInit(decryptedPass) {
    chrome.storage.local.get(["alpha_sort_profiles"]).then((result) => {
        document.getElementById("password").value = decryptedPass;
        document.getElementById("confirmation").value = decryptedPass;

        if (result["alpha_sort_profiles"]) Settings.alphaSortProfiles();
        Settings.profiles.forEach((profile) => {
            document.getElementById("profile").appendChild(new Option(profile.title, profile.id));
        });
        document.getElementById("profile").value = (getAutoProfileIdForUrl() || Settings.profiles[0].id);

        updateProfileText();
        updateFields();
    });
}

function initPopup() {
    chrome.storage.local.get(["storeLocation"]).then((result) => {
        switch (result["storeLocation"]) {
            case "memory":
            case "memory_expire":
                chrome.storage.session.get(["password", "password_key"]).then((result) => {
                    sharedInit(Settings.decrypt(result["password_key"], result["password"]));
                });
                break;
            case "disk":
                chrome.storage.local.get(["password_key", "password_crypt"]).then((result) => {
                    sharedInit(Settings.decrypt(result["password_key"], result["password_crypt"]));
                });
                break;
            case "never":
                sharedInit("");
                break;
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.local.get(["storeLocation"]).then((result) => {
        if (result["storeLocation"] === undefined) {
            chrome.storage.local.set({ "storeLocation": "memory" });
        }
        Settings.migrateFromStorage();

        Settings.loadProfiles().then(() => {
            document.querySelectorAll("#password, #confirmation").forEach((el) => el.addEventListener("keyup", Settings.setPassword));
            document.querySelectorAll("input").forEach((el) => el.addEventListener("input", delayedUpdate));
            document.getElementById("profile").addEventListener("change", onProfileChanged);
            document.getElementById("activatePassword").addEventListener("click", showPasswordField);
            document.getElementById("copypassword").addEventListener("click", copyPassword);
            document.getElementById("options").addEventListener("click", openOptions);

            chrome.storage.local.get(["hide_generated_password", "master_password_hash", "use_verification_code", "show_password_strength"]).then((result) => {
                if (result["hide_generated_password"] === true) {
                    document.querySelectorAll("#generated, #strength_row").forEach((el) => el.style.display = "none");
                } else {
                    document.getElementById("activatePassword").style.display = "none";
                }

                if (result["master_password_hash"] || result["use_verification_code"] === true) {
                    document.getElementById("confirmation_row").style.display = "none";
                }

                if (!result["use_verification_code"]) {
                    document.getElementById("verification_row").style.display = "none";
                }

                if (!result["show_password_strength"]) {
                    document.getElementById("strength_row").style.display = "none";
                }
            });

            chrome.tabs.query({
                "active": true,
                "currentWindow": true,
                "windowType": "normal"
            }).then((tabs) => {
                Settings.currentUrl = tabs[0].url || "";
                initPopup();
            });

            document.getElementById("injectpassword").addEventListener("click", () => {
                fillFields([document.getElementById("generated").value, document.getElementById("username").value]);
            });

            document.body.addEventListener("keydown", handleKeyPress);
        });
    });
});
