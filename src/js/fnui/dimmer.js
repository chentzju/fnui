
/*=============
  FNUI 2.0 DIMMER
================*/

define(['jquery','./fnuicore'],function($,UI){

  'use strict';

  var Dimmer = function() {
      this.id = UI.utils.generateGUID('fn-dimmer');
      this.$element = $(Dimmer.DEFAULTS.tpl, {
        id: this.id
      });

      this.inited = false;
      this.scrollbarWidth = 0;
      this.$used = $([]);
    };

    Dimmer.VERSION = "2.0.0";

    Dimmer.DEFAULTS = {
      tpl: '<div class="fn-dimmer" data-fn-dimmer></div>'
    };

    Dimmer.prototype.init = function() {
      if (!this.inited) {
        $(document.body).append(this.$element);
        this.inited = true;
        $(document).trigger('init.dimmer');
        this.$element.on('touchmove.dimmer', function(e) {
          e.preventDefault();
        });
      }

      return this;
    };

    Dimmer.prototype.open = function(relatedElement) {
      if (!this.inited) {
        this.init();
      }

      var $element = this.$element;

      // 用于多重调用
      if (relatedElement) {
        this.$used = this.$used.add($(relatedElement));
      }

      this.checkScrollbar().setScrollbar();

      $element.show().trigger('open.dimmer');

      UI.support.transition && $element.off(UI.support.transition.end);

      setTimeout(function() {
        $element.addClass('fn-active');
      }, 0);

      return this;
    };

    Dimmer.prototype.close = function(relatedElement, force) {
      this.$used = this.$used.not($(relatedElement));

      if (!force && this.$used.length) {
        return this;
      }

      var $element = this.$element;

      $element.removeClass('fn-active').trigger('close.dimmer');

      function complete() {
        $element.hide();
        this.resetScrollbar();
      }
      complete.call(this);

      return this;
    };

    Dimmer.prototype.measureScrollbar = function() {
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

    Dimmer.prototype.checkScrollbar = function() {
      this.scrollbarWidth = this.measureScrollbar();

      return this;
    };

    Dimmer.prototype.setScrollbar = function() {
      var $body = $(document.body);
      var bodyPaddingRight = parseInt(($body.css('padding-right') || 0), 10);

      if (this.scrollbarWidth) {
        $body.css('padding-right', bodyPaddingRight + this.scrollbarWidth);
      }

      $body.addClass('fn-dimmer-active');

      return this;
    };

    Dimmer.prototype.resetScrollbar = function() {
      $(document.body).css('padding-right', '').removeClass('fn-dimmer-active');

      return this;
    };

    UI.dimmer = new Dimmer();
    return  $.dimmer = UI.dimmer;

});