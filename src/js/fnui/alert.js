
/*=============
 ALERT JS component
================*/
define(['jquery','./fnuicore'],function($,UI){
	
    'use strict';

    // Alert Class
    var Alert = function(element) {
      var _this = this;
      this.$element = $(element);
      this.$element
        .addClass('fn-fade fn-in')
        .on('click.alert', '.fn-close', function() {
          _this.close();
        });
    };

    Alert.VERSION = "2.0.0";

    Alert.prototype.close = function() {
      var $element = this.$element;

      $element.trigger('close.alert').removeClass('fn-in');

      function processAlert() {
        $element.trigger('closed.alert').remove();
      }

      UI.support.transition && $element.hasClass('fn-fade') ?
        $element
          .one('fnTransitionEnd', processAlert)
          .emulateTransitionEnd(200) : processAlert();
    };

    // plugin
    UI.plugin('alert', Alert);

    // Init code
    $(document).on('click.alert.data-api', '[data-fn-alert]', function(e) {
      var $target = $(e.target);
      $target.is('.fn-close') && $(this).alert('close');
    });

      return Alert;
  });