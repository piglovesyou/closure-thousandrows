/**
 * @license
 * Copyright (c) 2012 Soichi Takamura (http://stakam.net/)
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */

goog.provide('goog.ui.thousandrows.Model');

goog.require('goog.net.XhrManager');
goog.require('goog.Disposable');


/**
 * @param {string} uri Uri. Also used as xhr request id.
 * @param {Object=} options
 * @param {goog.net.XhrManager=} opt_xhrManager
 * @constructor
 * @extends {goog.Disposable}
 */
goog.ui.thousandrows.Model = function (uri, opt_totalRowCount, opt_xhrManager) {

	goog.base(this);

	this.uri_ = uri;
  this.totalRowCount_ = goog.isNumber(opt_totalRowCount) ? opt_totalRowCount : 0;
	this.xhr_ = /** @type {goog.net.XhrManager} */(opt_xhrManager || new goog.net.XhrManager);


	/**
	 * @type {Object} key is request uri. The uri is request id in xhrManager.
	 */
	this.pages_ = {};
};
goog.inherits(goog.ui.thousandrows.Model, goog.Disposable);


/**
 * @type {string}
 */
goog.ui.thousandrows.Model.prototype.countParamKey_ = 'count';


/**
 * @type {string}
 */
goog.ui.thousandrows.Model.prototype.offsetParamKey_ = 'offset';


goog.ui.thousandrows.Model.prototype.getTotal = function () {
  return this.totalRowCount_;
};


/**
 * @param {string} key
 */
goog.ui.thousandrows.Model.prototype.setCountParamKey = function (key) {
  this.countParamKey_ = key;
};


/**
 * @param {string} key
 */
goog.ui.thousandrows.Model.prototype.setOffsetParamKey = function (key) {
  this.offsetParamKey_ = key;
};


/**
 * @param {number} index
 * @param {number} rowCountInPage
 * @param {Function} callback
 * @param {Object=} opt_obj
 */
goog.ui.thousandrows.Model.prototype.getRecordAtPageIndex = function (index, rowCountInPage, callback, opt_obj) {
	var uri = this.buildUri_(index, rowCountInPage);
	if (this.pages_[uri]) {
		callback.call(opt_obj, false, this.pages_[uri]);
	} else {
		this.sendPageRequest_(uri, goog.bind(function (e) {
			var xhrio = e.target;
			var success = xhrio.isSuccess();
      var json = xhrio.getResponseJson();
			if (success) this.pages_[uri] = this.parseJsonForRowsData(json);
			callback.call(opt_obj, !success, this.pages_[uri]);
		}, this));
	}
};


/**
 * Override this method if your json is not row data array.
 * @param {Object|Array} json
 * @return {!Array}
 */
goog.ui.thousandrows.Model.prototype.parseJsonForRowsData = function (json) {
  return json;
};


/**
 * @param {string} uri
 * @param {Function} callback
 */
goog.ui.thousandrows.Model.prototype.sendPageRequest_ = function (uri, callback) {
	if (goog.array.contains(this.xhr_.getOutstandingRequestIds(), uri)) return; // Xhr is in flight.
	var u = undefined;
	this.xhr_.send(
			uri,
			uri,
      u, // opt_method,
      u, // opt_content,
      u, // opt_headers,
      u, // opt_priority,
      callback, // opt_callback,
      u); // opt_maxRetries
};


/**
 * @param {number} index
 * @param {number} rowCountInPage
 * @return {string}
 */
goog.ui.thousandrows.Model.prototype.buildUri_ = function (index, rowCountInPage) {
	var uri = goog.Uri.parse(this.uri_);
	uri.setParameterValue(this.countParamKey_, rowCountInPage);
	uri.setParameterValue(this.offsetParamKey_, index * rowCountInPage);
	return uri.toString();
};


/** @inheritDoc */
goog.ui.thousandrows.Model.prototype.disposeInternal = function () {
	if (this.xhr_) {
		this.xhr_.dispose();
		this.xhr_ = null;
	}
	this.pages_ = null;
	goog.base(this, 'disposeInternal');
};

