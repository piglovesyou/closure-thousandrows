/**
 * @license
 * Copyright (c) 2012 Soichi Takamura (http://stakam.net/)
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */

goog.provide('goog.ui.thousandrows.Row');

goog.require('goog.ui.Component');
goog.require('goog.dom.classes');

/**
 * @param {string|number} rowIndex
 * @param {number} height
 * @param {goog.dom.DomHelper} opt_domHelper
 * @constructor
 * @extends {goog.ui.Component}
 */
goog.ui.thousandrows.Row = function (rowIndex, height, opt_domHelper) {
  goog.base(this, opt_domHelper);

  this.setId('' + rowIndex);

  /**
   * @type {number}
   */
  this.height_ = height;
};
goog.inherits(goog.ui.thousandrows.Row, goog.ui.Component);


/**
 * @enum {string}
 */
goog.ui.thousandrows.Row.CssPostFixes = {
  NOT_RENDERED: 'notrendered'
};

goog.ui.thousandrows.Row.prototype.enterDocument = function () {
	goog.base(this, 'enterDocument');
};

/**
 * @param {Object} record
 */
goog.ui.thousandrows.Row.prototype.renderRecord = function (record) {
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
        goog.getCssName(this.getCssName(),
          goog.ui.thousandrows.Row.CssPostFixes.NOT_RENDERED));
  } else {
    this.asNotRendered_();
  }
};

goog.ui.thousandrows.Row.prototype.asNotRendered_ = function () {
  var elm = this.getElement();
  this.getDomHelper().removeChildren(elm);
  goog.dom.classes.add(elm, goog.getCssName(this.getCssName(),
      goog.ui.thousandrows.Row.CssPostFixes.NOT_RENDERED));
};

/** @inheritDoc */
goog.ui.thousandrows.Row.prototype.createDom = function () {
  var elm = this.getDomHelper().createDom('div', {
    className: this.getCssName()
    // style: 'height: ' + this.height_ + 'px'
  });
  this.setElementInternal(elm);
  this.asNotRendered_();
};

goog.ui.thousandrows.Row.prototype.baseCssName;

goog.ui.thousandrows.Row.prototype.getCssName = function () {
  return this.baseCssName ||
      (this.baseCssName = 
        (this.getParent() &&
         this.getParent().getParent().baseCssName &&
         goog.getCssName(this.getParent().getParent().baseCssName || 'thousandrows', 'row')));
};