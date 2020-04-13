import Utils from './utils.js';

const CONFIG = {
	appPath: null,
	chooserPageClassName: 'chooser_page',
	bodyScrollDisableClassName: 'disable_scroll',
	currentPageClassName: 'current_page',

	toggleMenuClassName: 'toggle_menu',
	detailMenuClassName: 'detail_menu',

	toggleOpenClassName: 'opened'
};

class _AppUtils {
	constructor(config, utils) {
		this.utils = utils;
		this.config = config;
	}

	setChooserPageState(opened) {
		this.utils.getElementByClassName(this.config.chooserPageClassName, elem => {
			this.utils.setEnableClassName(opened, elem, this.config.toggleOpenClassName);
		});		
	}

	setToggleMenuState(opened) {
		this.utils.getElementByClassName(this.config.toggleMenuClassName, elem => {
			this.utils.setEnableClassName(opened, elem, this.config.toggleOpenClassName);
		});
	}

	setDetailMenuState(opened) {
		this.utils.getElementByClassName(this.config.detailMenuClassName, elem => {
			this.utils.setEnableClassName(opened, elem, this.config.toggleOpenClassName);
		});
	}

	setEnableBodyScroll(enabled) {
		this.utils.setEnableClassName(!enabled, document.body, this.config.bodyScrollDisableClassName);
	}
}

const AppUtils = new _AppUtils(CONFIG, Utils);

export { CONFIG, AppUtils };