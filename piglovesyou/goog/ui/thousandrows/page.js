/**
 * @license
 * Copyright (c) 2012 Soichi Takamura (http://stakam.net/).
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */

goog.provide('goog.ui.thousandrows.Page');

goog.require('goog.asserts');
goog.require('goog.iter');
goog.require('goog.ui.Component');
goog.require('goog.ui.thousandrows.Row');



/**
 * @param {string|number} pageIndex .
 * @param {number} rowCount .
 * @param {number} rowHeight .
 * @param {goog.dom.DomHelper} opt_domHelper .
 * @constructor
 * @extends {goog.ui.Component}
 */
goog.ui.thousandrows.Page = function(pageIndex,
                                     rowCount, rowHeight, opt_domHelper) {
  goog.base(this, opt_domHelper);
  this.setId('' + pageIndex);
  this.rowCount_ = rowCount;

  var dh = this.getDomHelper();
  var rowOffset = pageIndex * rowCount;
  goog.iter.forEach(goog.iter.range(rowCount), function(i) {
    this.addChild(this.createRow_(rowOffset + i, rowHeight));
  }, this);
};
goog.inherits(goog.ui.thousandrows.Page, goog.ui.Component);

/**
 * @override
 * @param {string} id .
 * @return {?goog.ui.thousandrows.Row} .
 */
goog.ui.thousandrows.Page.prototype.getChild;

/**
 * @override
 * @param {number} index .
 * @return {?goog.ui.thousandrows.Row} .
 */
goog.ui.thousandrows.Page.prototype.getChildAt;

/**
 * @param {string} id .
 * @param {number} rowHeight .
 * @return {goog.ui.thousandrows.Row} .
 * @protected
 * @suppress {underscore}
 */
goog.ui.thousandrows.Page.prototype.createRow_ = function(id, rowHeight) {
  return new goog.ui.thousandrows.Row(id, rowHeight, null, this.getDomHelper());
};

/** @inheritDoc */
goog.ui.thousandrows.Page.prototype.createDom = function() {
  var dh = this.getDomHelper();
  var elm = this.getDomHelper().createDom('div', this.getCssName());
  this.setElementInternal(elm);

  this.forEachChild(function(row) {
    row.createDom();
    dh.appendChild(this.getContentElement(), row.getElement());
  }, this);
};

/**
 * @param {Array} rowsData .
 */
goog.ui.thousandrows.Page.prototype.renderRowsContent = function(rowsData) {
  goog.asserts.assert(goog.isArray(rowsData) ||
                      rowsData.length <= this.getChildCount(),
                      'Passed records are something wrong.');
  this.forEachChild(function(row, index) {
    var record = rowsData[index];
    if (record) {
      row.renderContent(record);
    } else {
      this.removeChild(row).dispose();
    }
  }, this);
};

/**
 * @return {string} .
 */
goog.ui.thousandrows.Page.prototype.getCssName = function() {
  return goog.getCssName(this.getParent().baseCssName, 'page');
};

