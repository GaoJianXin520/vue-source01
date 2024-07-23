import { initMixin } from './init';
import { initLicycle } from './lifecycle';
import { nextTick } from './observe/watcher';
function Vue(options) {
    this._init(options);
}

Vue.prototype.$nextTick = nextTick;
initMixin(Vue);
initLicycle(Vue);

export default Vue;