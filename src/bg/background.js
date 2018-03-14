const githubRegex = /^https:\/\/github.com\/.*?\/pull\/.*?\/files.*$/;

function toggleExtension(url, tabId) {
  if (url.match(githubRegex)) {
    chrome.pageAction.show(tabId);
  } else {
    chrome.pageAction.hide(tabId);
  }
}

chrome.pageAction.onClicked.addListener(function(tab) {
  // Send a message to the active tab
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, {"message": "toggle_extension"});
  });
});

//listener to update icon based on enabled or disabled state
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    const {url, tab} = sender;
    const {message, enabled} = request;
    const tabId = tab.id;

    if (message === "show_extension") {
      toggleExtension(url, tabId);
    } else if (message === "change_icon") {
      const iconSmall = enabled ? 'icons/turbopr19.png' : 'icons/turbopr19_disabled.png';
      const iconBig = enabled ? 'icons/turbopr38.png' : 'icons/turbopr38_disabled.png';
      const title = enabled ? 'Disable Turbo PR' : 'Enable Turbo PR';
      chrome.pageAction.setIcon({
        path: {
          '19': iconSmall,
          '38': iconBig
        },
        tabId
      });
      chrome.pageAction.setTitle({
        title,
        tabId
      })
    }
  }
);

chrome.webNavigation.onHistoryStateUpdated.addListener(function(details) {
    const {url, tabId} = details;
    toggleExtension(url, tabId);

    //toggele extension before leaving the page
    if (!url.match(githubRegex)) {
      chrome.tabs.sendMessage(tabId, {"message": "handle_outbound_navigation"});
    }
});
