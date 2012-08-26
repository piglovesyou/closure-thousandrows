/**
 * @license
 * Copyright (c) 2012 Soichi Takamura (http://stakam.net/)
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */

goog.provide('goog.ui.thousandrows.Page');

goog.require('goog.ui.Component');
goog.require('goog.ui.thousandrows.Row');


/**
 * @param {string|number} pageIndex
 * @param {number} rowCount
 * @param {number} rowHeight
 * @param {goog.dom.DomHelper} opt_domHelper
 * @constructor
 * @extends {goog.ui.Component}
 */
goog.ui.thousandrows.Page = function (pageIndex, rowCount, rowHeight, opt_domHelper) {
  goog.base(this, opt_domHelper);
  this.setId('' + pageIndex);
  this.rowCount_ = rowCount;

  var dh = this.getDomHelper();
  var rowOffset = pageIndex * rowCount;
  goog.iter.forEach(goog.iter.range(rowCount), function (i) {
    this.addChild(new goog.ui.thousandrows.Row(rowOffset + i, rowHeight, dh));
  }, this);
};
goog.inherits(goog.ui.thousandrows.Page, goog.ui.Component);

/** @inheritDoc */
goog.ui.thousandrows.Page.prototype.createDom = function () {
  var elm = this.getDomHelper().createDom('div', this.getCssName());
  this.setElementInternal(elm);

	this.forEachChild(function (row) {
		row.render(this.getContentElement());
	}, this);
};

/**
 * @param {Array} rowsData
 */
goog.ui.thousandrows.Page.prototype.renderRowsContent = function (rowsData) {
	if (!goog.isArray(rowsData) || this.getChildCount() != rowsData.length) return;
	this.forEachChild(function (row, index) {
		row.renderContent(rowsData[index]);
	});
};

goog.ui.thousandrows.Page.prototype.getCssName = function () {
  return goog.getCssName(this.getParent().baseCssName, 'page');
};

