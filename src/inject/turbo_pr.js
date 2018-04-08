import {
  debounce, 
  throttle
} from '../util/common';

import {
  appendChildren,
  setElemDimension, 
  removeFixedDimension, 
  removeChildren
} from '../util/dom_util';

export default class GithubTurboPr {
	constructor() {
		this.allContents = [];
		this.fileContentMap = new WeakMap();
    this.scrollObserver = this.getScrollObserver();
    this.documentTimeoutId = undefined;
    this.documentRafId = undefined;
    this.enabled = false;

    this.observeDocumentHeight = this.observeDocumentHeight.bind(this);
    
    this.toggle = throttle(this.toggle.bind(this), 1000);

    let lastWindowWidth = window.innerWidth;

    this.resizeHandler = debounce(() => {
      const newWidth = window.innerWidth;
      if (newWidth !== lastWindowWidth) {
        this.allContents.forEach((elem) => {
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
    removeChildren(elem);
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
    this.enabled = true;

  	this.allContents = this.getFileContents();

  	//observe files
  	this.observe();

  	//observe document height and if file count changes start observing new files
  	this.observeDocumentHeight();

    //handle case when window is resized horizontally due to which the files height is changing
  	window.addEventListener('resize', this.resizeHandler);
  }

  disable() {
    this.enabled = false;

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

    //stop listening resize event
    window.removeEventListener('resize', this.resizeHandler);
  }

  toggle() {
    const {enabled} = this;

    const nextState = enabled ? 'disabled' : 'enabled';

    chrome.runtime.sendMessage({'message': 'change_state', 'state': nextState});

    if (enabled) {
      this.disable();
    } else {
      this.enable();
    }
  }
}