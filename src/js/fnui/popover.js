
/*=============
  FNUI 2.0 DATEPICKER
================*/
define(['jquery','./fnuicore'],function($,UI){

    'use strict';

var Popover = function(element, options) {
  this.options = $.extend({}, Popover.DEFAULTS, options);
  this.$element = $(element);
  this.active = null;
  this.$popover = (this.options.target && $(this.options.target)) || null;

  this.init();
  this._bindEvents();
};

Popover.DEFAULTS = {
  theme: null,
  trigger: 'click',
  content: '',
  open: false,
  target: null,
  tpl: '<div class="fn-popover">' +
    '<div class="fn-popover-inner"></div>' +
    '<div class="fn-popover-caret"></div></div>'
};

Popover.prototype.init = function() {
  var _this = this;
  var $element = this.$element;
  var $popover;

  if (!this.options.target) {
    this.$popover = this.getPopover();
    this.setContent();
  }

  $popover = this.$popover;

  $popover.appendTo($('body'));

  this.sizePopover();

  function sizePopover() {
    _this.sizePopover();
  }

  // TODO: 监听页面内容变化，重新调整位置

  $element.on('open.popover', function() {
    $(window).on('resize.popover', UI.utils.debounce(sizePopover, 50));
  });

  $element.on('close.popover', function() {
    $(window).off('resize.popover', sizePopover);
  });

  this.options.open && this.open();
};

Popover.prototype.sizePopover = function sizePopover() {
  var $element = this.$element;
  var $popover = this.$popover;

  if (!$popover || !$popover.length) {
    return;
  }

  var popWidth = $popover.outerWidth();
  var popHeight = $popover.outerHeight();
  var $popCaret = $popover.find('.fn-popover-caret');
  var popCaretSize = ($popCaret.outerWidth() / 2) || 8;
  // 取不到 $popCaret.outerHeight() 的值，所以直接加 8
  var popTotalHeight = popHeight + 8; // $popCaret.outerHeight();

  var triggerWidth = $element.outerWidth();
  var triggerHeight = $element.outerHeight();
  var triggerOffset = $element.offset();
  var triggerRect = $element[0].getBoundingClientRect();

  var $w = $(window);
  var winHeight = $w.height();
  var winWidth = $w.width();
  var popTop = 0;
  var popLeft = 0;
  var diff = 0;
  var spacing = 2;
  var popPosition = 'top';

  $popover.css({left: '', top: ''}).removeClass('fn-popover-left ' +
  'fn-popover-right fn-popover-top fn-popover-bottom');

  // $popCaret.css({left: '', top: ''});

  if (popTotalHeight - spacing < triggerRect.top + spacing) {
    // Popover on the top of trigger
    popTop = triggerOffset.top - popTotalHeight - spacing;
  } else if (popTotalHeight <
    winHeight - triggerRect.top - triggerRect.height) {
    // On bottom
    popPosition = 'bottom';
    popTop = triggerOffset.top + triggerHeight + popCaretSize + spacing;
  } else { // On middle
    popPosition = 'middle';
    popTop = triggerHeight / 2 + triggerOffset.top - popHeight / 2;
  }

  // Horizontal Position
  if (popPosition === 'top' || popPosition === 'bottom') {
    popLeft = triggerWidth / 2 + triggerOffset.left - popWidth / 2;

    diff = popLeft;

    if (popLeft < 5) {
      popLeft = 5;
    }

    if (popLeft + popWidth > winWidth) {
      popLeft = (winWidth - popWidth - 20);
      // console.log('left %d, win %d, popw %d', popLeft, winWidth, popWidth);
    }

    if (popPosition === 'top') {
      // This is the Popover position, NOT caret position
      // Popover on the Top of trigger, caret on the bottom of Popover
      $popover.addClass('fn-popover-top');
    }

    if (popPosition === 'bottom') {
      $popover.addClass('fn-popover-bottom');
    }

    diff = diff - popLeft;
    // $popCaret.css({left: (popWidth / 2 - popCaretSize + diff) + 'px'});

  } else if (popPosition === 'middle') {
    popLeft = triggerOffset.left - popWidth - popCaretSize;
    $popover.addClass('fn-popover-left');
    if (popLeft < 5) {
      popLeft = triggerOffset.left + triggerWidth + popCaretSize;
      $popover.removeClass('fn-popover-left').addClass('fn-popover-right');
    }

    if (popLeft + popWidth > winWidth) {
      popLeft = winWidth - popWidth - 5;
      $popover.removeClass('fn-popover-left').addClass('fn-popover-right');
    }
    // $popCaret.css({top: (popHeight / 2 - popCaretSize / 2) + 'px'});
  }

  // Apply position style
  $popover.css({top: popTop + 'px', left: popLeft + 'px'});
};

Popover.prototype.toggle = function() {
  return this[this.active ? 'close' : 'open']();
};

Popover.prototype.open = function() {
  var $popover = this.$popover;

  this.$element.trigger('open.popover');
  this.sizePopover();
  $popover.show().addClass('fn-active');
  this.active = true;
};

Popover.prototype.close = function() {
  var $popover = this.$popover;

  this.$element.trigger('close.popover');

  $popover
    .removeClass('fn-active')
    .trigger('closed.popover')
    .hide();

  this.active = false;
};

Popover.prototype.getPopover = function() {
  var uid = UI.utils.generateGUID('fn-popover');
  var theme = [];

  if (this.options.theme) {
    $.each(this.options.theme.split(' '), function(i, item) {
      theme.push('fn-popover-' + $.trim(item));
    });
  }

  return $(this.options.tpl).attr('id', uid).addClass(theme.join(' '));
};

Popover.prototype.setContent = function(content) {
  content = content || this.options.content;
  this.$popover && this.$popover.find('.fn-popover-inner')
    .empty().html(content);
};

Popover.prototype._bindEvents = function() {
  var eventNS = 'popover';
  var triggers = this.options.trigger.split(' ');

  for (var i = triggers.length; i--;) {
    var trigger = triggers[i];

    if (trigger === 'click') {
      this.$element.on('click.' + eventNS, $.proxy(this.toggle, this));
    } else { // hover or focus
      var eventIn = trigger == 'hover' ? 'mouseenter' : 'focusin';
      var eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout';

      this.$element.on(eventIn + '.' + eventNS, $.proxy(this.open, this));
      this.$element.on(eventOut + '.' + eventNS, $.proxy(this.close, this));
    }
  }
};

Popover.prototype.destroy = function() {
  this.$element.off('.popover').removeData('fnui.popover');
  this.$popover.remove();
};

UI.plugin('popover', Popover);

// Init code
UI.ready(function(context) {
  $('[data-fn-popover]', context).popover();
});

  return Popover;

})
