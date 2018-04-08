export function appendChildren(parent, children){
  const documentFragment = document.createDocumentFragment();
  Array.from(children).forEach((child) => {
    documentFragment.appendChild(child);
  });
  parent.appendChild(documentFragment);
}

export function setElemDimension(elem) {
  elem.style.height = `${elem.scrollHeight}px`;
}

export function removeFixedDimension(elem) {
  elem.style.height = '';
}

export function removeChildren(elem) {
	const children = Array.from(elem.children);
	let child;
	while(child = elem.lastChild) {
		elem.removeChild(child)
	}
}