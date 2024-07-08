import { initMixin } from './init';
import { initLicycle } from './lifecycle';

function Vue(options) {
    this._init(options);
}

initMixin(Vue);
initLicycle(Vue);

export default Vue;