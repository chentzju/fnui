/*=============
  FNUI 2.0 OFFCANVAS
================*/

define(['jquery','./fnuicore','./hammer'],function($,UI){

  
  'use strict';

var $win = $(window);
var $doc = $(document);
var scrollPos;


var OffCanvas = function(element, options) {
  this.$element = $(element);
  this.options = $.extend({}, OffCanvas.DEFAULTS, options);
  this.active = null;
  this.bindEvents();
};

OffCanvas.DEFAULTS = {
  duration: 300,
  effect: 'overlay' // {push|overlay}, push is too expensive
};

OffCanvas.prototype.open = function(relatedElement) {
  var _this = this;
  var $element = this.$element;

  if (!$element.length || $element.hasClass('fn-active')) {
    return;
  }

  var effect = this.options.effect;
  var $html = $('html');
  var $body = $('body');
  var $bar = $element.find('.fn-offcanvas-bar').first();
  var dir = $bar.hasClass('fn-offcanvas-bar-flip') ? -1 : 1;

  $bar.addClass('fn-offcanvas-bar-' + effect);

  scrollPos = {x: window.scrollX, y: window.scrollY};

  $element.addClass('fn-active');

  $body.css({
    width: window.innerWidth,
    height: $win.height()
  }).addClass('fn-offcanvas-page');

  if (effect !== 'overlay') {
    $body.css({
      'margin-left': $bar.outerWidth() * dir
    }).width(); // force redraw
  }

  $html.css('margin-top', scrollPos.y * -1);

  setTimeout(function() {
    $bar.addClass('fn-offcanvas-bar-active').width();
  }, 0);

  $element.trigger('open.offcanvas');

  this.active = 1;

  // Close OffCanvas when none content area clicked
  $element.on('click.offcanvas', function(e) {
    var $target = $(e.target);

    if ($target.hasClass('fn-offcanvas-bar')) {
      return;
    }

    if ($target.parents('.fn-offcanvas-bar').first().length) {
      return;
    }

    // https://developer.mozilla.org/zh-CN/docs/DOM/event.stopImmediatePropagation
    e.stopImmediatePropagation();

    _this.close();
  });

  $html.on('keydown.offcanvas', function(e) {
    (e.keyCode === 27) && _this.close();
  });
};

OffCanvas.prototype.close = function(relatedElement) {
  var _this = this;
  var $html = $('html');
  var $body = $('body');
  var $element = this.$element;
  var $bar = $element.find('.fn-offcanvas-bar').first();

  if (!$element.length || !this.active || !$element.hasClass('fn-active')) {
    return;
  }

  $element.trigger('close.offcanvas');

  function complete() {
    $body
      .removeClass('fn-offcanvas-page')
      .css({
        width: '',
        height: '',
        'margin-left': '',
        'margin-right': ''
      });
    $element.removeClass('fn-active');
    $bar.removeClass('fn-offcanvas-bar-active');
    $html.css('margin-top', '');
    window.scrollTo(scrollPos.x, scrollPos.y);
    $element.trigger('closed.offcanvas');
    _this.active = 0;
  }

  if (UI.support.transition) {
    setTimeout(function() {
      $bar.removeClass('fn-offcanvas-bar-active');
    }, 0);

    $body.css('margin-left', '').one('fnTransitionEnd', function() {
      complete();
    }).emulateTransitionEnd(this.options.duration);
  } else {
    complete();
  }

  $element.off('click.offcanvas');
  $html.off('.offcanvas');
};

OffCanvas.prototype.bindEvents = function() {
  var _this = this;
  $doc.on('click.offcanvas', '[data-fn-dismiss="offcanvas"]', function(e) {
      e.preventDefault();
      _this.close();
    });

  $win.on('resize.offcanvas orientationchange.offcanvas',
    function() {
      _this.active && _this.close();
    });

  this.$element.hammer().on('swipeleft swipeleft', function(e) {
    e.preventDefault();
    _this.close();
  });

  return this;
};

function Plugin(option, relatedElement) {
  var args = Array.prototype.slice.call(arguments, 1);

  return this.each(function() {
    var $this = $(this);
    var data = $this.data('fnui.offcanvas');
    var options = $.extend({}, typeof option == 'object' && option);

    if (!data) {
      $this.data('fnui.offcanvas', (data = new OffCanvas(this, options)));
      (!option || typeof option == 'object') && data.open(relatedElement);
    }

    if (typeof option == 'string') {
      data[option] && data[option].apply(data, args);
    }
  });
}

$.fn.offCanvas = Plugin;

// Init code
$doc.on('click.offcanvas', '[data-fn-offcanvas]', function(e) {
  e.preventDefault();
  var $this = $(this);
  var options = UI.utils.parseOptions($this.data('fn-offcanvas'));
  var $target = $(options.target ||
  (this.href && this.href.replace(/.*(?=#[^\s]+$)/, '')));
  var option = $target.data('fnui.offcanvas') ? 'open' : options;

  Plugin.call($target, option, this);
});

  return OffCanvas;

});