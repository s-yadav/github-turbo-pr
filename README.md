# github-turbo-pr
Chrome extension to optimize github for handling big pull request. 🚀

Github pull request page gets unresponsive on a big PR and makes it very hard to review. This extension optimize the page to make it more responsive so that you spend less time reviewing code and more time drinking beer 🍻.

### Installation
Download extension on
[Chrome WebStore](https://chrome.google.com/webstore/detail/github-turbo-pr/bajlfgjogojcoiijmmjeppgmppcdbbfb)

### Usage
For non Pull Request page the extension will be disabled <img height="16" src="./icons/turbopr38_inactive.png" alt="inactive"/>.
On a PR compare page it will get active but by default it will be disabled <img height="16" src="./icons/turbopr38_disabled.png" alt="disabled"/>.
If you feel your page is getting slow on a big PR you can click and enable (<img height="16" src="./icons/turbopr38.png" alt="enabled"/>) it. You can toggle it back if you want.

### How does it optimize?
It applies a simple trick by detaching file diffs which are not visible and reattach them when they are about to come on viewport. Less DOM nodes in a DOM Tree, more performant the page it. And it does it performantly using [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API).

### Known caveats.
- As for optimization it detaches file diff from the page, browser find will not work as expected. Though you can search with a file name but not the content.
- Count in Review changes gets incorrect, but actually it does not affect any review comments. So don't get scared if number shows wrong.

### Show your support
[:star: this repo](https://github.com/s-yadav/github-turbo-pr)
