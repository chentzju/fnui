/*=============
  FNUI 2.0 UCHECK
================*/

 define(['jquery','./fnuicore'],function($,UI){
  
  'use strict';

var UCheck = function(element, options) {
  this.options = $.extend({}, UCheck.DEFAULTS, options);
  // this.options = $.extend({}, UCheck.DEFAULTS, this.$element.data(), options);
  this.$element = $(element);
  this.init();
};

UCheck.DEFAULTS = {
  checkboxClass: 'fn-ucheck-checkbox',
  radioClass: 'fn-ucheck-radio',
  checkboxTpl: '<span class="fn-ucheck-icons">' +
  '<i class="fn-icon-unchecked"></i><i class="fn-icon-checked"></i></span>',
  radioTpl: '<span class="fn-ucheck-icons">' +
  '<i class="fn-icon-unchecked"></i><i class="fn-icon-checked"></i></span>'
};

UCheck.prototype.init = function() {
  var $element = this.$element;
  var element = $element[0];
  var options = this.options;

  if (element.type === 'checkbox') {
    $element.addClass(options.checkboxClass)
      .after(options.checkboxTpl);
  } else if (element.type === 'radio') {
    $element.addClass(options.radioClass)
      .after(options.radioTpl);
  }
};

UCheck.prototype.check = function() {
  this.$element
    .prop('checked', true)
    .trigger('change.ucheck')
    .trigger('checked.ucheck');
},

UCheck.prototype.uncheck = function() {
  this.$element
    .prop('checked', false)
    .trigger('change.ucheck')
    .trigger('unchecked.ucheck');
},

UCheck.prototype.toggle = function() {
  this.$element.
    prop('checked', function(i, value) {
      return !value;
    })
    .trigger('change.ucheck')
    .trigger('toggled.ucheck');
},

UCheck.prototype.disable = function() {
  this.$element
    .prop('disabled', true)
    .trigger('change.ucheck')
    .trigger('disabled.ucheck');
},

UCheck.prototype.enable = function() {
  this.$element.prop('disabled', false);
  this.$element.trigger('change.ucheck').trigger('enabled.ucheck');
},

UCheck.prototype.destroy = function() {
  this.$element
    .removeData('fnui.ucheck')
    .removeClass(this.options.checkboxClass + ' ' + this.options.radioClass)
    .next('.fn-ucheck-icons')
    .remove()
  .end()
    .trigger('destroyed.ucheck');
};

UI.plugin('uCheck', UCheck, {
  after: function() {
    // Adding 'fn-nohover' class for touch devices
    if (UI.support.touch) {
      this.parent().hover(function() {
        this.addClass('fn-nohover');
      }, function() {
        this.removeClass('fn-nohover');
      });
    }
  }
});

UI.ready(function(context) {
  $('[data-fn-ucheck]', context).uCheck();
});

  return UCheck;

});
