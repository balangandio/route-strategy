class _Utils {
	toggleClassName(elem, className) {
		this.hasClassName(elem, className)
				? this.addClassName(elem, className)
				: this.removeClassName(elem, className);

		return this.hasClassName(elem, className);
	}

	removeClasses(className) {
		var elements = document.getElementsByClassName(className);
		for (let i = 0; i < elements.length; i++) {
			this.removeClassName(elements[i], className);
		}
	}

	removeClassName(elem, className) {
		elem.className = elem.className.replace(className, '').trim();
	}

	addClassName(elem, className) {
		if (!this.hasClassName(elem, className)) {
			elem.className = elem.className + ' ' + className;
		}
	}

	hasClassName(elem, className) {
		return elem.className.indexOf(className) != -1;
	}

	setEnableClassName(enabled, elem, className) {
		enabled ? this.addClassName(elem, className) : this.removeClassName(elem, className);
	}

	getElementById(elementId, callback) {
		let elem = document.getElementById(elementId);

		return callback == undefined ? elem : callback(elem);
	}

	getElementByClassName(className, callback) {
		let elements = document.getElementsByClassName(className);

		if (elements.length > 1) {
			throw `<#> more than one element with [${className}]`;
		}

		return callback == undefined ? elements[0] : callback(elements[0]);
	}

	toList(collection) {
		let list = [];
		for (let i = 0; i < collection.length; i++) {
			list.push(collection[i]);
		}

		return list;
	}
}

const Utils = new _Utils();

export default Utils;