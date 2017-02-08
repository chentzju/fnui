
/*=============
  FNUI 2.0 slider
================*/

define(['jquery','./fnuicore'],function($,UI){

    'use strict';
    

 // FlexSlider: Object Instance
 $.flexslider = function(el, options) {
   var slider = $(el);

   // making variables public
   slider.vars = $.extend({}, $.flexslider.defaults, options);

   var namespace = 'fn-',
     msGesture = window.navigator && window.navigator.msPointerEnabled && window.MSGesture,
     touch = (( "ontouchstart" in window ) || msGesture || window.DocumentTouch && document instanceof DocumentTouch) && slider.vars.touch,
    //eventType = (touch) ? "touchend" : "click",
     eventType = "click touchend MSPointerUp",
     watchedEvent = "",
     watchedEventClearTimer,
     vertical = slider.vars.direction === "vertical",
     carousel = (slider.vars.itemWidth > 0),
     fade = slider.vars.animation === "fade",
     methods = {},
     focused = true;

   // Store a reference to the slider object
   $.data(el, 'flexslider', slider);

   // Private slider methods
   methods = {
     init: function() {
       slider.animating = false;
       // Get current slide and make sure it is a number
       slider.currentSlide = parseInt((slider.vars.startAt ? slider.vars.startAt : 0), 10);
       if (isNaN(slider.currentSlide)) {
         slider.currentSlide = 0;
       }
       slider.animatingTo = slider.currentSlide;
       slider.atEnd = (slider.currentSlide === 0 || slider.currentSlide === slider.last);
       slider.containerSelector = slider.vars.selector.substr(0, slider.vars.selector.search(' '));
       slider.slides = $(slider.vars.selector, slider);
       slider.container = $(slider.containerSelector, slider);
       slider.count = slider.slides.length;
       
       // SLIDE:
       if (slider.vars.animation === "slide") {
         slider.vars.animation = "swing";
       }
       slider.prop = (vertical) ? "top" : "marginLeft";
       slider.args = {};
       // SLIDESHOW:
       slider.manualPause = false;
       slider.stopped = false;
       //PAUSE WHEN INVISIBLE
       slider.started = false;
       slider.startTimeout = null;
       // TOUCH/USECSS:
       slider.transitions = !slider.vars.video && !fade && slider.vars.useCSS && (function() {
         var obj = document.createElement('div'),
           props = ['perspectiveProperty', 'WebkitPerspective', 'MozPerspective', 'OPerspective', 'msPerspective'];
         for (var i in props) {
           if (obj.style[props[i]] !== undefined) {
             slider.pfx = props[i].replace('Perspective', '').toLowerCase();
             slider.prop = "-" + slider.pfx + "-transform";
             return true;
           }
         }
         return false;
       }());
       slider.ensureAnimationEnd = '';
       
       slider.doMath();

       // INIT
       slider.setup("init");

       // CONTROLNAV:
       if (slider.vars.controlNav) {
         methods.controlNav.setup();
       }

       // DIRECTIONNAV:
       if (slider.vars.directionNav) {
         methods.directionNav.setup();
       }

       //PAUSE WHEN INVISIBLE
       if (slider.vars.slideshow && slider.vars.pauseInvisible) {
         methods.pauseInvisible.init();
       }

       // SLIDSESHOW
       if (slider.vars.slideshow) {
         if (slider.vars.pauseOnHover) {
             slider.hover(function() {
                 if (!slider.manualPlay && !slider.manualPause) {slider.pause();}
               }, function() {
                 if (!slider.manualPause && !slider.manualPlay && !slider.stopped) {slider.play();}
               });
         }
	      // initialize animation
	      // If we're visible, or we don't use PageVisibility API
	      if (!slider.vars.pauseInvisible || !methods.pauseInvisible.isHidden()) {
	          (slider.vars.initDelay > 0) ? slider.startTimeout = setTimeout(slider.play, slider.vars.initDelay) : slider.play();
	      }
       }
       
       // TOUCH
       if (touch && slider.vars.touch) {methods.touch();}

       slider.find("img").attr("draggable", "false");

       // API: start() Callback
       setTimeout(function() {
         slider.vars.start(slider);
       }, 200);
     },
     controlNav: {
       setup: function() {
         if (!slider.manualControls) {
           methods.controlNav.setupPaging();
         } else { // MANUALCONTROLS:
           methods.controlNav.setupManual();
         }
       },
       setupPaging: function() {
         var type = (slider.vars.controlNav === "thumbnails") ? 'control-thumbs' : 'control-paging',
           j = 1,
           item,
           slide;

         slider.controlNavScaffold = $('<ol class="' + namespace + 'control-nav ' + namespace + type + '"></ol>');

         if (slider.pagingCount > 1) {
           for (var i = 0; i < slider.pagingCount; i++) {
             slide = slider.slides.eq(i);
             item = (slider.vars.controlNav === "thumbnails") ? '<img src="' + slide.attr('data-thumb') + '"/>' : '<a>' + j + '</a>';
             slider.controlNavScaffold.append('<li>' + item + '<i></i></li>');
             j++;
           }
         }

         // CONTROLSCONTAINER:
         slider.append(slider.controlNavScaffold);
         methods.controlNav.set();

         methods.controlNav.active();

         slider.controlNavScaffold.delegate('a, img', eventType, function(event) {
           event.preventDefault();

           if (watchedEvent === "" || watchedEvent === event.type) {
             var $this = $(this),
               target = slider.controlNav.index($this);

             if (!$this.hasClass(namespace + 'active')) {
               slider.direction = (target > slider.currentSlide) ? "next" : "prev";
               slider.flexAnimate(target, slider.vars.pauseOnAction);
             }
           }

           // setup flags to prevent event duplication
           if (watchedEvent === "") {
             watchedEvent = event.type;
           }
           methods.setToClearWatchedEvent();

         });
       },
       setupManual: function() {
         slider.controlNav = slider.manualControls;
         methods.controlNav.active();

         slider.controlNav.bind(eventType, function(event) {
           event.preventDefault();

           if (watchedEvent === "" || watchedEvent === event.type) {
             var $this = $(this),
               target = slider.controlNav.index($this);

             if (!$this.hasClass(namespace + 'active')) {
               (target > slider.currentSlide) ? slider.direction = "next" : slider.direction = "prev";
               slider.flexAnimate(target, slider.vars.pauseOnAction);
             }
           }

           // setup flags to prevent event duplication
           if (watchedEvent === "") {
             watchedEvent = event.type;
           }
           methods.setToClearWatchedEvent();
         });
       },
       set: function() {
         var selector = (slider.vars.controlNav === "thumbnails") ? 'img' : 'a';
         slider.controlNav = $('.' + namespace + 'control-nav li ' + selector, (slider.controlsContainer) ? slider.controlsContainer : slider);
       },
       active: function() {
         slider.controlNav.removeClass(namespace + "active").eq(slider.animatingTo).addClass(namespace + "active");
       },
       update: function(action, pos) {
         if (slider.pagingCount > 1 && action === "add") {
           slider.controlNavScaffold.append($('<li><a>' + slider.count + '</a></li>'));
         } else if (slider.pagingCount === 1) {
           slider.controlNavScaffold.find('li').remove();
         } else {
           slider.controlNav.eq(pos).closest('li').remove();
         }
         methods.controlNav.set();
         (slider.pagingCount > 1 && slider.pagingCount !== slider.controlNav.length) ? slider.update(pos, action) : methods.controlNav.active();
       }
     },
     directionNav: {
       setup: function() {
         var directionNavScaffold = $('<ul class="' + namespace + 'direction-nav"><li class="' + namespace + 'nav-prev"><a class="' + namespace + 'prev" href="#">' + slider.vars.prevText + '</a></li><li class="' + namespace + 'nav-next"><a class="' + namespace + 'next" href="#">' + slider.vars.nextText + '</a></li></ul>');

         // CONTROLSCONTAINER:
         if (slider.controlsContainer) {
           $(slider.controlsContainer).append(directionNavScaffold);
           slider.directionNav = $('.' + namespace + 'direction-nav li a', slider.controlsContainer);
         } else {
           slider.append(directionNavScaffold);
           slider.directionNav = $('.' + namespace + 'direction-nav li a', slider);
         }

         methods.directionNav.update();

         slider.directionNav.bind(eventType, function(event) {
           event.preventDefault();
           var target;

           if (watchedEvent === "" || watchedEvent === event.type) {
             target = ($(this).hasClass(namespace + 'next')) ? slider.getTarget('next') : slider.getTarget('prev');
             slider.flexAnimate(target, slider.vars.pauseOnAction);
           }

           // setup flags to prevent event duplication
           if (watchedEvent === "") {
             watchedEvent = event.type;
           }
           methods.setToClearWatchedEvent();
         });
       },
       update: function() {
         var disabledClass = namespace + 'disabled';
         if (slider.pagingCount === 1) {
           slider.directionNav.addClass(disabledClass).attr('tabindex', '-1');
         } else if (!slider.vars.animationLoop) {
           if (slider.animatingTo === 0) {
             slider.directionNav.removeClass(disabledClass).filter('.' + namespace + "prev").addClass(disabledClass).attr('tabindex', '-1');
           } else if (slider.animatingTo === slider.last) {
             slider.directionNav.removeClass(disabledClass).filter('.' + namespace + "next").addClass(disabledClass).attr('tabindex', '-1');
           } else {
             slider.directionNav.removeClass(disabledClass).removeAttr('tabindex');
           }
         } else {
           slider.directionNav.removeClass(disabledClass).removeAttr('tabindex');
         }
       }
     },
     pausePlay: {
       setup: function() {
         var pausePlayScaffold = $('<div class="' + namespace + 'pauseplay"><a></a></div>');

         // CONTROLSCONTAINER:
         if (slider.controlsContainer) {
           slider.controlsContainer.append(pausePlayScaffold);
           slider.pausePlay = $('.' + namespace + 'pauseplay a', slider.controlsContainer);
         } else {
           slider.append(pausePlayScaffold);
           slider.pausePlay = $('.' + namespace + 'pauseplay a', slider);
         }

         methods.pausePlay.update((slider.vars.slideshow) ? namespace + 'pause' : namespace + 'play');

         slider.pausePlay.bind(eventType, function(event) {
           event.preventDefault();

           if (watchedEvent === "" || watchedEvent === event.type) {
             if ($(this).hasClass(namespace + 'pause')) {
               slider.manualPause = true;
               slider.manualPlay = false;
               slider.pause();
             } else {
               slider.manualPause = false;
               slider.manualPlay = true;
               slider.play();
             }
           }

           // setup flags to prevent event duplication
           if (watchedEvent === "") {
             watchedEvent = event.type;
           }
           methods.setToClearWatchedEvent();
         });
       },
       update: function(state) {
         (state === "play") ? slider.pausePlay.removeClass(namespace + 'pause').addClass(namespace + 'play').html(slider.vars.playText) : slider.pausePlay.removeClass(namespace + 'play').addClass(namespace + 'pause').html(slider.vars.pauseText);
       }
     },
     touch: function() {
       var startX,
         startY,
         offset,
         cwidth,
         dx,
         startT,
         scrolling = false,
         localX = 0,
         localY = 0,
         accDx = 0;

       if (!msGesture) {
         el.addEventListener('touchstart', onTouchStart, false);

         function onTouchStart(e) {
           if (slider.animating) {
             e.preventDefault();
           } else if (( window.navigator.msPointerEnabled ) || e.touches.length === 1) {
             slider.pause();
             // CAROUSEL:
             cwidth = (vertical) ? slider.h : slider.w;
             startT = Number(new Date());
             // CAROUSEL:

             // Local vars for X and Y points.
             localX = e.touches[0].pageX;
             localY = e.touches[0].pageY;

             offset = (carousel && slider.currentSlide === slider.last) ? slider.limit :
                   (carousel) ? ((slider.itemW + slider.vars.itemMargin) * slider.move) * slider.currentSlide :
                     (slider.currentSlide + slider.cloneOffset) * cwidth;
             startX = (vertical) ? localY : localX;
             startY = (vertical) ? localX : localY;

             el.addEventListener('touchmove', onTouchMove, false);
             el.addEventListener('touchend', onTouchEnd, false);
           }
         }

         function onTouchMove(e) {
           // Local vars for X and Y points.

           localX = e.touches[0].pageX;
           localY = e.touches[0].pageY;

           dx = (vertical) ? startX - localY : startX - localX;
           scrolling = (vertical) ? (Math.abs(dx) < Math.abs(localX - startY)) : (Math.abs(dx) < Math.abs(localY - startY));

           var fxms = 500;

           if (!scrolling || Number(new Date()) - startT > fxms) {
             e.preventDefault();
             if (!fade && slider.transitions) {
               if (!slider.vars.animationLoop) {
                 dx = dx / ((slider.currentSlide === 0 && dx < 0 || slider.currentSlide === slider.last && dx > 0) ? (Math.abs(dx) / cwidth + 2) : 1);
               }
               slider.setProps(offset + dx, "setTouch");
             }
           }
         }

         function onTouchEnd(e) {
           // finish the touch by undoing the touch session
           el.removeEventListener('touchmove', onTouchMove, false);

           if (slider.animatingTo === slider.currentSlide && !scrolling && !(dx === null)) {
             var updateDx =  dx,
               target = (updateDx > 0) ? slider.getTarget('next') : slider.getTarget('prev');

             if (slider.canAdvance(target) && (Number(new Date()) - startT < 550 && Math.abs(updateDx) > 50 || Math.abs(updateDx) > cwidth / 2)) {
               slider.flexAnimate(target, slider.vars.pauseOnAction);
             } else {
               if (!fade) {slider.flexAnimate(slider.currentSlide, slider.vars.pauseOnAction, true);}
             }
           }
           el.removeEventListener('touchend', onTouchEnd, false);

           startX = null;
           startY = null;
           dx = null;
           offset = null;
         }
       } else {
         el.style.msTouchAction = "none";
         el._gesture = new MSGesture();
         el._gesture.target = el;
         el.addEventListener("MSPointerDown", onMSPointerDown, false);
         el._slider = slider;
         el.addEventListener("MSGestureChange", onMSGestureChange, false);
         el.addEventListener("MSGestureEnd", onMSGestureEnd, false);

         function onMSPointerDown(e) {
           e.stopPropagation();
           if (slider.animating) {
             e.preventDefault();
           } else {
             slider.pause();
             el._gesture.addPointer(e.pointerId);
             accDx = 0;
             cwidth = (vertical) ? slider.h : slider.w;
             startT = Number(new Date());
             // CAROUSEL:

             offset = (carousel && slider.currentSlide === slider.last) ? slider.limit :
                   (carousel) ? ((slider.itemW + slider.vars.itemMargin) * slider.move) * slider.currentSlide :
                     (slider.currentSlide + slider.cloneOffset) * cwidth;
           }
         }

         function onMSGestureChange(e) {
           e.stopPropagation();
           var slider = e.target._slider;
           if (!slider) {
             return;
           }
           var transX = -e.translationX,
             transY = -e.translationY;

           //Accumulate translations.
           accDx = accDx + ((vertical) ? transY : transX);
           dx = accDx;
           scrolling = (vertical) ? (Math.abs(accDx) < Math.abs(-transX)) : (Math.abs(accDx) < Math.abs(-transY));

           if (e.detail === e.MSGESTURE_FLAG_INERTIA) {
             setImmediate(function() {
               el._gesture.stop();
             });

             return;
           }

           if (!scrolling || Number(new Date()) - startT > 500) {
             e.preventDefault();
             if (!fade && slider.transitions) {
               if (!slider.vars.animationLoop) {
                 dx = accDx / ((slider.currentSlide === 0 && accDx < 0 || slider.currentSlide === slider.last && accDx > 0) ? (Math.abs(accDx) / cwidth + 2) : 1);
               }
               slider.setProps(offset + dx, "setTouch");
             }
           }
         }

         function onMSGestureEnd(e) {
           e.stopPropagation();
           var slider = e.target._slider;
           if (!slider) {
             return;
           }
           if (slider.animatingTo === slider.currentSlide && !scrolling && !(dx === null)) {
             var updateDx = dx,
               target = (updateDx > 0) ? slider.getTarget('next') : slider.getTarget('prev');

             if (slider.canAdvance(target) && (Number(new Date()) - startT < 550 && Math.abs(updateDx) > 50 || Math.abs(updateDx) > cwidth / 2)) {
               slider.flexAnimate(target, slider.vars.pauseOnAction);
             } else {
               if (!fade) {slider.flexAnimate(slider.currentSlide, slider.vars.pauseOnAction, true);}
             }
           }

           startX = null;
           startY = null;
           dx = null;
           offset = null;
           accDx = 0;
         }
       }
     },
     uniqueID: function($clone) {
       // Append _clone to current level and children elements with id attributes
       $clone.filter('[id]').add($clone.find('[id]')).each(function() {
         var $this = $(this);
         $this.attr('id', $this.attr('id') + '_clone');
       });
       return $clone;
     },
     pauseInvisible: {
       visProp: null,
       init: function() {
         var visProp = methods.pauseInvisible.getHiddenProp();
         if (visProp) {
           var evtname = visProp.replace(/[H|h]idden/,'') + 'visibilitychange';
           document.addEventListener(evtname, function() {
             if (methods.pauseInvisible.isHidden()) {
               if(slider.startTimeout) {
                 clearTimeout(slider.startTimeout); //If clock is ticking, stop timer and prevent from starting while invisible
               } else {
                 slider.pause(); //Or just pause
               }
             }
             else {
               if(slider.started) {
                 slider.play(); //Initiated before, just play
               } else {
                 if (slider.vars.initDelay > 0) {
                   setTimeout(slider.play, slider.vars.initDelay);
                 } else {
                   slider.play(); //Didn't init before: simply init or wait for it
                 }
               }
             }
           });
         }
       },
       isHidden: function() {
         var prop = methods.pauseInvisible.getHiddenProp();
         if (!prop) {
           return false;
         }
         return document[prop];
       },
       getHiddenProp: function() {
         var prefixes = ['webkit','moz','ms','o'];
         // if 'hidden' is natively supported just return it
         if ('hidden' in document) {
           return 'hidden';
         }
         // otherwise loop over all the known prefixes until we find one
         for (var i = 0; i < prefixes.length; i++ ) {
           if ((prefixes[i] + 'Hidden') in document) {
             return prefixes[i] + 'Hidden';
           }
         }
         // otherwise it's not supported
         return null;
       }
     },
     setToClearWatchedEvent: function() {
       clearTimeout(watchedEventClearTimer);
       watchedEventClearTimer = setTimeout(function() {
         watchedEvent = "";
       }, 3000);
     }
   };

   // public methods
   slider.flexAnimate = function(target, pause, override, withSync, fromNav) {
     if (!slider.vars.animationLoop && target !== slider.currentSlide) {
       slider.direction = (target > slider.currentSlide) ? "next" : "prev";
     }

     if (slider.pagingCount === 1) slider.direction = (slider.currentItem < target) ? "next" : "prev";

     if (!slider.animating && (slider.canAdvance(target, fromNav) || override) && slider.is(":visible")) {
       if (withSync) {
         var master = $(slider.vars.asNavFor).data('flexslider');
         slider.atEnd = target === 0 || target === slider.count - 1;
         master.flexAnimate(target, true, false, true, fromNav);
         slider.direction = (slider.currentItem < target) ? "next" : "prev";
         master.direction = slider.direction;

         if (Math.ceil((target + 1) / slider.visible) - 1 !== slider.currentSlide && target !== 0) {
           slider.currentItem = target;
           slider.slides.removeClass(namespace + "active-slide").eq(target).addClass(namespace + "active-slide");
           target = Math.floor(target / slider.visible);
         } else {
           slider.currentItem = target;
           slider.slides.removeClass(namespace + "active-slide").eq(target).addClass(namespace + "active-slide");
           return false;
         }
       }

       slider.animating = true;
       slider.animatingTo = target;

       // SLIDESHOW:
       if (pause) {slider.pause();}

       // CONTROLNAV
       if (slider.vars.controlNav) {methods.controlNav.active();}

       // !CAROUSEL:
       // CANDIDATE: slide active class (for add/remove slide)
       if (!carousel) {slider.slides.removeClass(namespace + 'active-slide').eq(target).addClass(namespace + 'active-slide');}

       // INFINITE LOOP:
       // CANDIDATE: atEnd
       slider.atEnd = target === 0 || target === slider.last;

       // DIRECTIONNAV:
       if (slider.vars.directionNav) {methods.directionNav.update();}

       if (target === slider.last) {
         // API: end() of cycle Callback
         slider.vars.end(slider);
         // SLIDESHOW && !INFINITE LOOP:
         if (!slider.vars.animationLoop) {slider.pause();}
       }

       // SLIDE:
       if (!fade) {
         var dimension = (vertical) ? slider.slides.filter(':first').height() : slider.computedW,
           margin, slideString, calcNext;

         // INFINITE LOOP / REVERSE:
         if (carousel) {
           //margin = (slider.vars.itemWidth > slider.w) ? slider.vars.itemMargin * 2 : slider.vars.itemMargin;
           margin = slider.vars.itemMargin;
           calcNext = ((slider.itemW + margin) * slider.move) * slider.animatingTo;
           slideString = (calcNext > slider.limit && slider.visible !== 1) ? slider.limit : calcNext;
         } else if (slider.currentSlide === 0 && target === slider.count - 1 && slider.vars.animationLoop && slider.direction !== "next") {
           slideString =  0;
         } else if (slider.currentSlide === slider.last && target === 0 && slider.vars.animationLoop && slider.direction !== "prev") {
           slideString =  (slider.count + 1) * dimension;
         } else {
           slideString =  (target + slider.cloneOffset) * dimension;
         }
         slider.setProps(slideString, "", slider.vars.animationSpeed);
         if (slider.transitions) {
           if (!slider.vars.animationLoop || !slider.atEnd) {
             slider.animating = false;
             slider.currentSlide = slider.animatingTo;
           }

           // Unbind previous transitionEnd events and re-bind new transitionEnd event
           slider.container.unbind("webkitTransitionEnd transitionend");
           slider.container.bind("webkitTransitionEnd transitionend", function() {
             clearTimeout(slider.ensureAnimationEnd);
             slider.wrapup(dimension);
           });

           // Insurance for the ever-so-fickle transitionEnd event
           clearTimeout(slider.ensureAnimationEnd);
           slider.ensureAnimationEnd = setTimeout(function() {
             slider.wrapup(dimension);
           }, slider.vars.animationSpeed + 100);

         } else {
           slider.container.animate(slider.args, slider.vars.animationSpeed, slider.vars.easing, function(){
             slider.wrapup(dimension);
           });
         }
       } else { // FADE:
         if (!touch) {
           slider.slides.eq(slider.currentSlide).css({"zIndex": 1}).animate({"opacity": 0}, slider.vars.animationSpeed, slider.vars.easing);
           slider.slides.eq(target).css({"zIndex": 2}).animate({"opacity": 1}, slider.vars.animationSpeed, slider.vars.easing, slider.wrapup);

         } else {
           slider.slides.eq(slider.currentSlide).css({
             "opacity": 0,
             "zIndex": 1
           });
           slider.slides.eq(target).css({"opacity": 1, "zIndex": 2});
           slider.wrapup(dimension);
         }
       }
       // SMOOTH HEIGHT:
       if (slider.vars.smoothHeight) {methods.smoothHeight(slider.vars.animationSpeed)};
     }
   };
   slider.wrapup = function(dimension) {
     // SLIDE:
     if (!fade && !carousel) {
       if (slider.currentSlide === 0 && slider.animatingTo === slider.last && slider.vars.animationLoop) {
         slider.setProps(dimension, "jumpEnd");
       } else if (slider.currentSlide === slider.last && slider.animatingTo === 0 && slider.vars.animationLoop) {
         slider.setProps(dimension, "jumpStart");
       }
     }
     slider.animating = false;
     slider.currentSlide = slider.animatingTo;
   };

   // SLIDESHOW:
   slider.animateSlides = function() {
     if (!slider.animating && focused) {slider.flexAnimate(slider.getTarget("next"));}
   };
   // SLIDESHOW:
   slider.pause = function() {
     clearInterval(slider.animatedSlides);
     slider.animatedSlides = null;
     slider.playing = false;
     // PAUSEPLAY:
     if (slider.vars.pausePlay) {methods.pausePlay.update("play");}
     // SYNC:
     if (slider.syncExists) {methods.sync("pause");}
   };
   // SLIDESHOW:
   slider.play = function() {
     if (slider.playing) {clearInterval(slider.animatedSlides);}
     slider.animatedSlides = slider.animatedSlides || setInterval(slider.animateSlides, slider.vars.slideshowSpeed);
     slider.started = slider.playing = true;
     // PAUSEPLAY:
     if (slider.vars.pausePlay) {methods.pausePlay.update("pause");}
     // SYNC:
     if (slider.syncExists) {methods.sync("play");}
   };
   // STOP:
   slider.stop = function() {
     slider.pause();
     slider.stopped = true;
   };
   slider.canAdvance = function(target, fromNav) {

     var last =  slider.last;
     return (fromNav) ? true :
       (slider.currentItem === slider.count - 1 && target === 0 && slider.direction === "prev") ? true :
         (slider.currentItem === 0 && target === slider.pagingCount - 1 && slider.direction !== "next") ? false :
             (slider.vars.animationLoop) ? true :
               (slider.atEnd && slider.currentSlide === 0 && target === last && slider.direction !== "next") ? false :
                 (slider.atEnd && slider.currentSlide === last && target === 0 && slider.direction === "next") ? false :
                   true;
   };
   slider.getTarget = function(dir) {
     slider.direction = dir;
     if (dir === "next") {
       return (slider.currentSlide === slider.last) ? 0 : slider.currentSlide + 1;
     } else {
       return (slider.currentSlide === 0) ? slider.last : slider.currentSlide - 1;
     }
   };

   // SLIDE:
   slider.setProps = function(pos, special, dur) {
     var target = (function() {
       var posCheck = (pos) ? pos : ((slider.itemW + slider.vars.itemMargin) * slider.move) * slider.animatingTo,
         posCalc = (function() {
           if (carousel) {
             return (special === "setTouch") ? pos : (slider.animatingTo === slider.last) ? slider.limit : posCheck;
           } else {
             switch (special) {
               case "setTotal":
                 return  (slider.currentSlide + slider.cloneOffset) * pos;
               case "setTouch":
                 return  pos;
               case "jumpEnd":
                 return  slider.count * pos;
               case "jumpStart":
                 return  pos;
               default:
                 return pos;
             }
           }
         }());

       return (posCalc * -1) + "px";
     }());

     if (slider.transitions) {
       target = (vertical) ? "translate3d(0," + target + ",0)" : "translate3d(" + target + ",0,0)";
       dur = (dur !== undefined) ? (dur / 1000) + "s" : "0s";
       slider.container.css("-" + slider.pfx + "-transition-duration", dur);
       slider.container.css("transition-duration", dur);
     }

     slider.args[slider.prop] = target;
     if (slider.transitions || dur === undefined) {slider.container.css(slider.args);}

     slider.container.css('transform', target);
   };

   slider.setup = function(type) {
     // SLIDE:
     if (!fade) {
       var sliderOffset, arr;

       if (type === "init") {
         slider.viewport = $('<div class="' + namespace + 'viewport"></div>').css({
           "overflow": "hidden",
           "position": "relative"
         }).appendTo(slider).append(slider.container);
         // INFINITE LOOP:
         slider.cloneCount = 0;
         slider.cloneOffset = 0;
       }
       // INFINITE LOOP && !CAROUSEL:
       if (slider.vars.animationLoop && !carousel) {
         slider.cloneCount = 2;
         slider.cloneOffset = 1;
         // clear out old clones
         if (type !== "init") { slider.container.find('.clone').remove(); }
         slider.container.append(methods.uniqueID(slider.slides.first().clone().addClass('clone')).attr('aria-hidden', 'true'))
           .prepend(methods.uniqueID(slider.slides.last().clone().addClass('clone')).attr('aria-hidden', 'true'));
       }
       slider.newSlides = $(slider.vars.selector, slider);

       sliderOffset = slider.currentSlide + slider.cloneOffset;
       // VERTICAL:
       if (vertical && !carousel) {
         slider.container.height((slider.count + slider.cloneCount) * 200 + "%").css("position", "absolute").width("100%");
         setTimeout(function() {
           slider.newSlides.css({"display": "block"});
           slider.doMath();
           slider.viewport.height(slider.h);
           slider.setProps(sliderOffset * slider.h, "init");
         }, (type === "init") ? 100 : 0);
       } else {
         slider.container.width((slider.count + slider.cloneCount) * 200 + "%");
         slider.setProps(sliderOffset * slider.computedW, "init");
         setTimeout(function() {
           slider.doMath();
           slider.newSlides.css({
             "width": slider.computedW,
             "float": "left",
             "display": "block"
           });
         }, (type === "init") ? 100 : 0);
       }
     } else { // FADE:
       slider.slides.css({
         "width": "100%",
         "float": "left",
         "marginRight": "-100%",
         "position": "relative"
       });
       if (type === "init") {
         if (!touch) { 
            slider.slides.css({ "opacity": 0, "display": "block", "zIndex": 1 }).eq(slider.currentSlide).css({"zIndex": 2}).animate({"opacity": 1},slider.vars.animationSpeed,slider.vars.easing);
         } else {
           slider.slides.css({ "opacity": 0, "display": "block", "webkitTransition": "opacity " + slider.vars.animationSpeed / 1000 + "s ease", "zIndex": 1 }).eq(slider.currentSlide).css({ "opacity": 1, "zIndex": 2});
         }
       }
     }
     // !CAROUSEL:
     // CANDIDATE: active slide
     if (!carousel) {slider.slides.removeClass(namespace + "active-slide").eq(slider.currentSlide).addClass(namespace + "active-slide");}

     //FlexSlider: init() Callback
     slider.vars.init(slider);
   };

   slider.doMath = function() {
     var slide = slider.slides.first(),
       slideMargin = slider.vars.itemMargin,
       minItems = slider.vars.minItems,
       maxItems = slider.vars.maxItems;

     slider.w = (slider.viewport === undefined) ? slider.width() : slider.viewport.width();
     slider.h = slide.height();
     slider.boxPadding = slide.outerWidth() - slide.width();

     // CAROUSEL:
     if (carousel) {
       slider.itemT = slider.vars.itemWidth + slideMargin;
       slider.minW = (minItems) ? minItems * slider.itemT : slider.w;
       slider.maxW = (maxItems) ? (maxItems * slider.itemT) - slideMargin : slider.w;
       slider.itemW = (slider.minW > slider.w) ? (slider.w - (slideMargin * (minItems - 1))) / minItems :
         (slider.maxW < slider.w) ? (slider.w - (slideMargin * (maxItems - 1))) / maxItems :
           (slider.vars.itemWidth > slider.w) ? slider.w : slider.vars.itemWidth;

       slider.visible = Math.floor(slider.w / (slider.itemW));
       slider.move = (slider.vars.move > 0 && slider.vars.move < slider.visible ) ? slider.vars.move : slider.visible;
       slider.pagingCount = Math.ceil(((slider.count - slider.visible) / slider.move) + 1);
       slider.last = slider.pagingCount - 1;
       slider.limit = (slider.pagingCount === 1) ? 0 :
         (slider.vars.itemWidth > slider.w) ? (slider.itemW * (slider.count - 1)) + (slideMargin * (slider.count - 1)) : ((slider.itemW + slideMargin) * slider.count) - slider.w - slideMargin;
     } else {
       slider.itemW = slider.w;
       slider.pagingCount = slider.count;
       slider.last = slider.count - 1;
     }
     slider.computedW = slider.itemW - slider.boxPadding;
   };

   slider.update = function(pos, action) {
     slider.doMath();

     // update currentSlide and slider.animatingTo if necessary
     if (!carousel) {
       if (pos < slider.currentSlide) {
         slider.currentSlide += 1;
       } else if (pos <= slider.currentSlide && pos !== 0) {
         slider.currentSlide -= 1;
       }
       slider.animatingTo = slider.currentSlide;
     }

     // update controlNav
     if (slider.vars.controlNav && !slider.manualControls) {
       if ((action === "add" && !carousel) || slider.pagingCount > slider.controlNav.length) {
         methods.controlNav.update("add");
       } else if ((action === "remove" && !carousel) || slider.pagingCount < slider.controlNav.length) {
         if (carousel && slider.currentSlide > slider.last) {
           slider.currentSlide -= 1;
           slider.animatingTo -= 1;
         }
         methods.controlNav.update("remove", slider.last);
       }
     }
     // update directionNav
     if (slider.vars.directionNav) {methods.directionNav.update();}

   };

   slider.addSlide = function(obj, pos) {
     var $obj = $(obj);

     slider.count += 1;
     slider.last = slider.count - 1;

     // append new slide
     (pos !== undefined) ? slider.slides.eq(pos).before($obj) : slider.container.append($obj);

     // update currentSlide, animatingTo, controlNav, and directionNav
     slider.update(pos, "add");

     // update slider.slides
     slider.slides = $(slider.vars.selector + ':not(.clone)', slider);
     // re-setup the slider to accomdate new slide
     slider.setup();

     //FlexSlider: added() Callback
     slider.vars.added(slider);
   };
   slider.removeSlide = function(obj) {
     var pos = (isNaN(obj)) ? slider.slides.index($(obj)) : obj;

     // update count
     slider.count -= 1;
     slider.last = slider.count - 1;

     // remove slide
     if (isNaN(obj)) {
       $(obj, slider.slides).remove();
     } else {
        slider.slides.eq(obj).remove();
     }

     // update currentSlide, animatingTo, controlNav, and directionNav
     slider.doMath();
     slider.update(pos, "remove");

     // update slider.slides
     slider.slides = $(slider.vars.selector + ':not(.clone)', slider);
     // re-setup the slider to accomdate new slide
     slider.setup();

     // FlexSlider: removed() Callback
     slider.vars.removed(slider);
   };

   // Ensure the slider isn't focussed if the window loses focus.
   $(window).blur(function(e) {
     focused = false;
   }).focus(function(e) {
     focused = true;
   });

   //FlexSlider: Initialize
   methods.init();
 };


 // FlexSlider: Default Settings
 $.flexslider.defaults = {
   selector: '.fn-slides > li',       // {NEW} Selector: Must match a simple pattern. '{container} > {slide}' -- Ignore pattern at your own peril
   pauseInvisible: true,   		// {NEW} Boolean: Pause the slideshow when tab is invisible, resume when visible. Provides better UX, lower CPU usage.
   
   animation: 'slide',              // String: Select your animation type, 'fade' or 'slide'
   easing: 'swing',                // {NEW} String: Determines the easing method used in jQuery transitions. jQuery easing plugin is supported!
   direction: 'horizontal',        // String: Select the sliding direction, "horizontal" or "vertical"
   animationLoop: true,            // Boolean: Should the animation loop? If false, directionNav will received "disable" classes at either end
   startAt: 0,                     // Integer: The slide that the slider should start on. Array notation (0 = first slide)
   slideshow: true,                // Boolean: Animate slider automatically
   slideshowSpeed: 5000,           // Integer: Set the speed of the slideshow cycling, in milliseconds
   animationSpeed: 600,            // Integer: Set the speed of animations, in milliseconds
   initDelay: 0,                   // {NEW} Integer: Set an initialization delay, in milliseconds

   // Usability features
   pauseOnAction: true,            // Boolean: Pause the slideshow when interacting with control elements, highly recommended.
   pauseOnHover: false,            // Boolean: Pause the slideshow when hovering over slider, then resume when no longer hovering
   useCSS: true,                   // {NEW} Boolean: Slider will use CSS3 transitions if available
   touch: true,                    // {NEW} Boolean: Allow touch swipe navigation of the slider on touch-enabled devices
   video: false,                   // {NEW} Boolean: If using video in the slider, will prevent CSS3 3D Transforms to avoid graphical glitches

   // Primary Controls
   controlNav: true,               // Boolean: Create navigation for paging control of each slide? Note: Leave true for manualControls usage
   directionNav: true,             // Boolean: Create navigation for previous/next navigation? (true/false)
   prevText: 'prev',           		// String: Set the text for the "previous" directionNav item
   nextText: 'next',               // String: Set the text for the "next" directionNav item

   // Carousel Options
   itemWidth: 0,                   // {NEW} Integer: Box-model width of individual carousel items, including horizontal borders and padding.
   itemMargin: 0,                  // {NEW} Integer: Margin between carousel items.
   minItems: 1,                    // {NEW} Integer: Minimum number of carousel items that should be visible. Items will resize fluidly when below this.
   maxItems: 0,                    // {NEW} Integer: Maxmimum number of carousel items that should be visible. Items will resize fluidly when above this limit.

   // Callback API
   start: function() {
   },            // Callback: function(slider) - Fires when the slider loads the first slide
   before: function() {
   },           // Callback: function(slider) - Fires asynchronously with each slider animation
   after: function() {
   },            // Callback: function(slider) - Fires after each slider animation completes
   end: function() {
   },              // Callback: function(slider) - Fires when the slider reaches the last slide (asynchronous)
   added: function() {
   },            // {NEW} Callback: function(slider) - Fires after a slide is added
   removed: function() {
   },           // {NEW} Callback: function(slider) - Fires after a slide is removed
   init: function() {
   }             // {NEW} Callback: function(slider) - Fires after the slider is initially setup
 };

 // FlexSlider: Plugin Function
 $.fn.flexslider = function(options) {
   var args = Array.prototype.slice.call(arguments, 1);
   if (options === undefined) {options = {};}

   if (typeof options === 'object') {
     return this.each(function() {
       var $this = $(this);
       var selector = (options.selector) ? options.selector : '.fn-slides > li';
       var $slides = $this.find(selector);

       if ($slides.length === 1 || $slides.length === 0) {
         $slides.fadeIn(400);
         if (options.start) {options.start($this);}
       } else if ($this.data('flexslider') === undefined) {
         new $.flexslider(this, options);
       }
     });
   } else {
     // Helper strings to quickly pecdrform functions on the slider
     var $slider = $(this).data('flexslider');
     var methodReturn;
     switch (options) {
       case 'next':
         $slider.flexAnimate($slider.getTarget('next'), true);
         break;
       case 'prev':
       case 'previous':
         $slider.flexAnimate($slider.getTarget('prev'), true);
         break;
       default:
         if (typeof options === 'number') {
           $slider.flexAnimate(options, true);
         } else if (typeof options === 'string') {
           methodReturn = (typeof $slider[options] === 'function') ?
             $slider[options].apply($slider, args) : $slider[options];
         }
     }

     return methodReturn === undefined ? this : methodReturn;
   }
 };

 // Init code
 UI.ready(function(context) {
   $('[data-fn-flexslider]', context).each(function(i, item) {
     var $slider = $(item);
     var options = UI.utils.parseOptions($slider.data('fnFlexslider'));
     $slider.flexslider(options);
   });
 });
 	return $.flexslider;
})