/**
 * @license
 * Copyright (c) 2012 Soichi Takamura (http://stakam.net/)
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */

goog.provide('goog.ui.thousandrows.Model');

goog.require('goog.ds.DataManager');
goog.require('goog.ds.JsXmlHttpDataSource');
goog.require('goog.net.XhrManager');
goog.require('goog.events.EventTarget');


/**
 * @param {string} id For root dataSource.
 * @param {string} uri Uri. Also used as xhr request id.
 * @param {number} opt_totalRowCount
 * @param {goog.net.XhrManager=} opt_xhrManager
 * @constructor
 * @extends {goog.events.EventTarget}
 */
goog.ui.thousandrows.Model = function (id, uri, opt_totalRowCount, opt_xhrManager) {

	goog.base(this);

	this.uri_ = uri;
  this.totalRowCount_ = goog.isNumber(opt_totalRowCount) ? opt_totalRowCount : 0;

	this.xhr_ = /** @type {goog.net.XhrManager} */(opt_xhrManager || new goog.net.XhrManager);

	/**
	 * @type {Object} key is request uri. The uri is request id in xhrManager.
	 */
	this.pages_ = {};

  this.initDs_(id);
};
goog.inherits(goog.ui.thousandrows.Model, goog.events.EventTarget);


/**
 * @type {?goog.ds.DataManager}
 */
goog.ui.thousandrows.Model.prototype.dm_;


/**
 * @type {?goog.ds.FastDataNode}
 */
goog.ui.thousandrows.Model.prototype.ds_;


/**
 * @type {string}
 */
goog.ui.thousandrows.Model.prototype.countParamKey_ = 'count';


/**
 * @type {string}
 */
goog.ui.thousandrows.Model.prototype.offsetParamKey_ = 'offset';


/**
 * @param {string} count
 * @param {string} offset
 */
goog.ui.thousandrows.Model.prototype.setParamKeys = function (count, offset) {
  this.countParamKey_ = count;
  this.offsetParamKey_ = offset;
};


goog.ui.thousandrows.Model.prototype.getTotal = function () {
  return this.totalRowCount_;
};


/**
 * @enum {string}
 */
goog.ui.thousandrows.Model.EventType = {
  UPDATE_TOTAL: 'updatetotal',
  UPDATE_PAGE: 'updatepage'
};

/**
 * @param {string} id As a name of dataSource.
 */
goog.ui.thousandrows.Model.prototype.initDs_ = function (id) {
  this.dm_ = goog.ds.DataManager.getInstance();
  this.ds_ = new goog.ds.FastDataNode([], id);
  this.dm_.addDataSource(this.ds_);
  this.dm_.addListener(goog.bind(this.handleDataChange_, this), '$' + id + '/...');
};


/**
 * @param {string} path
 */
goog.ui.thousandrows.Model.prototype.handleDataChange_ = function (path) {
  var i = +path[path.length-1];
  var ds = goog.ds.Expr.create(path).getValue();
  if (ds) {
    this.dispatchEvent({
      type: goog.ui.thousandrows.Model.EventType.UPDATE_PAGE,
      ds: ds
    });
  }
};


/**
 * @param {number} index
 * @param {number} rowCountInPage
 */
goog.ui.thousandrows.Model.prototype.getRecordAtPageIndex = function (index, rowCountInPage) {
	var uri = this.buildUri_(index, rowCountInPage);
  var pageName = 'page' + index;

  var storedDs = goog.ds.Expr.create(this.ds_.getDataName() + '/' + pageName).getValue();
  if (storedDs) {
    this.dispatchEvent({
      type: goog.ui.thousandrows.Model.EventType.UPDATE_PAGE,
      ds: storedDs
    });
  } else {
    this.sendPageRequest_(uri, goog.bind(function (e) {
      var xhrio = e.target;
      var success = xhrio.isSuccess();
      var json = xhrio.getResponseJson();
      if (success) {

        var rowsData = this.parseJsonForRowsData(json);

        var ds = goog.ds.FastDataNode.fromJs({
          index: index,
          rowsData: rowsData
        }, pageName, this.ds_);
        this.ds_.add(ds);

      }
    }, this));
  }
};


/**
 * Override this method if your json is not row data array.
 * @param {Object|Array} json
 * @return {!Array}
 */
goog.ui.thousandrows.Model.prototype.parseJsonForRowsData = function (json) {
  return /** @type {!Array} */json;
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
