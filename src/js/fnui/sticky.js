
/*=============
  FNUI 2.0 STICKY
================*/


define(['jquery','./fnuicore'],function($,UI){

  
  'use strict';

//Sticky Class
  var Sticky = function(element, options) {
    var _this = this;

    this.options = $.extend({}, Sticky.DEFAULTS, options);
    this.$element = $(element);
    this.sticked = null;
    this.inited = null;
    this.$holder = undefined;

    this.$window = $(window).
      on('scroll.sticky',
      UI.utils.debounce($.proxy(this.checkPosition, this), 10)).
      on('resize.sticky orientationchange.sticky',
      UI.utils.debounce(function() {
        _this.reset(true, function() {
          _this.checkPosition();
        });
      }, 50)).
      on('load.sticky', $.proxy(this.checkPosition, this));

    // the `.offset()` is diff between jQuery & Zepto.js
    // jQuery: return `top` and `left`
    // Zepto.js: return `top`, `left`, `width`, `height`
    this.offset = this.$element.offset();

    this.init();
  };

  Sticky.DEFAULTS = {
    top: 0,
    bottom: 0,
    animation: '',
    className: {
      sticky: 'fn-sticky',
      resetting: 'fn-sticky-resetting',
      stickyBtm: 'fn-sticky-bottom',
      animationRev: 'fn-animation-reverse'
    }
  };

  Sticky.prototype.init = function() {
    var result = this.check();

    if (!result) {
      return false;
    }

    var $element = this.$element;
    var $elementMargin = '';

    $.each($element.css(
        ['marginTop', 'marginRight', 'marginBottom', 'marginLeft']),
      function(name, value) {
        return $elementMargin += ' ' + value;
      });

    var $holder = $('<div class="fn-sticky-placeholder"></div>').css({
      height: $element.css('position') !== 'absolute' ?
        $element.outerHeight() : '',
      float: $element.css('float') != 'none' ? $element.css('float') : '',
      margin: $elementMargin
    });

    this.$holder = $element.css('margin', 0).wrap($holder).parent();
    this.inited = 1;

    return true;
  };

  Sticky.prototype.reset = function(force, cb) {
    var options = this.options;
    var $element = this.$element;
    var animation = (options.animation) ?
    ' fn-animation-' + options.animation : '';
    var complete = function() {
      $element.css({position: '', top: '', width: '', left: '', margin: 0});
      $element.removeClass([
        animation,
        options.className.animationRev,
        options.className.sticky,
        options.className.resetting
      ].join(' '));

      this.animating = false;
      this.sticked = false;
      this.offset = $element.offset();
      cb && cb();
    }.bind(this);

    $element.addClass(options.className.resetting);

    if (!force && options.animation && UI.support.animation) {

      this.animating = true;

      $element.removeClass(animation).one(UI.support.animation.end, function() {
        complete();
      }).width(); // force redraw

      $element.addClass(animation + ' ' + options.className.animationRev);
    } else {
      complete();
    }
  };

  Sticky.prototype.check = function() {
    if (!this.$element.is(':visible')) {
      return false;
    }

    var media = this.options.media;

    if (media) {
      switch (typeof(media)) {
        case 'number':
          if (window.innerWidth < media) {
            return false;
          }
          break;

        case 'string':
          if (window.matchMedia && !window.matchMedia(media).matches) {
            return false;
          }
          break;
      }
    }

    return true;
  };

  Sticky.prototype.checkPosition = function() {
    if (!this.inited) {
      var initialized = this.init();
      if (!initialized) {
        return;
      }
    }

    var options = this.options;
    var scrollTop = this.$window.scrollTop();
    var offsetTop = options.top;
    var offsetBottom = options.bottom;
    var $element = this.$element;
    var animation = (options.animation) ?
      ' fn-animation-' + options.animation : '';
    var className = [options.className.sticky, animation].join(' ');

    if (typeof offsetBottom == 'function') {
      offsetBottom = offsetBottom(this.$element);
    }

    var checkResult = (scrollTop > this.$holder.offset().top);

    if (!this.sticked && checkResult) {
      $element.addClass(className);
    } else if (this.sticked && !checkResult) {
      this.reset();
    }

    this.$holder.css({
      height: $element.is(':visible') && $element.css('position') !== 'absolute' ?
        $element.outerHeight() : ''
    });

    if (checkResult) {
      $element.css({
        top: offsetTop,
        left: this.$holder.offset().left,
        width: this.$holder.width()
      });
    }

    this.sticked = checkResult;
  };

  // Sticky Plugin
  UI.plugin('sticky', Sticky);

  // Init code
  UI.ready(function(context) {
	  $('[data-fn-sticky]').sticky();
  });

  return Sticky;

});
