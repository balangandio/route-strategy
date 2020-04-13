import { AppUtils } from './app.js';
import { HistoryRouter, HashRouter, PageHandle, RouteHandler } from './router.js';

class PaginaInicialHandle extends PageHandle {
	constructor(appUtils) {
		super('', 'Home');
		this.appUtils = appUtils;
	}

	renderPage(queryParams, routeData) {
		let params = routeData == undefined || routeData == null ? {} : routeData;
		this.appUtils.setToggleMenuState(params['toggle'] == '1');
		this.appUtils.utils.removeClasses(this.appUtils.config.currentPageClassName);
	}
}

class PagesHandle extends RouteHandler {

	pages = {
		'/history' : { className: 'page_history' },
		'/hash' : { className: 'page_hash' }
	};

	constructor(appUtils, subpath = 'pages') {
		super(new RegExp(`^\/${subpath}(\/.*)?$`));
		this.appUtils = appUtils;
	}

	handle(url, routeData) {
		let matchResult = this.prefixRegex.exec(url);
		let path = matchResult[1];

		let page = this.pages[path];

		if (page != undefined) {
			var elements = document.getElementsByClassName(page.className);

			if (elements.length == 1) {
				this.appUtils.utils.addClassName(elements[0], this.appUtils.config.currentPageClassName);
			} else {
				console.error(`<#> container page [${page.className}] not found or duplicated`);
			}
		}

		return { historyTitle: 'detail' };
	}
}

class _App {
	constructor(appUtils) {
		this.appUtils = appUtils;
	}

	initHistoryRouter() {
		this._setRouter(new HistoryRouter(window, this.appUtils.config.appPath));
		this.appUtils.setChooserPageState(false);
	}

	initHashRouter() {
		this._setRouter(new HashRouter(window, this.appUtils.config.appPath));
		this.appUtils.setChooserPageState(false);
	}

	onClickNavLink(event) {
		let linkElem = event.path.filter(elem => elem.tagName == 'A')[0];

		if (linkElem) {
			event.preventDefault();
			this.navigate(linkElem.pathname + linkElem.search);
		}
	}

	navigate(url, routeData = null) {
		this._router.navigateTo(url, routeData);
	}

	openToggleMenu(event) {
		event ? event.preventDefault() : null;
		this._router.changeState(currentState => {
			return { ...currentState, toggle: '1' };
		});
	}

	_setRouter(router) {
		this._router = router;
		this._router.addHandle(new PaginaInicialHandle(this.appUtils));
		this._router.addHandle(new PagesHandle(this.appUtils));
		this._router.onBrowserInit();
	}
}


window.App = new _App(AppUtils);