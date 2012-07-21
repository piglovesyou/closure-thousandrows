
goog.provide('goog.ui.ThousandRows');

goog.require('goog.ui.VirtualScroller');
goog.require('goog.iter');
goog.require('goog.math.Range');
goog.require('goog.Timer');
goog.require('goog.asserts');
goog.require('goog.Uri');



/**
 * @param {number} rowHeight
 * @param {number} rowCountInPage
 * @param {number} totalRowCount
 * @param {goog.dom.DomHelper=} opt_domHelper
 * @constructor
 * @extends {goog.ui.VirtualScroller}
 */
goog.ui.ThousandRows = function (model, rowHeight, rowCountInPage, totalRowCount, opt_domHelper) {
  goog.base(this, goog.ui.Scroller.ORIENTATION.VERTICAL, opt_domHelper);

  this.rowHeight_      = rowHeight;
  this.rowCountInPage_ = rowCountInPage;
  this.totalRowCount_  = totalRowCount;
  this.setVirtualScrollHeight(rowHeight * totalRowCount);

  this.setModel(model);
};
goog.inherits(goog.ui.ThousandRows, goog.ui.VirtualScroller);


/**
 * Row needs this method.
 * @param {number} index
 * @return {Object} 
 */
goog.ui.ThousandRows.prototype.getRecordAtRowIndex = function (index) {
  return this.getModel().getChildNode(this.rowDataNamePrefix_ + index);
};


/**
 * @type {string}
 */
goog.ui.ThousandRows.baseName = 'thousandrows';


/**
 * @type {string}
 */
goog.ui.ThousandRows.baseCssName = 'goog-' + goog.ui.ThousandRows.baseName;


/** @inheritDoc */
goog.ui.ThousandRows.prototype.decorateInternal = function (element) {
  goog.dom.classes.add(element, goog.ui.ThousandRows.baseCssName);
  goog.base(this, 'decorateInternal', element);
};


/** @inheritDoc */
goog.ui.ThousandRows.prototype.enterDocument = function () {
  goog.base(this, 'enterDocument');
  this.adjustScrollTop();
};


/** @inheritDoc */
goog.ui.ThousandRows.prototype.adjustScrollTop = function (orient) {
  this.renderPages_();
  this.getContentElement().scrollTop = this.getMargin_();
};


goog.ui.ThousandRows.prototype.renderPages_ = function () {
  var range = this.getExistingPageRange_();
  goog.array.forEach(this.getChildIds(), function (id) {
    if (!goog.math.Range.containsPoint(range, +id)) {
       this.removeChild(id, true);
    }
  }, this);
  goog.iter.forEach(goog.iter.range(range.start, range.end + 1), function (i) {
    this.createPage_(i);
  }, this);
};


/**
 * @param {number} pageIndex
 * @return {goog.ui.ThousandRows.Page}
 */
goog.ui.ThousandRows.prototype.createPage_ = function (pageIndex) {
  var page = this.getChild('' + pageIndex);
  if (!page) {
    page = new goog.ui.ThousandRows.Page(pageIndex,
        this.rowCountInPage_, this.rowHeight_, this.getDomHelper());

    // insert right position in DOM.
    var inserted = !!(goog.array.find(this.getChildIds(), function (id, index) {
      if (+id > pageIndex) {
        this.addChildAt(page, index, true);
        return true;
      }
    }, this));
    if (!inserted) this.addChild(page, true);
  }
  return page;
};


/**
 * @return {goog.math.Range}
 */
goog.ui.ThousandRows.prototype.getExistingPageRange_ = function () {
  var pageIndex = this.getPageIndex_();
  return new goog.math.Range(
      Math.max(0, pageIndex - 1),
      Math.min(this.getMaxPageIndex_(), pageIndex + 1));
};


/**
 * @return {number}
 */
goog.ui.ThousandRows.prototype.getPageIndex_ = function () {
  return Math.floor(this.getVirtualScrollTop() / this.getPageHeight_());
};


/**
 * @return {number}
 */
goog.ui.ThousandRows.prototype.getMargin_ = function () {
  var margin = this.getVirtualScrollTop() % this.getPageHeight_();
  if (this.getPageIndex_() >= 1) {
    margin += this.getPageHeight_();
  }
  return margin;
};


/**
 * @return {number}
 */
goog.ui.ThousandRows.prototype.getPageHeight_ = function () {
  return this.rowHeight_ * this.rowCountInPage_;
};


/**
 * @return {number}
 */
goog.ui.ThousandRows.prototype.getMaxPageIndex_ = function () {
  return Math.ceil(this.totalRowCount_ / this.rowCountInPage_) - 1;
};










/**
 * @param {string} pageIndex
 * @param {number} rowCount
 * @param {number} rowHeight
 * @param {goog.dom.DomHelper} opt_domHelper
 * @constructor
 * @extends {goog.ui.Component}
 */
goog.ui.ThousandRows.Page = function (pageIndex, rowCount, rowHeight, opt_domHelper) {
  goog.base(this, opt_domHelper);
  this.setId('' + pageIndex);
  this.rowCount_ = rowCount;

  var dh = this.getDomHelper();
  var rowOffset = pageIndex * rowCount;
  goog.iter.forEach(goog.iter.range(rowCount), function (i) {
    this.addChild(new goog.ui.ThousandRows.Row(rowOffset + i, rowHeight, dh));
  }, this);
};
goog.inherits(goog.ui.ThousandRows.Page, goog.ui.Component);


goog.ui.ThousandRows.Page.prototype.enterDocument = function () {
	goog.base(this, 'enterDocument');
	this.renderRows();
};

goog.ui.ThousandRows.Page.prototype.renderRows = function () {
	// Render outer dom first.
	this.forEachChild(function (row) {
		row.render(this.getContentElement());
	}, this);
	this.getParent().getModel().getRecordAtPageIndex(+this.getId(), this.rowCount_, this.renderRows_, this);
};

goog.ui.ThousandRows.Page.prototype.renderRows_ = function (err, json) {
	if (err ||
			!goog.isArray(json) ||
			this.getChildCount() != json.length
			) return; // TODO: retry?
	this.forEachChild(function (row, index) {
		row.renderRecord(json[index]);
	});
};

/** @inheritDoc */
goog.ui.ThousandRows.Page.prototype.createDom = function () {
  var elm = this.getDomHelper().createDom('div',
      goog.getCssName(goog.ui.ThousandRows.baseCssName, 'page'));
  this.setElementInternal(elm);
};






/**
 * @param {string|number} rowIndex
 * @param {number} height
 * @param {goog.dom.DomHelper} opt_domHelper
 * @constructor
 * @extends {goog.ui.Component}
 */
goog.ui.ThousandRows.Row = function (rowIndex, height, opt_domHelper) {
  goog.base(this, opt_domHelper);

  this.setId('' + rowIndex);

  /**
   * @type {number}
   */
  this.height_ = height;
};
goog.inherits(goog.ui.ThousandRows.Row, goog.ui.Component);


/**
 * @type {string}
 */
goog.ui.ThousandRows.Row.baseCssName = goog.getCssName(goog.ui.ThousandRows.baseCssName, 'row');


/**
 * @enum {string}
 */
goog.ui.ThousandRows.Row.CssPostFixes = {
  NOT_RENDERED: 'notrendered'
};

goog.ui.ThousandRows.Row.prototype.enterDocument = function () {
	goog.base(this, 'enterDocument');
};

/**
 * @param {Object} record
 */
goog.ui.ThousandRows.Row.prototype.renderRecord = function (record) {
  if (!this.isInDocument()) return;

  var elm = this.getElement();
  if (record) {
    var dh = this.getDomHelper();
    goog.dom.removeChildren(elm);
    dh.append(elm,
        dh.createDom('div', 'row-col row-index', '' + record['index']),
        dh.createDom('div', 'row-col row-title', record['title']),
        dh.createDom('div', 'row-col row-description', record['body']));
    goog.dom.classes.remove(elm,
        goog.getCssName(goog.ui.ThousandRows.Row.baseCssName,
          goog.ui.ThousandRows.Row.CssPostFixes.NOT_RENDERED));
  } else {
    goog.dom.classes.add(elm, goog.getCssName(goog.ui.ThousandRows.Row.baseCssName,
        goog.ui.ThousandRows.Row.CssPostFixes.NOT_RENDERED));
  }
};

/** @inheritDoc */
goog.ui.ThousandRows.Row.prototype.createDom = function () {
  var elm = this.getDomHelper().createDom('div', {
    className: goog.ui.ThousandRows.Row.baseCssName
    // style: 'height: ' + this.height_ + 'px'
  });
  this.setElementInternal(elm);
};












/**
 * @param {string} uri
 * @param {goog.net.XhrManager} opt_xhrManager
 * @constructor
 * @extends {goog.Disposable}
 */
goog.ui.ThousandRows.Model = function (uri, opt_xhrManager) {
	goog.base(this);

	this.uri_ = uri;
	this.xhr_ = opt_xhrManager || new goog.net.XhrManager;

	/**
	 * @type {Object} key is request uri. The uri is request id in xhrManager.
	 */
	this.pages_ = {};
};
goog.inherits(goog.ui.ThousandRows.Model, goog.Disposable);

goog.ui.ThousandRows.Model.prototype.getRecordAtPageIndex = function (index, rowCountInPage, callback, opt_obj) {
	var uri = this.buildUri_(index, rowCountInPage);
	if (this.pages_[uri]) {
		callback.call(opt_obj, false, this.pages_[uri]);
	} else {
		this.sendPageRequest_(uri, goog.bind(function (e) {
			var t = e.target;
			var success = t.isSuccess()
			var json = t.getResponseJson()
			if (success) this.pages_[uri] = json;
			callback.call(opt_obj, !success, json);
		}, this));
	}
};

goog.ui.ThousandRows.Model.prototype.sendPageRequest_ = function (uri, callback) {
	if (this.xhr_.getOutstandingRequests()[uri]) return; // Xhr is in flight.
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


goog.ui.ThousandRows.Model.prototype.buildUri_ = function (index, rowCountInPage) {
	var uri = goog.Uri.parse(this.uri_);
	uri.setParameterValue('count', rowCountInPage);
	uri.setParameterValue('offset', index * rowCountInPage);
	return uri.toString();
};

goog.ui.ThousandRows.Model.prototype.disposeInternal = function () {
	if (this.xhr_) {
		this.xhr_.dispose();
		this.xhr_ = null;
	}
	this.pages_ = null;
	goog.base(this, 'disposeInternal');
};

