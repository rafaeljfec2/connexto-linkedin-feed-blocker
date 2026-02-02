chrome.storage.local.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local" || !changes.blockedPosts) return;
  const list = changes.blockedPosts.newValue ?? [];
  const count = list.length;
  if (count > 0) {
    chrome.action.setBadgeText({ text: String(count) });
    chrome.action.setBadgeBackgroundColor({ color: "#0a66c2" });
  } else {
    chrome.action.setBadgeText({ text: "" });
  }
});

chrome.storage.local.get(["blockedPosts"], (result) => {
  const list = result.blockedPosts ?? [];
  if (list.length > 0) {
    chrome.action.setBadgeText({ text: String(list.length) });
    chrome.action.setBadgeBackgroundColor({ color: "#0a66c2" });
  }
});
