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
    if (request.message === "show_extension") {
      toggleExtension(url, tab.id);
    } else if ( request.message === "change_icon" ) {
      const iconSmall = request.enabled ? 'icons/turbopr19.png' : 'icons/turbopr19_disabled.png';
      const iconBig = request.enabled ? 'icons/turbopr38.png' : 'icons/turbopr38_disabled.png';
      chrome.pageAction.setIcon({
        path: {
          '19': iconSmall,
          '38': iconBig
        },
        tabId: tab.id
      });
    }
  }
);

chrome.webNavigation.onHistoryStateUpdated.addListener(function(details) {
    const {url, tabId} = details;
    toggleExtension(url, tabId);

    //toggele extension before leaving the page
    if (!url.match(githubRegex)) {
      //chrome.tabs.sendMessage(tabId, {"message": "toggle_extension", disable: true});
    }
});
