import { initMixin } from './init';

function Vue(options) {
    this._init(options);
}

initMixin(Vue);
initLicycle(Vue);

export default Vue;