import AbstractXhrService from './AbstractXhrService';
import VodAccessor from './models/vod/VodAccessor';
import VodClassificationNode from './models/vod/VodClassificationNode';
import VodResult from './models/vod/VodResult';
import VodClassificationTree from './models/vod/VodClassificationTree';
import VodSerializableTupple from './models/vod/VodSerializableTupple';
import VodErrorMessages from './models/vod/VodErrorMessages';
import ServiceErrors from './helpers/ServiceErrors';

/**
 * class for vod service
 * @alias vodService
 */
class AbstractVodService extends AbstractXhrService {
    /**
     * set properties to use vod service
     */
    init(params) {
        super.init(params);

        params = params || {};
        this._accessKeys = null;
        return Promise.resolve();
    }

    /**
     * Sets _accessKeys for active session
     *
     * @param {VodAccessor} accessKeys
     */
    setCurrentAccessKeys(accessKeys) {
        this._accessKeys = accessKeys;
    }

    /**
     * @param {Boolean} isSortCategoriesAvailable
     * @returns {Promise<*>}
     */
    getClassificationTree(isSortCategoriesAvailable) {
        return this._getClassificationTree(isSortCategoriesAvailable);
    }

    /**
     * @param {Boolean} isSortCategoriesAvailable
     * @returns {Promise} result of HTTP POST request
     * @protected
     */
    _getClassificationTree(isSortCategoriesAvailable) {
        if (!this._accessKeys) {
            return ServiceErrors.throwErrorAsPromise('_getClassificationTree: accessKeys is null !');
        }

        const params = {
            accessKeys: this._accessKeys.parseForService(),
            addSortClassifications: isSortCategoriesAvailable
        };

        return this.postWithPromise('getClassificationTree', params)
            .then(this.__handleArrayResponse.bind(this, VodClassificationNode))
            .then(this.__parseClassificationTree.bind(this));
    }

    /**
     * Send the request as HTTP POST.
     *
     * @param {String} method - Remote method name.
     * @param {Object} params - Params required for the method.
     * @returns {Promise} - Returns method response as Promise.
     * @override
     */
    postWithPromise(method, params) {
        return super.postWithPromise(method, params)
            .catch((error) => {
                if (error && error.type === AbstractXhrService.ERROR_CANCEL) {
                    return Promise.reject(VodErrorMessages.CANCEL);
                } if (error && error.type === AbstractXhrService.ERROR_TIMEOUT) {
                    return Promise.reject(VodErrorMessages.CON1005);
                }
                return Promise.reject(VodErrorMessages.createHttpError(error));
            })
            .then((response) => {
                if (!response || !response.data) {
                    return Promise.reject(VodErrorMessages.CON1011);
                }
                return Promise.resolve(response.data);
            });
    }

    /**
     * @param {Function} ClassInstance
     * @param {Object} data
     * @private
     */
    __handleArrayResponse(ClassInstance, data) {
        const list = [];
        for (let i = 0; i < data.length; i++) {
            list.push(new ClassInstance(data[i]));
        }
        return Promise.resolve(list);
    }

    /**
     * Parses ClassificationTree array
     * @param {Array} classificationTree
     * @returns {Promise}
     * @private
     */
    __parseClassificationTree(classificationTree) {
        // Consider special cases
        if (classificationTree.length > 0) {
            const vodClassificationTree = new VodClassificationTree();
            for (let i = 0; i < classificationTree.length; i++) {
                vodClassificationTree.addClassificationTree(classificationTree[i]);
            }
            return Promise.resolve(vodClassificationTree);
        }

        return Promise.reject(VodErrorMessages.CON1011);
    }

    /**
     * Send the request as HTTP GET.
     *
     * @param {String} url - Remote service url.
     * @param {Object} params - Params required for the service.
     * @returns {Promise} - Returns service response as Promise.
     * @override
     */
    getWithPromise(url, params) {
        return super.getWithPromise(url, params)
            .catch((error) => {
                if (error && error.type === AbstractXhrService.ERROR_TIMEOUT) {
                    return Promise.reject(VodErrorMessages.CON1005);
                }
                return Promise.reject(VodErrorMessages.createHttpError(error));
            })
            .then((response) => {
                return Promise.resolve(response.data);
            });
    }
}

export default AbstractVodService;
