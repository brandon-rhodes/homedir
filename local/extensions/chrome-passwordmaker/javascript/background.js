function updateSyncedProfiles(changes) {
    chrome.storage.local.remove("synced_profiles_keys").then(() => {
        if (changes["synced_profiles"] && changes["synced_profiles"].length !== 0) {
            chrome.storage.local.set(changes);
        } else if (Array.isArray(changes["synced_profiles_keys"])) {
            var profiles = "";
            for (var key in changes["synced_profiles_keys"]) {
                profiles += changes[changes["synced_profiles_keys"][key]];
            }
            chrome.storage.local.set({ "synced_profiles": profiles, "synced_profiles_keys": changes["synced_profiles_keys"] });
        } else if (typeof changes === "string") {
            chrome.storage.local.set({ "synced_profiles": changes });
        }
    });
}

chrome.storage.sync.get().then((data) => {
    updateSyncedProfiles(data);
});

chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === "sync") {
        if (changes["synced_profiles"] && changes["synced_profiles"]["newValue"]) {
            var flattened = {};
            Object.keys(changes).forEach((key) => {
                flattened[key] = changes[key]["newValue"];
            });

            updateSyncedProfiles(flattened);
        }
        if (changes["synced_profiles_keys"] && changes["synced_profiles_keys"]["newValue"]) {
            var profiles = "";
            Object.keys(changes).forEach((key) => {
                if (!isNaN(parseInt(key))) {
                    profiles += changes[key]["newValue"];
                }
            });

            updateSyncedProfiles(profiles);
        }
    }
});

chrome.alarms.onAlarm.addListener(alarm => {
    if (alarm.name === "expire_password") {
        chrome.storage.session.set({ "password": "" });
    }
});

chrome.runtime.onStartup.addListener(() => {
    chrome.storage.local.get(["store_location"]).then((result) => {
        if ((/memory/i).test(result.store_location)) {
            chrome.storage.session.set({ "password": "" });
        }
    })
});
