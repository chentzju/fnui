
/*=============
  FNUI 2.0 ScrollSpyNav
================*/


define(['jquery','./fnuicore'],function($,UI){

    'use strict';

    
  var $win = $(window);
   
// ScrollSpyNav Class
var ScrollSpyNav = function(element, options) {
  this.options = $.extend({}, ScrollSpyNav.DEFAULTS, options);
  this.$element = $(element);
  this.anchors = [];

  this.$links = this.$element.find('a[href^="#"]').each(function(i, link) {
    this.anchors.push($(link).attr('href'));
  }.bind(this));

  this.$targets = $(this.anchors.join(', '));

  var processRAF = function() {
    UI.rAF.call(window, $.proxy(this.process, this));
  }.bind(this);

  this.$window = $(window).on('scroll.scrollspynav', processRAF)
    .on('resize.scrollspynav orientationchange.scrollspynav',
    UI.utils.debounce(processRAF, 50));

  processRAF();
  this.scrollProcess();
};

ScrollSpyNav.DEFAULTS = {
  className: {
    active: 'fn-active'
  },
  closest: false,
  smooth: true,
  offsetTop: 0
};

ScrollSpyNav.prototype.process = function() {
  var scrollTop = this.$window.scrollTop();
  var options = this.options;
  var inViews = [];
  var $links = this.$links;

  var $targets = this.$targets;

  $targets.each(function(i, target) {
    if (isInView(target, options)) {
      inViews.push(target);
    }
  });

  // console.log(inViews.length);

  if (inViews.length) {
    var $target;

    $.each(inViews, function(i, item) {
      if ($(item).offset().top >= scrollTop) {
        $target = $(item);
        return false; // break
      }
    });

    if (!$target) {
      return;
    }

    if (options.closest) {
      $links.closest(options.closest).removeClass(options.className.active);
      $links.filter('a[href="#' + $target.attr('id') + '"]').
        closest(options.closest).addClass(options.className.active);
    } else {
      $links.removeClass(options.className.active).
        filter('a[href="#' + $target.attr('id') + '"]').
        addClass(options.className.active);
    }
  }
};

ScrollSpyNav.prototype.scrollProcess = function() {
  var $links = this.$links;
  var options = this.options;

  // smoothScroll
  if (options.smooth && $.fn.smoothScroll) {
    $links.on('click', function(e) {
      e.preventDefault();

      var $this = $(this);
      var $target = $($this.attr('href'));

      if (!$target) {
        return;
      }

      var offsetTop = options.offsetTop &&
        !isNaN(parseInt(options.offsetTop)) && parseInt(options.offsetTop) || 0;

      $(window).smoothScroll({position: $target.offset().top - offsetTop});
    });
  }
};

function isInView(element, options) {
  var $element = $(element);
  var visible = !!($element.width() || $element.height()) &&
    $element.css('display') !== 'none';

  if (!visible) {
    return false;
  }

  var windowLeft = $win.scrollLeft();
  var windowTop = $win.scrollTop();
  var offset = $element.offset();
  var left = offset.left;
  var top = offset.top;

  options = $.extend({topOffset: 0, leftOffset: 0}, options);

  return (top + $element.height() >= windowTop &&
  top - options.topOffset <= windowTop + $win.height() &&
  left + $element.width() >= windowLeft &&
  left - options.leftOffset <= windowLeft + $win.width());
};

// ScrollSpyNav Plugin
UI.plugin('scrollspynav', ScrollSpyNav);

// Init code
UI.ready(function(context) {
  $('[data-fn-scrollspy-nav]', context).scrollspynav();
});

  return ScrollSpyNav;
})