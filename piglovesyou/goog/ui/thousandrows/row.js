/**
 * @license
 * Copyright (c) 2012 Soichi Takamura (http://stakam.net/)
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */

goog.provide('goog.ui.thousandrows.Row');

goog.require('goog.ui.thousandrows.RowRenderer');
goog.require('goog.ui.Component');
goog.require('goog.dom.classes');

/**
 * @param {string|number} rowIndex
 * @param {number} height
 * @param {goog.dom.DomHelper} opt_domHelper
 * @constructor
 * @extends {goog.ui.Component}
 */
goog.ui.thousandrows.Row = function (rowIndex, height, opt_renderer, opt_domHelper) {
  goog.base(this, opt_domHelper);

  this.setId('' + rowIndex);

  /**
   * @type {number}
   */
  this.height_ = height;

  /**
   * @type {goog.ui.thousandrows.RowRenderer}
   */
  this.renderer_ = opt_renderer || goog.ui.thousandrows.RowRenderer.getInstance();
};
goog.inherits(goog.ui.thousandrows.Row, goog.ui.Component);


goog.ui.thousandrows.Row.prototype.enterDocument = function () {
	goog.base(this, 'enterDocument');
};

/**
 * @param {Object} record
 */
goog.ui.thousandrows.Row.prototype.renderContent = function (record) {
  if (!this.isInDocument()) return;
  var content = this.getContentElement();
  goog.dom.removeChildren(content);
  if (record) {
    this.getDomHelper().appendChild(/** @type {!Node} */(content),
        this.renderer_.createContent(this, record));
    this.asRendered_(true);
  } else {
    this.asRendered_(false);
  }
};

/**
 * @type {boolean}
 */
goog.ui.thousandrows.Row.prototype.hasContent_ = false;

/**
 * @return {boolean}
 */
goog.ui.thousandrows.Row.prototype.hasContent = function () {
  return !!this.hasContent_;
};

/**
 * @param {boolean} rendered Whether the content rendered or not.
 */
goog.ui.thousandrows.Row.prototype.asRendered_ = function (rendered) {
  goog.dom.classes.enable(this.getElement(),
      goog.getCssName(this.getCssName(), 'notrendered'), !rendered);
  this.hasContent_ = !!rendered;
};

/** @inheritDoc */
goog.ui.thousandrows.Row.prototype.createDom = function () {
  var elm = this.renderer_.createDom(this);
  this.setElementInternal(elm);
  this.asRendered_(false);
};

/**
 * @type {?string}
 */
goog.ui.thousandrows.Row.prototype.baseCssName;

goog.ui.thousandrows.Row.prototype.getCssName = function () {
  return this.baseCssName ||
      (this.baseCssName = 
        (this.getParent() &&
         this.getParent().getParent().baseCssName &&
         goog.getCssName(this.getParent().getParent().baseCssName || 'thousandrows', 'row')));
};
