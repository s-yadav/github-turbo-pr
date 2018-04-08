const githubRegex = /^https:\/\/github.com\/.*?\/pull\/.*?\/files.*$/;

export function isGithubPRUrl(url) {
  return !!url.match(githubRegex);
}

export function debounce(fn, time) {
  let timeout;
  return function() {
    clearTimeout(timeout);
    timeout = setTimeout(fn, time);
  }
}

export function throttle(fn, time) {
  let lastTime = 0;
  return function() {
    const currentTime = Date.now();
    if (currentTime - lastTime > time) {
      fn();
      lastTime = currentTime;
    }
  }
}
