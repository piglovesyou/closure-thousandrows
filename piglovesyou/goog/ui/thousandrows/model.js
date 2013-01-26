/**
 * @license
 * Copyright (c) 2012 Soichi Takamura (http://stakam.net/).
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */

goog.provide('goog.ui.thousandrows.Model');

goog.require('goog.ds.DataManager');
goog.require('goog.ds.JsXmlHttpDataSource');
goog.require('goog.events.EventTarget');
goog.require('goog.net.XhrManager');


/**
 * @param {string} uri Through which thousandrows interacts with a server
 *    by xhr. Also it is used as request id of xhr.
 * @param {number=} opt_totalRowCount .
 * @param {boolean=} opt_updateTotalWithJson .
 * @param {goog.net.XhrManager=} opt_xhrManager .
 * @constructor
 * @extends {goog.events.EventTarget}
 */
goog.ui.thousandrows.Model = function(uri,
    opt_totalRowCount, opt_updateTotalWithJson, opt_xhrManager) {

  goog.base(this);

  this.uri_ = uri;
  this.updateTotalWithJson_ = !!opt_updateTotalWithJson;

  /**
   * @type {goog.net.XhrManager}
   * @private
   */
  this.xhr_ = (opt_xhrManager || new goog.net.XhrManager);

  this.initDataSource_(goog.isNumber(opt_totalRowCount) ?
                       opt_totalRowCount : -1);
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
 * @private
 */
goog.ui.thousandrows.Model.prototype.countParamKey_ = 'count';


/**
 * @type {string}
 * @private
 */
goog.ui.thousandrows.Model.prototype.offsetParamKey_ = 'offset';


/**
 * @param {string} count .
 * @param {string} offset .
 */
goog.ui.thousandrows.Model.prototype.setParamKeys = function(count, offset) {
  this.countParamKey_ = count;
  this.offsetParamKey_ = offset;
};


/**
 * @return {number} .
 */
goog.ui.thousandrows.Model.prototype.getTotal = function() {
  return this.totalDs_.get();
};


/**
 * @enum {string}
 */
goog.ui.thousandrows.Model.EventType = {
  UPDATE_TOTAL: 'updatetotal',
  UPDATE_PAGE: 'updatepage'
};


/**
 * @type {string}
 */
goog.ui.thousandrows.Model.prototype.id_;


/**
 * @return {string} .
 */
goog.ui.thousandrows.Model.prototype.getId = function() {
  return this.id_ || (this.id_ = 'thousandrowsmodel:' + goog.getUid(this));
};


/**
 * @param {number} total Supposed total of rows length. This value
 *                can be lazily initialized and can be updated after.
 * @private
 */
goog.ui.thousandrows.Model.prototype.initDataSource_ = function(total) {
  this.dm_ = goog.ds.DataManager.getInstance();
  this.ds_ = new goog.ds.FastDataNode({}, this.getId());

  this.totalDs_ = new goog.ds.PrimitiveFastDataNode(total, 'total', this.ds_);
  this.ds_.add(this.totalDs_);

  this.dm_.addDataSource(this.ds_);
  this.dm_.addListener(goog.bind(this.handleDataChange_, this),
                       '$' + this.getId() + '/...');
};


/**
 * @param {string} path .
 * @private
 */
goog.ui.thousandrows.Model.prototype.handleDataChange_ = function(path) {
  var ds = goog.ds.Expr.create(path).getNode();
  if (ds) {
    if (ds.getDataName() == 'total') {
      this.dispatchEvent(goog.ui.thousandrows.Model.EventType.UPDATE_TOTAL);
    } else {
      // TODO: Just dispatch with page index.
      this.dispatchEvent({
        type: goog.ui.thousandrows.Model.EventType.UPDATE_PAGE,
        ds: ds
      });
    }
  }
};


/**
 * @param {number} index .
 * @param {number} rowCountInPage .
 */
goog.ui.thousandrows.Model.prototype.getRecordAtPageIndex =
    function(index, rowCountInPage) {
  var uri = this.buildUri_(index, rowCountInPage);
  var pageName = 'page' + index;

  var storedDs = goog.ds.Expr.create(this.ds_.getDataName() +
                                     '/' + pageName).getValue();
  if (storedDs) {
    // TODO: Just return rowsData.
    this.dispatchEvent({
      type: goog.ui.thousandrows.Model.EventType.UPDATE_PAGE,
      ds: storedDs
    });
  } else {
    this.sendPageRequest_(uri, goog.bind(function(e) {
      var xhrio = e.target;
      var success = xhrio.isSuccess();
      var json = xhrio.getResponseJson();
      if (success) {

        var rowsData = this.extractRowsDataFromJson(json);
        if (this.updateTotalWithJson_) {
          var total = this.extractTotalFromJson(json);
          // Update only if these are not the same.
          if (total != this.totalDs_.get()) {
            this.totalDs_.set(total);
          }
        }

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
 * Returns total amount of rows in server. Override this method
 * to extract it in your JSON.
 * @param {Object} json Raw response JSON.
 * @return {number} .
 * @protected
 */
goog.ui.thousandrows.Model.prototype.extractTotalFromJson = function(json) {
  return json['total'];
};


/**
 * Override this method if your json is not row data array.
 * @param {Object|Array} json .
 * @return {!Array} .
 */
goog.ui.thousandrows.Model.prototype.extractRowsDataFromJson = function(json) {
  return /** @type {!Array} */(json['rows']);
};


/**
 * @param {string} uri .
 * @param {Function} callback .
 * @private
 */
goog.ui.thousandrows.Model.prototype.sendPageRequest_ = function(uri,
                                                                 callback) {
  if (goog.array.contains(this.xhr_.getOutstandingRequestIds(), uri)) {
    return; // Xhr is in flight.
  }
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
 * @param {number} index .
 * @param {number} rowCountInPage .
 * @return {string} .
 * @private
 */
goog.ui.thousandrows.Model.prototype.buildUri_ = function(index,
                                                          rowCountInPage) {
  var uri = goog.Uri.parse(this.uri_);
  uri.setParameterValue(this.countParamKey_, rowCountInPage);
  uri.setParameterValue(this.offsetParamKey_, index * rowCountInPage);
  return uri.toString();
};


/** @inheritDoc */
goog.ui.thousandrows.Model.prototype.disposeInternal = function() {
  if (this.xhr_) {
    goog.array.forEach(this.xhr_.getOutstandingRequestIds(), function(id) {
      this.abort(id, true);
    }, this.xhr_);
    this.xhr_.dispose();
    this.xhr_ = null;
  }
  this.dm_.get().removeNode('$' + this.getId());
  this.dm_ = null;
  this.ds_ = null;
  goog.base(this, 'disposeInternal');
};
