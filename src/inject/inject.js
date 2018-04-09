import GithubTurboPr from './turbo_pr';

let turboPr;

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.message === 'toggle_extension') {
      if (!turboPr) turboPr = new GithubTurboPr();
      turboPr.toggle();
    } else if (request.message === 'handle_outbound_navigation' && turboPr && turboPr.enabled) {
      //refresh page to reset the states other wise back navigation breaks the page
      document.location.reload(true);
    }
  }
);

chrome.extension.sendMessage({'message': 'show_extension'});
