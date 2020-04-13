class RouteHandler {
	constructor(prefixRegex) {
		this.prefixRegex = prefixRegex;
	}

	handle(path, routeData) {}

	match(url) {
		return this.prefixRegex.test(url);
	}
}


class SubHandle extends RouteHandler {
	constructor(urlName, handles) {
		super(new RegExp(`^\/${urlName}(\/.*)?$`));
		this.subHandles = handles;
	}

	handle(url, routeData) {
		let matchResult = this.prefixRegex.exec(url);
		let path = matchResult[1];
		let subHandle = this._findMatchingOne(path);

		subHandle.handle(path, routeData);
	}

	match(url) {
		let matchResult = this.prefixRegex.exec(url);

		if (matchResult != null && matchResult.length == 2) {
			return this._anyPageMatch(matchResult[1]);
		}

		return false;
	}

	_anyPageMatch(path) {
		return this._findMatchingOne(path) != null;
	}

	_findMatchingOne(path) {
		let matchingOnes = this.subHandles.filter(page => page.match(path));
		return matchingOnes.length > 0 ? matchingOnes[0] : null;
	}
}


class PageHandle extends RouteHandler {
	constructor(name, title) {
		super(new RegExp(`^\/${name}(\\?.*)?$`));
		this.title = title;
	}

	handle(path, routeData) {
		let params = {};
		let matchResult = this.prefixRegex.exec(path);

		if (matchResult.length == 2) {
			let query = matchResult[1];

			if (query != undefined && query != '?') {
				params = this._parseQuery(query);
			}
		}
		
		this.renderPage(params, routeData);

		return { historyTitle: this.title }; 
	}

	renderPage(queryParams, routeData) {}

	_parseQuery(queryString) {
	    var query = {};
	    var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
	    for (var i = 0; i < pairs.length; i++) {
	        var pair = pairs[i].split('=');
	        query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
	    }
	    return query;
	}
}


class Router {

	constructor(context) {
		this._handles = [];
		this.context = context;
	}

	addHandle(handle) {
		this._handles.push(handle);
	}

	findMatchingHandle(url) {
		let handle = this._handles.filter(h => h.match(url));
		return handle.length > 0 ? handle[0] : null;
	}

	handle(url, routeData, callBack = () => {}) {
		let h = this.findMatchingHandle(url);

		if (h != null) {
			callBack(h.handle(url, routeData));
		} else {
			console.error('<#> no route for [ ' + url + ' ]', routeData);
		}
	}

	changeState(callBack) {
		this.navigateTo(this.currentPathName(), callBack(this.currentState()));
	}

	currentPathName() {}

	currentState() {}

	navigateTo(url, routeData) {}

	onBrowserInit() {}

}


class HistoryRouter extends Router {

	constructor(context, basePath = null) {
		super(context);
		this.basePath = basePath;
		context.addEventListener('popstate', e => this._onPopstate(e));
	}

	currentPathName() {
		return this._parsePathName(document.location.pathname) + document.location.search;
	}

	currentState() {
		return history.state;
	}

	navigateTo(url, routeData) {
		url = this._parsePathName(url);
		super.handle(url, routeData, result => {
			history.pushState(routeData, result ? result.historyTitle : null, this._completePathName(url));
		});
	}

	onBrowserInit() {
		var path = this.currentPathName();
		this._setupInitial('/');
		if (path != '/') {
			this.navigateTo(path);
		}
	}

	_onPopstate(event) {
		super.handle(this.currentPathName(), event.state);
	}

	_setupInitial(url) {
		super.handle(url, null, result => {
			history.replaceState(null, result ? result.historyTitle : null, this._completePathName(url));
		});
	}

	_parsePathName(pathName) {
		return this.basePath != null && pathName.indexOf(this.basePath) == 0
			? pathName.substr(this.basePath.length)
			: pathName;
	}

	_completePathName(pathName) {
		return this.basePath != null && pathName.indexOf(this.basePath) != 0
			? this.basePath + pathName
			: pathName;
	}

}


class HashRouter extends Router {
	constructor(context, basePath = null) {
		super(context);
		this.basePath = basePath;
		context.addEventListener('hashchange', e => this._onHashChange(e));
	}

	currentPathName() {
		return document.location.hash[0] != '#' ? '' : document.location.hash.substr(1);
	}

	currentState() {
		let hash = document.location.hash;
		let index = hash.lastIndexOf('?');

		return index == -1 ? {} : this._deserializeFromQueryString(hash.substr(index + 1));
	}

	navigateTo(url, routeData) {
		url = this._parsePathName(url);
		let splitedUrl = this._splitQueryString(url);
		let fromUrlParams = this._deserializeFromQueryString(splitedUrl[1]);
		let params = this._createMerge(fromUrlParams, routeData);

		url = splitedUrl[0];

		if (Object.keys(params).length) {
			url += '?' + this._serializeToQueryString(params);
		}

		document.location.hash = url;
	}

	onBrowserInit() {
		var path = this.currentPathName();

		this.navigateTo('/');

		if (path != '') {
			setTimeout(() => this.navigateTo(path), 300);
		}
	}

	changeState(callBack) {
		let splitedUrl = this._splitQueryString(this.currentPathName());
		this.navigateTo(splitedUrl[0], callBack(this.currentState()));
	}

	_onHashChange(event) {
		super.handle(this.currentPathName(), this.currentState());
	}

	_splitQueryString(url) {
		let index = url.lastIndexOf('?');
		return index == -1 ? [url, ''] : [url.substr(0, index), url.substr(index + 1)];
	}

	_serializeToQueryString(obj) {
	 	let str = [];

	 	if (obj != null && obj != undefined) {
			for (let p in obj) {
				if (obj.hasOwnProperty(p)) {
					str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
				}
			}
		}

		return str.join('&');
	}

	_deserializeFromQueryString(queryString) {
		let query = {};

		if (queryString.length) {
		    let pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');

		    for (let i = 0; i < pairs.length; i++) {
		        let pair = pairs[i].split('=');
		        query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
		    }
		}

	    return query;
	}

	_createMerge(obj1, obj2) {
		let result = {};
		this._copyProps(obj1, result);
		this._copyProps(obj2, result);
		return result;
	}

	_copyProps(src, dest) {
		if (src && dest) {
			for (let p in src) {
				if (src.hasOwnProperty(p)) {
					dest[p] = src[p];
				}
			}
		}
	}

	_parsePathName(pathName) {
		return this.basePath != null && pathName.indexOf(this.basePath) == 0
			? pathName.substr(this.basePath.length)
			: pathName;
	}
}


export { RouteHandler, SubHandle, PageHandle, HistoryRouter, HashRouter };