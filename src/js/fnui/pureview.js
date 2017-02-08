define(['jquery','./fnuicore','./pinchzoom','./hammer'],function($,UI,PinchZoom,Hammer){
          
  'use strict';
  
var animation = UI.support.animation;
var transition = UI.support.transition;

/**
 * PureView
 * @desc Image browser for Mobile
 * @param element
 * @param options
 * @constructor
 */

var PureView = function(element, options) {
  this.$element = $(element);
  this.$body = $(document.body);
  this.options = $.extend({}, PureView.DEFAULTS, options);
  this.$pureview = $(this.options.tpl).attr('id',
    UI.utils.generateGUID('fn-pureview'));

  this.$slides = null;
  this.transitioning = null;
  this.scrollbarWidth = 0;

  this.init();
};

PureView.DEFAULTS = {
  tpl: '<div class="fn-pureview fn-pureview-bar-active">' +
  '<ul class="fn-pureview-slider"></ul>' +
  '<ul class="fn-pureview-direction">' +
  '<li class="fn-pureview-prev"><a href=""></a></li>' +
  '<li class="fn-pureview-next"><a href=""></a></li></ul>' +
  '<ol class="fn-pureview-nav"></ol>' +
  '<div class="fn-pureview-bar fn-active">' +
  '<span class="fn-pureview-title"></span>' +
  '<div class="fn-pureview-counter"><span class="fn-pureview-current"></span> / ' +
  '<span class="fn-pureview-total"></span></div></div>' +
  '<div class="fn-pureview-actions fn-active">' +
  '<a href="javascript: void(0)" class="fn-icon-chevron-left" ' +
  'data-fn-close="pureview"></a></div>' +
  '</div>',

  className: {
    prevSlide: 'fn-pureview-slide-prev',
    nextSlide: 'fn-pureview-slide-next',
    onlyOne: 'fn-pureview-only',
    active: 'fn-active',
    barActive: 'fn-pureview-bar-active',
    activeBody: 'fn-pureview-active'
  },

  selector: {
    slider: '.fn-pureview-slider',
    close: '[data-fn-close="pureview"]',
    total: '.fn-pureview-total',
    current: '.fn-pureview-current',
    title: '.fn-pureview-title',
    actions: '.fn-pureview-actions',
    bar: '.fn-pureview-bar',
    pinchZoom: '.fn-pinch-zoom',
    nav: '.fn-pureview-nav'
  },

  shareBtn: false,

  // press to toggle Toolbar
  toggleToolbar: true,

  // 从何处获取图片，img 可以使用 data-rel 指定大图
  target: 'img',

  weChatImagePreview: true
};

PureView.prototype.init = function() {
  var _this = this;
  var options = this.options;
  var $element = this.$element;
  var $pureview = this.$pureview;

  this.refreshSlides();

  $('body').append($pureview);

  this.$title = $pureview.find(options.selector.title);
  this.$current = $pureview.find(options.selector.current);
  this.$bar = $pureview.find(options.selector.bar);
  this.$actions = $pureview.find(options.selector.actions);

  if (options.shareBtn) {
    this.$actions.append('<a href="javascript: void(0)" ' +
    'class="fn-icon-share-square-o" data-fn-toggle="share"></a>');
  }

  this.$element.on('click.pureview', options.target, function(e) {
    e.preventDefault();
    var clicked = _this.$images.index(this);

    // Invoke WeChat ImagePreview in WeChat
    // TODO: detect WeChat before init
    if (options.weChatImagePreview && window.WeixinJSBridge) {
      window.WeixinJSBridge.invoke('imagePreview', {
        current: _this.imgUrls[clicked],
        urls: _this.imgUrls
      });
    } else {
      _this.open(clicked);
    }
  });

  $pureview.find('.fn-pureview-direction').
    on('click.direction.pureview', 'li', function(e) {
      e.preventDefault();

      if ($(this).is('.fn-pureview-prev')) {
        _this.prevSlide();
      } else {
        _this.nextSlide();
      }
    });

  // Nav Contorl
  $pureview.find(options.selector.nav).on('click.nav.pureview', 'li',
    function() {
      var index = _this.$navItems.index($(this));
      _this.activate(_this.$slides.eq(index));
    });

  // Close Icon
  $pureview.find(options.selector.close).
    on('click.close.pureview', function(e) {
      e.preventDefault();
      _this.close();
    });

  this.$slider.hammer().on('swipeleft.pureview', function(e) {
    e.preventDefault();
    _this.nextSlide();
  }).on('swiperight.pureview', function(e) {
    e.preventDefault();
    _this.prevSlide();
  }).on('press.pureview', function(e) {
    e.preventDefault();
    options.toggleToolbar && _this.toggleToolBar();
  });

  this.$slider.data('hammer').get('swipe').set({
    direction: Hammer.DIRECTION_HORIZONTAL,
    velocity: 0.35
  });

  // Observe DOM
  $element.DOMObserve({
    childList: true,
    subtree: true
  }, function(mutations, observer) {
    // _this.refreshSlides();
    // console.log('mutations[0].type);
  });

  // NOTE:
  // trigger this event manually if MutationObserver not supported
  //   when new images appended, or call refreshSlides()
  // if (!UI.support.mutationobserver) $element.trigger('changed.dom')
  $element.on('changed.dom', function(e) {
    e.stopPropagation();
    _this.refreshSlides();
  });

  $(document).on('keydown.pureview', $.proxy(function(e) {
    var keyCode = e.keyCode;
    if (keyCode == 37) {
      this.prevSlide();
    } else if (keyCode == 39) {
      this.nextSlide();
    } else if (keyCode == 27) {
      this.close();
    }
  }, this));
};

PureView.prototype.refreshSlides = function() {
  // update images collections
  this.$images = this.$element.find(this.options.target);
  var _this = this;
  var options = this.options;
  var $pureview = this.$pureview;
  var $slides = $([]);
  var $navItems = $([]);
  var $images = this.$images;
  var total = $images.length;
  this.$slider = $pureview.find(options.selector.slider);
  this.$nav = $pureview.find(options.selector.nav);
  var viewedFlag = 'data-fn-pureviewed';
  // for WeChat Image Preview
  this.imgUrls = this.imgUrls || [];

  if (!total) {
    return;
  }

  if (total === 1) {
    $pureview.addClass(options.className.onlyOne);
  }

  $images.not('[' + viewedFlag + ']').each(function(i, item) {
    var src;
    var title;

    // get image URI from link's href attribute
    if (item.nodeName === 'A') {
      src = item.href; // to absolute path
      title = item.title || '';
    } else {
      // NOTE: `data-rel` should be a full URL, otherwise,
      //        WeChat images preview will not work
      src = $(item).data('rel') || item.src; // <img src='' data-rel='' />
      src = getAbsoluteUrl(src);
      title = $(item).attr('alt') || '';
    }

    // add pureviewed flag
    item.setAttribute(viewedFlag, '1');

    // hide bar: wechat_webview_type=1
    // http://tmt.io/wechat/  not working?
    _this.imgUrls.push(src);

    $slides = $slides.add($('<li data-src="' + src + '" data-title="' + title +
    '"></li>'));
    $navItems = $navItems.add($('<li>' + (i + 1) + '</li>'));
  });

  $pureview.find(options.selector.total).text(total);

  this.$slider.append($slides);
  this.$nav.append($navItems);
  this.$navItems = this.$nav.find('li');
  this.$slides = this.$slider.find('li');
};

PureView.prototype.loadImage = function($slide, callback) {
  var appendedFlag = 'image-appended';

  if (!$slide.data(appendedFlag)) {
    var $img = $('<img>', {
      src: $slide.data('src'),
      alt: $slide.data('title')
    });

    $slide.html($img).wrapInner('<div class="fn-pinch-zoom"></div>');

    var $pinchWrapper = $slide.find(this.options.selector.pinchZoom);
    $pinchWrapper.data('fnui.pinchzoom', new PinchZoom($pinchWrapper[0], {}));
    $slide.data('image-appended', true);
  }

  callback && callback.call(this);
};

PureView.prototype.activate = function($slide) {
  var options = this.options;
  var $slides = this.$slides;
  var activeIndex = $slides.index($slide);
  var title = $slide.data('title') || '';
  var active = options.className.active;

  if ($slides.find('.' + active).is($slide)) {
    return;
  }

  if (this.transitioning) {
    return;
  }

  this.loadImage($slide, function() {
    imageLoader($slide.find('img'), function(image) {
      $slide.find('.fn-pinch-zoom').addClass('fn-pureview-loaded');
      $(image).addClass('fn-img-loaded');
    });
  });

  this.transitioning = 1;

  this.$title.text(title);
  this.$current.text(activeIndex + 1);
  $slides.removeClass();
  $slide.addClass(active);
  $slides.eq(activeIndex - 1).addClass(options.className.prevSlide);
  $slides.eq(activeIndex + 1).addClass(options.className.nextSlide);

  this.$navItems.removeClass().
    eq(activeIndex).addClass(options.className.active);

  if (transition) {
    $slide.one(transition.end, $.proxy(function() {
      this.transitioning = 0;
    }, this)).emulateTransitionEnd(300);
  } else {
    this.transitioning = 0;
  }
};

PureView.prototype.nextSlide = function() {
  if (this.$slides.length === 1) {
    return;
  }

  var $slides = this.$slides;
  var $active = $slides.filter('.fn-active');
  var activeIndex = $slides.index($active);
  var rightSpring = 'fn-animation-right-spring';

  if (activeIndex + 1 >= $slides.length) { // last one
    animation && $active.addClass(rightSpring).on(animation.end, function() {
      $active.removeClass(rightSpring);
    });
  } else {
    this.activate($slides.eq(activeIndex + 1));
  }
};

PureView.prototype.prevSlide = function() {
  if (this.$slides.length === 1) {
    return;
  }

  var $slides = this.$slides;
  var $active = $slides.filter('.fn-active');
  var activeIndex = this.$slides.index(($active));
  var leftSpring = 'fn-animation-left-spring';

  if (activeIndex === 0) { // first one
    animation && $active.addClass(leftSpring).on(animation.end, function() {
      $active.removeClass(leftSpring);
    });
  } else {
    this.activate($slides.eq(activeIndex - 1));
  }
};

PureView.prototype.toggleToolBar = function() {
  this.$pureview.toggleClass(this.options.className.barActive);
};

PureView.prototype.open = function(index) {
  var active = index || 0;
  this.checkScrollbar();
  this.setScrollbar();
  this.activate(this.$slides.eq(active));
  this.$pureview.show().addClass(this.options.className.active);
  this.$body.addClass(this.options.className.activeBody);
};

PureView.prototype.close = function() {
  var options = this.options;

  this.$pureview.removeClass(options.className.active);
  this.$slides.removeClass();

  function resetBody() {
    this.$pureview.hide();
    this.$body.removeClass(options.className.activeBody);
    this.resetScrollbar();
  }

  if (transition) {
    this.$pureview.one(transition.end, $.proxy(resetBody, this)).
      emulateTransitionEnd(300);
  } else {
    resetBody.call(this);
  }
};

PureView.prototype.checkScrollbar = function() {
  this.scrollbarWidth = measureScrollbar();
};

PureView.prototype.setScrollbar = function() {
  var bodyPaddingRight = parseInt((this.$body.css('padding-right') || 0), 10);
  if (this.scrollbarWidth) {
    this.$body.css('padding-right', bodyPaddingRight + this.scrollbarWidth);
  }
};

PureView.prototype.resetScrollbar = function() {
  this.$body.css('padding-right', '');
};
var getAbsoluteUrl = (function() {
	  var a;

	  return function(url) {
	    if (!a) {
	      a = document.createElement('a');
	    }

	    a.href = url;

	    return a.href;
	  };
})();
var measureScrollbar = function() {
	  if (document.body.clientWidth >= window.innerWidth) {
	    return 0;
	  }

	  // if ($html.width() >= window.innerWidth) return;
	  // var scrollbarWidth = window.innerWidth - $html.width();
	  var $measure = $('<div ' +
	  'style="width: 100px;height: 100px;overflow: scroll;' +
	  'position: absolute;top: -9999px;"></div>');

	  $(document.body).append($measure);

	  var scrollbarWidth = $measure[0].offsetWidth - $measure[0].clientWidth;

	  $measure.remove();

	  return scrollbarWidth;
};
var imageLoader = function($image, callback) {
	  function loaded() {
		    callback($image[0]);
		  }

		  function bindLoad() {
		    this.one('load', loaded);
		    if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)) {
		      var src = this.attr('src');
		      var param = src.match(/\?/) ? '&' : '?';

		      param += 'random=' + (new Date()).getTime();
		      this.attr('src', src + param);
		    }
		  }

		  if (!$image.attr('src')) {
		    loaded();
		    return;
		  }

		  if ($image[0].complete || $image[0].readyState === 4) {
		    loaded();
		  } else {
		    bindLoad.call($image);
		  }
		};

UI.plugin('pureview', PureView);

// Init code
UI.ready(function(context) {
  $('[data-fn-pureview]', context).pureview();
});

	return PureView;
});

