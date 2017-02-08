/*=============
  FNUI 2.0 MODAL
================*/

define(['jquery','./fnuicore','./dimmer'],function($,UI){

  'use strict';

var Modal = function(element, options) {
  this.options = $.extend({}, Modal.DEFAULTS, options || {});
  this.$element = $(element);
  this.$dialog =   this.$element.find('.fn-modal-dialog');

  if (!this.$element.attr('id')) {
    this.$element.attr('id', UI.utils.generateGUID('fn-modal'));
  }

  this.isPopup = this.$element.hasClass('fn-popup');
  this.isActions = this.$element.hasClass('fn-modal-actions');
  this.isPrompt = this.$element.hasClass('fn-modal-prompt');
  this.isLoading = this.$element.hasClass('fn-modal-loading');
  this.active = this.transitioning = this.relatedTarget = null;
  this.dimmer = this.options.dimmer ? UI.dimmer : {
    open: function() {},
    close: function() {}
  };

  this.events();
};

Modal.DEFAULTS = {
  className: {
    active: 'fn-modal-active',
    out: 'fn-modal-out'
  },
  selector: {
    modal: '.fn-modal',
    active: '.fn-modal-active'
  },
  closeViaDimmer: true,
  cancelable: true,
  onConfirm: function() {
  },
  onCancel: function() {
  },
  closeOnCancel: true,
  closeOnConfirm: true,
  dimmer: true,
  height: undefined,
  width: undefined,
  duration: 300, // must equal the CSS transition duration
  transitionEnd: UI.support.transition && UI.support.transition.end + '.modal'
};

Modal.prototype.toggle = function(relatedTarget) {
  return this.active ? this.close() : this.open(relatedTarget);
};

Modal.prototype.open = function(relatedTarget) {
  var $element = this.$element;
  var options = this.options;
  var isPopup = this.isPopup;
  var width = options.width;
  var height = options.height;
  var style = {};

  if (this.active) {
    return;
  }

  if (!this.$element.length) {
    return;
  }

  // callback hook
  relatedTarget && (this.relatedTarget = relatedTarget);

  // 判断如果还在动画，就先触发之前的closed事件
  if (this.transitioning) {
    clearTimeout($element.transitionEndTimmer);
    $element.transitionEndTimmer = null;
    $element.trigger(options.transitionEnd).off(options.transitionEnd);
  }

  isPopup && this.$element.show();

  this.active = true;

  $element.trigger($.Event('open.modal', {relatedTarget: relatedTarget}));

  this.dimmer.open($element);

  $element.show();

  // apply Modal width/height if set
  if (!isPopup && !this.isActions) {
    if (width) {
      width = parseInt(width, 10);
      style.width =  width + 'px';
      style.marginLeft =  -parseInt(width / 2) + 'px';
    }

    if (height) {
      height = parseInt(height, 10);
      // style.height = height + 'px';
      style.marginTop = -parseInt(height / 2) + 'px';

      // the background color is styled to $dialog
      // so the height should set to $dialog
      this.$dialog.css({height: height + 'px'});
    } else {
      style.marginTop = -parseInt($element.height() / 2, 10) + 'px';
    }

    $element.css(style);
  }

  $element.
    removeClass(options.className.out).
    addClass(options.className.active);

  this.transitioning = 1;

  var complete = function() {
    $element.trigger($.Event('opened.modal',
      {relatedTarget: relatedTarget}));
    this.transitioning = 0;

    // Prompt auto focus
    if (this.isPrompt) {
      this.$dialog.find('input').eq(0).focus();
    }
  };

  if (!UI.support.transition) {
    return complete.call(this);
  }

  $element.
    one(options.transitionEnd, $.proxy(complete, this)).
    emulateTransitionEnd(options.duration);
};

Modal.prototype.close = function(relatedTarget) {
  if (!this.active) {
    return;
  }

  var $element = this.$element;
  var options = this.options;
  var isPopup = this.isPopup;

  // 判断如果还在动画，就先触发之前的opened事件
  if (this.transitioning) {
    clearTimeout($element.transitionEndTimmer);
    $element.transitionEndTimmer = null;
    $element.trigger(options.transitionEnd).off(options.transitionEnd);
    this.dimmer.close($element, true);
  }

  this.$element.trigger($.Event('close.modal',
    {relatedTarget: relatedTarget}));

  this.transitioning = 1;

  var complete = function() {
    $element.trigger('closed.modal');
    isPopup && $element.removeClass(options.className.out);
    $element.hide();
    this.transitioning = 0;
    // 不强制关闭 Dimmer，以便多个 Modal 可以共享 Dimmer
    this.dimmer.close($element, false);
    this.active = false;
  };

  $element.removeClass(options.className.active).
    addClass(options.className.out);

  if (!UI.support.transition) {
    return complete.call(this);
  }

  $element.one(options.transitionEnd, $.proxy(complete, this)).
    emulateTransitionEnd(options.duration);
};

Modal.prototype.events = function() {
  var options = this.options;
  var _this = this;
  var $element = this.$element;
  var $ipt = $element.find('.fn-modal-prompt-input');
  var $confirm = $element.find('[data-fn-modal-confirm]');
  var $cancel = $element.find('[data-fn-modal-cancel]');
  var getData = function() {
    var data = [];
    $ipt.each(function() {
      data.push($(this).val());
    });

    return (data.length === 0) ? undefined :
      ((data.length === 1) ? data[0] : data);
  };

  // close via Esc key
  if (this.options.cancelable) {
    $element.on('keyup.modal', function(e) {
        if (_this.active && e.which === 27) {
          $element.trigger('cancel.modal');
          _this.close();
        }
      });
  }

  // Close Modal when dimmer clicked
  if (this.options.dimmer && this.options.closeViaDimmer && !this.isLoading) {
    this.dimmer.$element.on('click.dimmer.modal', function(e) {
      _this.close();
    });
  }

  // Close Modal when button clicked
  $element.on('click.close.modal', '[data-fn-modal-close], .fn-modal-btn', function(e) {
      e.preventDefault();
      var $this = $(this);

      if ($this.is($confirm)) {
        options.closeOnConfirm && _this.close();
      } else if ($this.is($cancel)) {
        options.closeOnCancel && _this.close();
      } else {
        _this.close();
      }
    });

  $confirm.on('click.confirm.modal',
    function() {
      $element.trigger($.Event('confirm.modal', {
        trigger: this
      }));
    });

  $cancel.on('click.cancel.modal', function() {
      $element.trigger($.Event('cancel.modal', {
        trigger: this
      }));
    });

  $element.on('confirm.modal', function(e) {
    e.data = getData();
    _this.options.onConfirm.call(_this, e);
  }).on('cancel.modal', function(e) {
    e.data = getData();
    _this.options.onCancel.call(_this, e);
  });
};

function Plugin(option, relatedTarget) {
  return this.each(function() {
    var $this = $(this);
    var data = $this.data('fnui.modal');
    var options = typeof option == 'object' && option;

    if (!data) {
      $this.data('fnui.modal', (data = new Modal(this, options)));
    }

    if (typeof option == 'string') {
      data[option] && data[option](relatedTarget);
    } else {
      data.toggle(option && option.relatedTarget || undefined);
    }
  });
}

$.fn.modal = Plugin;

// Init
$(document).on('click.modal.data-api', '[data-fn-modal]', function() {
  var $this = $(this);
  var options = UI.utils.parseOptions($this.attr('data-fn-modal'));
  var $target = $(options.target ||
  (this.href && this.href.replace(/.*(?=#[^\s]+$)/, '')));
  var option = $target.data('fnui.modal') ? 'toggle' : options;

  Plugin.call($target, option, this);
});

  return Modal;

});
