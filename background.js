function updateBadge() {
  chrome.storage.sync.get(["settings"], (syncResult) => {
    const settings = syncResult.settings ?? {};
    const paused = Boolean(settings.paused);
    const badgeWhenPaused = settings.badgeWhenPaused ?? "hide";

    if (paused) {
      if (badgeWhenPaused === "showPaused") {
        chrome.action.setBadgeText({ text: "OFF" });
        chrome.action.setBadgeBackgroundColor({ color: "#6b7280" });
      } else {
        chrome.action.setBadgeText({ text: "" });
      }
      return;
    }

    chrome.storage.local.get(["blockedPosts"], (result) => {
      const list = result.blockedPosts ?? [];
      const count = list.length;
      if (count > 0) {
        chrome.action.setBadgeText({ text: String(count) });
        chrome.action.setBadgeBackgroundColor({ color: "#0a66c2" });
      } else {
        chrome.action.setBadgeText({ text: "" });
      }
    });
  });
}

chrome.storage.local.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && changes.blockedPosts) updateBadge();
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "sync" && changes.settings) updateBadge();
});

chrome.storage.sync.get(["settings"], () => {});
chrome.storage.local.get(["blockedPosts"], () => updateBadge());
