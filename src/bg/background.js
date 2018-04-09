import {isGithubPRUrl} from '../util/common';

function toggleExtension(url, tabId) {
  if (isGithubPRUrl(url)) {
    changeIcon('disabled', tabId);
    setPopup('disabled', tabId);
  } else {
    changeIcon('inactive', tabId);
    setPopup('inactive', tabId);
  }
}

function changeIcon(state, tabId) {
  const smallImage = {
    enabled: 'icons/turbopr19.png',
    disabled: 'icons/turbopr19_disabled.png',
    inactive: 'icons/turbopr19_inactive.png'
  }

  const largeImage = {
    enabled: 'icons/turbopr38.png',
    disabled: 'icons/turbopr38_disabled.png',
    inactive: 'icons/turbopr38_inactive.png'
  }

  chrome.pageAction.setIcon({
    path: {
      '19': smallImage[state],
      '38': largeImage[state]
    },
    tabId
  });
}

function setPopup(state, tabId) {
  let popup;
  if (state === 'inactive') {
    popup = 'src/page_action/inactive_action.html';
  } else {
    popup = '';
  }
  chrome.pageAction.setPopup({
    popup,
    tabId
  });
}

chrome.pageAction.onClicked.addListener(function(tab) {
  // Send a message to the active tab
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, {'message': 'toggle_extension'});
  });
});

//listener to update icon based on enabled or disabled state
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    const {url, tab} = sender;
    const {message, state} = request;
    const tabId = tab.id;

    if (message === 'show_extension') {
      chrome.pageAction.show(tabId)
      toggleExtension(url, tabId);
    } else if (message === 'change_state') {
      const title = state === 'enabled' ? 'Disable Turbo PR' : 'Enable Turbo PR';

      changeIcon(state, tabId);

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

    //toggle extension before leaving the page
    if (!isGithubPRUrl(url)) {
      chrome.tabs.sendMessage(tabId, {'message': 'handle_outbound_navigation'});
    }
});
