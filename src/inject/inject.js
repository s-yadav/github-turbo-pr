function appendChildren(parent, children){
  const documentFragment = document.createDocumentFragment();
  Array.from(children).forEach((child) => {
    documentFragment.appendChild(child);
  });
  parent.appendChild(documentFragment);
}


function debounce(fn, time) {
  let timeout;
  return function() {
    clearTimeout(timeout);
    timeout = setTimeout(fn, time);
  }
}

function setElemDimension(elem) {
  elem.style.height = `${elem.scrollHeight}px`;
}

function removeFixedDimension(elem) {
  elem.style.height = '';
}

function removeChilds(elem) {
	const children = Array.from(elem.children);
	let child;
	while(child = elem.lastChild) {
		elem.removeChild(child)
	}
}

class GithubTurboPr {
	constructor() {
		this.allContents = [];
		this.fileContentMap = new WeakMap();
    this.scrollObserver = this.getScrollObserver();
    this.documentTimeoutId = undefined;
    this.documentRafId = undefined;
    this.enabled = false;

    this.observeDocumentHeight = this.observeDocumentHeight.bind(this);

    let lastWindowWidth = window.innerWidth;

    this.scrollHandler = debounce(() => {
      const newWidth = window.innerWidth;
      if (newWidth !== lastWindowWidth) {
        allContents.forEach((elem) => {
          const {isInView} = fileContentMap.get(elem);
          if (isInView) return;

          this.showFileContent(elem);
          setElemDimension(elem);
          this.hideFileContent(elem);
        });
      }
    }, 1000)
	}
  getFileContents() {
    return Array.from(document.querySelectorAll('.js-file-content'));
  }

  showFileContent(elem) {
    const contentObj = this.fileContentMap.get(elem);

    //add children
    appendChildren(elem, contentObj.children);
  }
  hideFileContent(elem) {
    removeChilds(elem);
  }
  observe() {
    const {fileContentMap, allContents} = this;
    this.allContents.forEach((elem) => {
      if (fileContentMap.get(elem)) return;

      setElemDimension(elem);

      //save file reference on map
      fileContentMap.set(elem, {
        children: Array.from(elem.childNodes)
      });

      this.scrollObserver.observe(elem);
    })
  }
  observeDocumentHeight() {
    const allContents = this.getFileContents();

    if (allContents.length !== this.allContents.length) {
      this.allContents = allContents;
      this.observe();
    }

    this.documentTimeoutId = setTimeout(() => {
      this.documentRafId = window.requestAnimationFrame(this.observeDocumentHeight)
    }, 1000);
  }

  getScrollObserver() {
    return new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const {target, isIntersecting} = entry;
        const content = entry.target;
        const contentObj = this.fileContentMap.get(content);

        if (isIntersecting) {
          //show file and remove the dimension so it can handle
          // any dimension change without any wiring
          this.showFileContent(content);
          removeFixedDimension(content);
        } else {
          //before hiding the file set dimension on it
          setElemDimension(content);
          this.hideFileContent(content);
        }

        this.fileContentMap.set(content, {
          ...contentObj,
          isInView: isIntersecting
        });

      })
    }, {root: null, rootMargin: '600px 0px 600px 0px'})
  }

  enable() {
    //clear old things before if any before enabling
    this.clear();

    this.enabled = true;

  	this.allContents = this.getFileContents();

  	//observe files
  	this.observe();

  	//observe document height and if file count changes start observing new files
  	this.observeDocumentHeight();

    //handle case when window is resized horizontally due to which the files height is changing
  	window.addEventListener('resize', this.scrollHandler);
  }

  clear() {
    //reset file content and stop observing
    this.allContents.forEach((elem) => {
      this.showFileContent(elem);

      this.scrollObserver.unobserve(elem);
    });

    //reset WeakMap
    this.fileContentMap = new WeakMap();

    //stop watching for document height changes
    clearTimeout(this.documentTimeoutId);
    window.cancelAnimationFrame(this.documentRafId);

    //stop listining resize event
    window.removeEventListener('resize', this.scrollHandler);
  }

  disable() {
    this.enabled = false;

    this.clear();
  }
}

const turboPr = new GithubTurboPr();

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.message === "toggle_extension") {

      if (turboPr.enabled) {
        turboPr.disable();
      } else {
        turboPr.enable();
      }

      chrome.runtime.sendMessage({"message": "change_icon", "enabled": turboPr.enabled});
    }
  }
);

chrome.extension.sendMessage({"message": "show_extension"});
