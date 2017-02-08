
/*=============
  FNUI 2.0 COLLAPSE
================*/

define(['jquery','./fnuicore'],function($,UI){

    'use strict';

    var Collapse = function(element, options) {
        this.$element = $(element);
        this.options = $.extend({}, Collapse.DEFAULTS, options);
        this.transitioning = null;

        if (this.options.parent) {
          this.$parent = $(this.options.parent);
        }

        if (this.options.toggle) {
          this.toggle();
        }
    };


    Collapse.VERSION = "2.0.0";


    Collapse.DEFAULTS = {
      toggle: true
    };

    Collapse.prototype.open = function() {
      if (this.transitioning || this.$element.hasClass('fn-in')) {
        return;
      }

      var startEvent = $.Event('open.collapse.fnui');
      this.$element.trigger(startEvent);

      if (startEvent.isDefaultPrevented()) {
        return;
      }

      var actives = this.$parent && this.$parent.find('> .fn-panel > .fn-in');

      if (actives && actives.length) {
        var hasData = actives.data('fnui.collapse');

        if (hasData && hasData.transitioning) {
          return;
        }

        Plugin.call(actives, 'close');

        hasData || actives.data('fnui.collapse', null);
      }

      this.$element
        .removeClass('fn-collapse')
        .addClass('fn-collapsing').height(0);

      this.transitioning = 1;

      var complete = function() {
        this.$element
          .removeClass('fn-collapsing')
          .addClass('fn-collapse fn-in')
          .height('')
          .trigger('opened.collapse.fnui');
        this.transitioning = 0;
      };

      if (!UI.support.transition) {
        return complete.call(this);
      }

      var scrollHeight = this.$element[0].scrollHeight;

      this.$element
        .one('fnTransitionEnd', $.proxy(complete, this))
        .emulateTransitionEnd(300)
        .css({height: scrollHeight}); // 当折叠的容器有 padding 时，如果用 height() 只能设置内容的宽度
    };

    Collapse.prototype.close = function() {
      if (this.transitioning || !this.$element.hasClass('fn-in')) {
        return;
      }

      var startEvent = $.Event('close.collapse.fnui');
      this.$element.trigger(startEvent);

      if (startEvent.isDefaultPrevented()) {
        return;
      }

      this.$element.height(this.$element.height());

      this.$element.addClass('fn-collapsing').
        removeClass('fn-collapse fn-in');

      this.transitioning = 1;

      var complete = function() {
        this.transitioning = 0;
        this.$element
          .trigger('closed.collapse.fnui')
          .removeClass('fn-collapsing')
          .addClass('fn-collapse');
        // css({height: '0'});
      };

      if (!UI.support.transition) {
        return complete.call(this);
      }

      this.$element.height(0)
        .one('fnTransitionEnd', $.proxy(complete, this))
        .emulateTransitionEnd(300);
    };

    Collapse.prototype.toggle = function() {
      this[this.$element.hasClass('fn-in') ? 'close' : 'open']();
    };

    // Collapse Plugin
    function Plugin(option) {
      return this.each(function() {
        var $this = $(this);
        var data = $this.data('fnui.collapse');
        var options = $.extend({}, Collapse.DEFAULTS,
          UI.utils.parseOptions($this.attr('data-fn-collapse')),
          typeof option == 'object' && option);

        if (!data && options.toggle && option === 'open') {
          option = !option;
        }

        if (!data) {
          $this.data('fnui.collapse', (data = new Collapse(this, options)));
        }

        if (typeof option == 'string') {
          data[option]();
        }
      });
    }

    $.fn.collapse = Plugin;

    // Init code
    $(document).on('click.collapse.fnui.data-api', '[data-fn-collapse]',
      function(e) {
        var href;
        var $this = $(this);
        var options = UI.utils.parseOptions($this.attr('data-fn-collapse'));
        var target = options.target ||
          e.preventDefault() ||
          (href = $this.attr('href')) &&
          href.replace(/.*(?=#[^\s]+$)/, '');
        var $target = $(target);
        var data = $target.data('fnui.collapse');
        var option = data ? 'toggle' : options;
        var parent = options.parent;
        var $parent = parent && $(parent);

        if (!data || !data.transitioning) {
          if ($parent) {
            // '[data-fn-collapse*="{parent: \'' + parent + '"]
            $parent.find('[data-fn-collapse]').not($this).addClass('fn-collapsed');
          }

          $this[$target.hasClass('fn-in') ?
            'addClass' : 'removeClass']('fn-collapsed');
        }

        Plugin.call($target, option);
      });

      return UI.collapse = Collapse;
});