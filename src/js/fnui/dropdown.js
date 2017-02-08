
/*=============
  FNUI 2.0 DROPDOWN
================*/

define(['jquery','./fnuicore'],function($,UI){

  'use strict';

var animation = UI.support.animation;
var Dropdown = function(element, options) {
  this.options = $.extend({}, Dropdown.DEFAULTS, options);

  options = this.options;

  this.$element = $(element);
  this.$toggle = this.$element.find(options.selector.toggle);
  this.$dropdown = this.$element.find(options.selector.dropdown);
  this.$boundary = (options.boundary === window) ? $(window) :
    this.$element.closest(options.boundary);
  this.$justify = (options.justify && $(options.justify).length &&
  $(options.justify)) || undefined;

  !this.$boundary.length && (this.$boundary = $(window));

  this.active = this.$element.hasClass('fn-active') ? true : false;
  this.animating = null;

  this.events();
};

Dropdown.VERSION = "2.0.0";

Dropdown.DEFAULTS = {
  animation: 'fn-animation-slide-top-fixed',
  boundary: window,
  justify: undefined,
  selector: {
    dropdown: '.fn-dropdown-content',
    toggle: '.fn-dropdown-toggle'
  },
  trigger: 'click'
};

Dropdown.prototype.toggle = function() {
  this.clear();

  if (this.animating) {
    return;
  }

  this[this.active ? 'close' : 'open']();
};

Dropdown.prototype.open = function(e) {
  var $toggle = this.$toggle;
  var $element = this.$element;
  var $dropdown = this.$dropdown;

  if ($toggle.is('.fn-disabled, :disabled')) {
    return;
  }

  if (this.active) {
    return;
  }

  $element.trigger('open.dropdown').addClass('fn-active');

  $toggle.trigger('focus');

  this.checkDimensions();

  var complete = $.proxy(function() {
    $element.trigger('opened.dropdown');
    this.active = true;
    this.animating = 0;
  }, this);


  if (animation) {
    this.animating = 1;
    $dropdown.addClass(this.options.animation).
      one('fnAnimationEnd', $.proxy(function() {
        complete();
        $dropdown.removeClass(this.options.animation);
      }, this)).emulateTransitionEnd(300);
  } else {
    complete();
  }
};

Dropdown.prototype.close = function() {
  if (!this.active) {
    return;
  }
  // var animationName = this.options.animation + ' fn-animation-reverse';
  var animationName = 'fn-dropdown-animation';
  var $element = this.$element;
  var $dropdown = this.$dropdown;

  $element.trigger('close.dropdown');

  var complete = $.proxy(function complete() {
    $element.
      removeClass('fn-active').
      trigger('closed.dropdown');
    this.active = false;
    this.animating = 0;
    this.$toggle.blur();
  }, this);

  if (animation) {
    $dropdown.removeClass(this.options.animation);
    $dropdown.addClass(animationName);
    this.animating = 1;
    // animation
    $dropdown.one(animation.end + '.close.dropdown', function() {
      $dropdown.removeClass(animationName);
      complete();
    });
  } else {
    complete();
  }
};

Dropdown.prototype.enable = function() {
  this.$toggle.prop('disabled', false);
},

Dropdown.prototype.disable = function() {
  this.$toggle.prop('disabled', true);
},

Dropdown.prototype.checkDimensions = function() {
  if (!this.$dropdown.length) {
    return;
  }

  var $dropdown = this.$dropdown;
  var offset = $dropdown.offset();
  var width = $dropdown.outerWidth();
  var boundaryWidth = this.$boundary.width();
  var boundaryOffset = $.isWindow(this.boundary) && this.$boundary.offset() ?
    this.$boundary.offset().left : 0;

  if (this.$justify) {
    // jQuery.fn.width() is really...
    $dropdown.css({'min-width': this.$justify.css('width')});
  }

  if ((width + (offset.left - boundaryOffset)) > boundaryWidth) {
    this.$element.addClass('fn-dropdown-flip');
  }
};

Dropdown.prototype.clear = function() {
  $('[data-fn-dropdown]').not(this.$element).each(function() {
    var data = $(this).data('fnui.dropdown');
    data && data.close();
  });
};

Dropdown.prototype.events = function() {
  var eventNS = 'dropdown';
  var $toggle = this.$toggle;

  $toggle.on('click.' + eventNS, $.proxy(function(e) {
    e.preventDefault();
    this.toggle();
  }, this));

  $(document).on('keydown.dropdown', $.proxy(function(e) {
    e.keyCode === 27 && this.active && this.close();
  }, this)).on('click.outer.dropdown', $.proxy(function(e) {
    // var $target = $(e.target);

    if (this.active &&
      (this.$element[0] === e.target || !this.$element.find(e.target).length)) {
      this.close();
    }
  }, this));
};

// Dropdown Plugin
UI.plugin('dropdown', Dropdown);

// Init code
UI.ready(function(context) {
  $('[data-fn-dropdown]', context).dropdown();
});

$(document).on('click.dropdown.data-api', '.fn-dropdown form',
  function(e) {
    e.stopPropagation();
  });

  return Dropdown;
});