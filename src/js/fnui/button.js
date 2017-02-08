
/*=============
  FNUI 2.0 BUTTON
================*/

define(['jquery','./fnuicore'],function($,UI){

    'use strict';

    var Button = function(element, options) {
      this.$element = $(element);
      this.options = $.extend({}, Button.DEFAULTS, options);
      this.isLoading = false;
      this.hasSpinner = false;
    };

    Button.VERSION = "2.0.0";

    Button.DEFAULTS = {
      loadingText: 'loading...',
      disabledClassName: 'fn-disabled',
      spinner: undefined
    };

    Button.prototype.setState = function(state, stateText) {
      var $element = this.$element;
      var disabled = 'disabled';
      var data = $element.data();
      var options = this.options;
      var val = $element.is('input') ? 'val' : 'html';
      var stateClassName = 'fn-btn-' + state + ' ' + options.disabledClassName;

      state += 'Text';

      if (!options.resetText) {
        options.resetText = $element[val]();
      }

      // add spinner for element with html()
      if (UI.support.animation && options.spinner &&
        val === 'html' && !this.hasSpinner) {
        options.loadingText = '<span class="fn-icon-' + options.spinner +
          ' fn-icon-spin"></span>' + options.loadingText;

        this.hasSpinner = true;
      }

      stateText = stateText ||
        (data[state] === undefined ? options[state] : data[state]);

      $element[val](stateText);

      // push to event loop to allow forms to submit
      setTimeout($.proxy(function() {
        // TODO: add stateClass for other states
        if (state === 'loadingText') {
          $element.addClass(stateClassName).attr(disabled, disabled);
          this.isLoading = true;
        } else if (this.isLoading) {
          $element.removeClass(stateClassName).removeAttr(disabled);
          this.isLoading = false;
        }
      }, this), 0);
    };

    Button.prototype.toggle = function() {
      var changed = true;
      var $element = this.$element;
      var $parent = this.$element.parent('[class*="fn-btn-group"]');

      if ($parent.length) {
        var $input = this.$element.find('input');

        if ($input.prop('type') == 'radio') {
          if ($input.prop('checked') && $element.hasClass('fn-active')) {
            changed = false;
          } else {
            $parent.find('.fn-active').removeClass('fn-active');
          }
        }

        if (changed) {
          $input.prop('checked',
            !$element.hasClass('fn-active')).trigger('change');
        }
      }

      if (changed) {
        $element.toggleClass('fn-active');
        if (!$element.hasClass('fn-active')) {
          $element.blur();
        }
      }
    };

    UI.plugin('button', Button, {
      dataOptions: 'data-fn-loading',
      methodCall: function(args, instance) {
        if (args[0] === 'toggle') {
          instance.toggle();
        } else if (typeof args[0] === 'string') {
          instance.setState.apply(instance, args);
        }
      }
    });

    // Init code
    $(document).on('click.button.data-api', '[data-fn-button]', function(e) {
      e.preventDefault();
      var $btn = $(e.target);

      if (!$btn.hasClass('fn-btn')) {
        $btn = $btn.closest('.fn-btn');
      }

      $btn.button('toggle');
    });

    UI.ready(function(context) {
      $('[data-fn-loading]', context).button();
    });

    return Button;
});