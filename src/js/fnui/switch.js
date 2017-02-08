/*=============
  FNUI 2.0 SWITCH
================*/
 
define(['jquery','./fnuicore'],function($,UI){	  
	
	 "use strict"; 
	 
	  var Switch = function (element, options) { 
			 if (options == null) { 
			 options = {}; 
			 } 
			 this.$element = $(element); 
			 this.options = $.extend({}, Switch.DEFAULTS, { 
			 state: this.$element.is(":checked"), 
			 size: this.$element.data("size"), 
			 animate: this.$element.data("animate"), 
			 disabled: this.$element.is(":disabled"), 
			 readonly: this.$element.is("[readonly]"), 
			 indeterminate: this.$element.data("indeterminate"), 
			 inverse: this.$element.data("inverse"), 
			 radioAllOff: this.$element.data("radio-all-off"), 
			 onColor: this.$element.data("on-color"), 
			 offColor: this.$element.data("off-color"), 
			 onText: this.$element.data("on-text"), 
			 offText: this.$element.data("off-text"), 
			 labelText: this.$element.data("label-text"), 
			 handleWidth: this.$element.data("handle-width"), 
			 labelWidth: this.$element.data("label-width"), 
			 baseClass: this.$element.data("base-class"), 
			 wrapperClass: this.$element.data("wrapper-class") 
			 }, options); 
			 this.$wrapper = $("<div>", { 
			 "class": (function(_this) { 
			 return function() { 
			 var classes; 
			 classes = ["" + _this.options.baseClass].concat(_this._getClasses(_this.options.wrapperClass)); 
			 classes.push(_this.options.state ? "" + _this.options.baseClass + "-on" : "" + _this.options.baseClass + "-off"); 
			 if (_this.options.size != null) { 
			 classes.push("" + _this.options.baseClass + "-" + _this.options.size); 
			 } 
			 if (_this.options.disabled) { 
			 classes.push("" + _this.options.baseClass + "-disabled"); 
			 } 
			 if (_this.options.readonly) { 
			 classes.push("" + _this.options.baseClass + "-readonly"); 
			 } 
			 if (_this.options.indeterminate) { 
			 classes.push("" + _this.options.baseClass + "-indeterminate"); 
			 } 
			 if (_this.options.inverse) { 
			 classes.push("" + _this.options.baseClass + "-inverse"); 
			 } 
			 if (_this.$element.attr("id")) { 
			 classes.push("" + _this.options.baseClass + "-id-" + (_this.$element.attr("id"))); 
			 } 
			 return classes.join(" "); 
			 }; 
			 })(this)() 
			 }); 
			 this.$container = $("<div>", { 
			 "class": "" + this.options.baseClass + "-container" 
			 }); 
			 this.$on = $("<span>", { 
			 html: this.options.onText, 
			 "class": "" + this.options.baseClass + "-handle-on " + this.options.baseClass + "-" + this.options.onColor 
			 }); 
			 this.$off = $("<span>", { 
			 html: this.options.offText, 
			 "class": "" + this.options.baseClass + "-handle-off " + this.options.baseClass + "-" + this.options.offColor 
			 }); 
			 this.$label = $("<span>", { 
			 html: this.options.labelText, 
			 "class": "" + this.options.baseClass + "-label" 
			 }); 
			 this.$element.on("init.fnswitch", (function(_this) { 
			 return function() { 
			 return _this.options.onInit.apply(element, arguments); 
			 }; 
			 })(this)); 
			 this.$element.on("switchChange.fnswitch", (function(_this) { 
			 return function() { 
			 return _this.options.onSwitchChange.apply(element, arguments); 
			 }; 
			 })(this)); 
			 this.$container = this.$element.wrap(this.$container).parent(); 
			 this.$wrapper = this.$container.wrap(this.$wrapper).parent(); 
			 this.$element.before(this.options.inverse ? this.$off : this.$on).before(this.$label).before(this.options.inverse ? this.$on : this.$off); 
			 if (this.options.indeterminate) { 
			 this.$element.prop("indeterminate", true); 
			 } 
			 this._init(); 
			 this._elementHandlers(); 
			 this._handleHandlers(); 
			 this._labelHandlers(); 
			 this._formHandler(); 
			 this._externalLabelHandler(); 
			 this.$element.trigger("init.fnswitch"); 
	 } 
	 
	 Switch.DEFAULTS = { 
			 state: true, 
			 size: null, 
			 animate: true, 
			 disabled: false, 
			 readonly: false, 
			 indeterminate: false, 
			 inverse: false, 
			 radioAllOff: false, 
			 onColor: "primary", 
			 offColor: "default", 
			 onText: "ON", 
			 offText: "OFF", 
			 labelText: "&nbsp;", 
			 handleWidth: "auto", 
			 labelWidth: "auto", 
			 baseClass: "fn-switch", 
			 wrapperClass: "wrapper", 
			 onInit: function() { 
			 }, 
			 onSwitchChange: function() { 
			 } 
	 };
	 
	 
	 Switch.prototype._constructor = Switch; 
	  
	 Switch.prototype.state = function(value, skip) { 
			 if (typeof value === "undefined") { 
			 return this.options.state; 
			 } 
			 if (this.options.disabled || this.options.readonly) { 
			 return this.$element; 
			 } 
			 if (this.options.state && !this.options.radioAllOff && this.$element.is(":radio")) { 
			 return this.$element; 
			 } 
			 if (this.options.indeterminate) { 
			 this.indeterminate(false); 
			 } 
			 value = !!value; 
			 this.$element.prop("checked", value).trigger("change.fnswitch", skip); 
			 return this.$element; 
	 }; 
	  
	 Switch.prototype.toggleState = function(skip) { 
			 if (this.options.disabled || this.options.readonly) { 
			 return this.$element; 
			 } 
			 if (this.options.indeterminate) { 
			 this.indeterminate(false); 
			 return this.state(true); 
			 } else { 
			 return this.$element.prop("checked", !this.options.state).trigger("change.fnswitch", skip); 
			 } 
	 }; 
	  
	 Switch.prototype.size = function(value) { 
			 if (typeof value === "undefined") { 
			 return this.options.size; 
			 } 
			 if (this.options.size != null) { 
			 this.$wrapper.removeClass("" + this.options.baseClass + "-" + this.options.size); 
			 } 
			 if (value) { 
			 this.$wrapper.addClass("" + this.options.baseClass + "-" + value); 
			 } 
			 this._width(); 
			 this._containerPosition(); 
			 this.options.size = value; 
			 return this.$element; 
	 }; 
	  
	 Switch.prototype.animate = function(value) { 
			 if (typeof value === "undefined") { 
			 return this.options.animate; 
			 } 
			 value = !!value; 
			 if (value === this.options.animate) { 
			 return this.$element; 
			 } 
			 return this.toggleAnimate(); 
	 }; 
	  
	 Switch.prototype.toggleAnimate = function() { 
			 this.options.animate = !this.options.animate; 
			 this.$wrapper.toggleClass("" + this.options.baseClass + "-animate"); 
			 return this.$element; 
	 }; 
	  
	 Switch.prototype.disabled = function(value) { 
			 if (typeof value === "undefined") { 
			 return this.options.disabled; 
			 } 
			 value = !!value; 
			 if (value === this.options.disabled) { 
			 return this.$element; 
			 } 
			 return this.toggleDisabled(); 
	 }; 
	  
	 Switch.prototype.toggleDisabled = function() { 
			 this.options.disabled = !this.options.disabled; 
			 this.$element.prop("disabled", this.options.disabled); 
			 this.$wrapper.toggleClass("" + this.options.baseClass + "-disabled"); 
			 return this.$element; 
	 }; 
	  
	 Switch.prototype.readonly = function(value) { 
			 if (typeof value === "undefined") { 
			 return this.options.readonly; 
			 } 
			 value = !!value; 
			 if (value === this.options.readonly) { 
			 return this.$element; 
			 } 
			 return this.toggleReadonly(); 
	 }; 
	  
	 Switch.prototype.toggleReadonly = function() { 
			 this.options.readonly = !this.options.readonly; 
			 this.$element.prop("readonly", this.options.readonly); 
			 this.$wrapper.toggleClass("" + this.options.baseClass + "-readonly"); 
			 return this.$element; 
	 }; 
	  
	 Switch.prototype.indeterminate = function(value) { 
			 if (typeof value === "undefined") { 
			 return this.options.indeterminate; 
			 } 
			 value = !!value; 
			 if (value === this.options.indeterminate) { 
			 return this.$element; 
			 } 
			 return this.toggleIndeterminate(); 
	 }; 
	  
	 Switch.prototype.toggleIndeterminate = function() { 
			 this.options.indeterminate = !this.options.indeterminate; 
			 this.$element.prop("indeterminate", this.options.indeterminate); 
			 this.$wrapper.toggleClass("" + this.options.baseClass + "-indeterminate"); 
			 this._containerPosition(); 
			 return this.$element; 
	 }; 
	  
	 Switch.prototype.inverse = function(value) { 
			 if (typeof value === "undefined") { 
			 return this.options.inverse; 
			 } 
			 value = !!value; 
			 if (value === this.options.inverse) { 
			 return this.$element; 
			 } 
			 return this.toggleInverse(); 
	 }; 
	  
	 Switch.prototype.toggleInverse = function() { 
			 var $off, $on; 
			 this.$wrapper.toggleClass("" + this.options.baseClass + "-inverse"); 
			 $on = this.$on.clone(true); 
			 $off = this.$off.clone(true); 
			 this.$on.replaceWith($off); 
			 this.$off.replaceWith($on); 
			 this.$on = $off; 
			 this.$off = $on; 
			 this.options.inverse = !this.options.inverse; 
			 return this.$element; 
	 }; 
	  
	 Switch.prototype.onColor = function(value) { 
			 var color; 
			 color = this.options.onColor; 
			 if (typeof value === "undefined") { 
			 return color; 
			 } 
			 if (color != null) { 
			 this.$on.removeClass("" + this.options.baseClass + "-" + color); 
			 } 
			 this.$on.addClass("" + this.options.baseClass + "-" + value); 
			 this.options.onColor = value; 
			 return this.$element; 
	 }; 
	  
	 Switch.prototype.offColor = function(value) { 
			 var color; 
			 color = this.options.offColor; 
			 if (typeof value === "undefined") { 
			 return color; 
			 } 
			 if (color != null) { 
			 this.$off.removeClass("" + this.options.baseClass + "-" + color); 
			 } 
			 this.$off.addClass("" + this.options.baseClass + "-" + value); 
			 this.options.offColor = value; 
			 return this.$element; 
	 }; 
	  
	 Switch.prototype.onText = function(value) { 
			 if (typeof value === "undefined") { 
			 return this.options.onText; 
			 } 
			 this.$on.html(value); 
			 this._width(); 
			 this._containerPosition(); 
			 this.options.onText = value; 
			 return this.$element; 
	 }; 
	  
	 Switch.prototype.offText = function(value) { 
			 if (typeof value === "undefined") { 
			 return this.options.offText; 
			 } 
			 this.$off.html(value); 
			 this._width(); 
			 this._containerPosition(); 
			 this.options.offText = value; 
			 return this.$element; 
	 }; 
	  
	 Switch.prototype.labelText = function(value) { 
			 if (typeof value === "undefined") { 
			 return this.options.labelText; 
			 } 
			 this.$label.html(value); 
			 this._width(); 
			 this.options.labelText = value; 
			 return this.$element; 
	 }; 
	  
	 Switch.prototype.handleWidth = function(value) { 
			 if (typeof value === "undefined") { 
			 return this.options.handleWidth; 
			 } 
			 this.options.handleWidth = value; 
			 this._width(); 
			 this._containerPosition(); 
			 return this.$element; 
	 }; 
	  
	 Switch.prototype.labelWidth = function(value) { 
			 if (typeof value === "undefined") { 
			 return this.options.labelWidth; 
			 } 
			 this.options.labelWidth = value; 
			 this._width(); 
			 this._containerPosition(); 
			 return this.$element; 
	 }; 
	  
	 Switch.prototype.baseClass = function(value) { 
		 	return this.options.baseClass; 
	 }; 
	  
	 Switch.prototype.wrapperClass = function(value) { 
			 if (typeof value === "undefined") { 
			 return this.options.wrapperClass; 
			 } 
			 if (!value) { 
			 value = Switch.DEFAULTS.wrapperClass; 
			 } 
			 this.$wrapper.removeClass(this._getClasses(this.options.wrapperClass).join(" ")); 
			 this.$wrapper.addClass(this._getClasses(value).join(" ")); 
			 this.options.wrapperClass = value; 
			 return this.$element; 
	 }; 
	  
	 Switch.prototype.radioAllOff = function(value) { 
			 if (typeof value === "undefined") { 
			 return this.options.radioAllOff; 
			 } 
			 value = !!value; 
			 if (value === this.options.radioAllOff) { 
			 return this.$element; 
			 } 
			 this.options.radioAllOff = value; 
			 return this.$element; 
	 }; 
	  
	 Switch.prototype.onInit = function(value) { 
			 if (typeof value === "undefined") { 
			 return this.options.onInit; 
			 } 
			 if (!value) { 
			 value = Switch.DEFAULTS.onInit; 
			 } 
			 this.options.onInit = value; 
			 return this.$element; 
	 }; 
	  
	 Switch.prototype.onSwitchChange = function(value) { 
			 if (typeof value === "undefined") { 
			 return this.options.onSwitchChange; 
			 } 
			 if (!value) { 
			 value = Switch.DEFAULTS.onSwitchChange; 
			 } 
			 this.options.onSwitchChange = value; 
			 return this.$element; 
	 }; 
	  
	 Switch.prototype.destroy = function() { 
			 var $form; 
			 $form = this.$element.closest("form"); 
			 if ($form.length) { 
			 $form.off("reset.fnswitch").removeData("fnui.switch"); 
			 } 
			 this.$container.children().not(this.$element).remove(); 
			 this.$element.unwrap().unwrap().off(".fnswitch").removeData("fnui.switch"); 
			 return this.$element; 
	 }; 
	  
	 Switch.prototype._width = function() { 
			 var $handles, handleWidth; 
			 $handles = this.$on.add(this.$off); 
			 $handles.add(this.$label).css("width", ""); 
			 handleWidth = this.options.handleWidth === "auto" ? Math.max(this.$on.width(), this.$off.width()) : this.options.handleWidth; 
			 $handles.width(handleWidth); 
			 this.$label.width((function(_this) { 
			 return function(index, width) { 
			 if (_this.options.labelWidth !== "auto") { 
			 return _this.options.labelWidth; 
			 } 
			 if (width < handleWidth) { 
			 return handleWidth; 
			 } else { 
			 return width; 
			 } 
			 }; 
			 })(this)); 
			 this._handleWidth = this.$on.outerWidth(); 
			 this._labelWidth = this.$label.outerWidth(); 
			 this.$container.width((this._handleWidth * 2) + this._labelWidth); 
			 return this.$wrapper.width(this._handleWidth + this._labelWidth); 
	 }; 
	  
	 Switch.prototype._containerPosition = function(state, callback) { 
			 if (state == null) { 
			 state = this.options.state; 
			 } 
			 this.$container.css("margin-left", (function(_this) { 
			 return function() { 
			 var values; 
			 values = [0, "-" + _this._handleWidth + "px"]; 
			 if (_this.options.indeterminate) { 
			 return "-" + (_this._handleWidth / 2) + "px"; 
			 } 
			 if (state) { 
			 if (_this.options.inverse) { 
			 return values[1]; 
			 } else { 
			 return values[0]; 
			 } 
			 } else { 
			 if (_this.options.inverse) { 
			 return values[0]; 
			 } else { 
			 return values[1]; 
			 } 
			 } 
			 }; 
			 })(this)); 
			 if (!callback) { 
			 return; 
			 } 
			 return setTimeout(function() { 
			 return callback(); 
			 }, 50); 
	 }; 
	  
	 Switch.prototype._init = function() { 
			 var init, initInterval; 
			 init = (function(_this) { 
			 return function() { 
			 _this._width(); 
			 return _this._containerPosition(null, function() { 
			 if (_this.options.animate) { 
			 return _this.$wrapper.addClass("" + _this.options.baseClass + "-animate"); 
			 } 
			 }); 
			 }; 
			 })(this); 
			 if (this.$wrapper.is(":visible")) { 
			 return init(); 
			 } 
			 return initInterval = window.setInterval((function(_this) { 
			 return function() { 
			 if (_this.$wrapper.is(":visible")) { 
			 init(); 
			 return window.clearInterval(initInterval); 
			 } 
			 }; 
			 })(this), 50); 
	 }; 
	  
	 Switch.prototype._elementHandlers = function() { 
			 return this.$element.on({ 
			 "change.fnswitch": (function(_this) { 
			 return function(e, skip) { 
			 var state; 
			 e.preventDefault(); 
			 e.stopImmediatePropagation(); 
			 state = _this.$element.is(":checked"); 
			 _this._containerPosition(state); 
			 if (state === _this.options.state) { 
			 return; 
			 } 
			 _this.options.state = state; 
			 _this.$wrapper.toggleClass("" + _this.options.baseClass + "-off").toggleClass("" + _this.options.baseClass + "-on"); 
			 if (!skip) { 
			 if (_this.$element.is(":radio")) { 
			 $("[name='" + (_this.$element.attr('name')) + "']").not(_this.$element).prop("checked", false).trigger("change.fnswitch", true); 
			 } 
			 return _this.$element.trigger("switchChange.fnswitch", [state]); 
			 } 
			 }; 
			 })(this), 
			 "focus.fnswitch": (function(_this) { 
			 return function(e) { 
			 e.preventDefault(); 
			 return _this.$wrapper.addClass("" + _this.options.baseClass + "-focused"); 
			 }; 
			 })(this), 
			 "blur.fnswitch": (function(_this) { 
			 return function(e) { 
			 e.preventDefault(); 
			 return _this.$wrapper.removeClass("" + _this.options.baseClass + "-focused"); 
			 }; 
			 })(this), 
			 "keydown.fnswitch": (function(_this) { 
			 return function(e) { 
			 if (!e.which || _this.options.disabled || _this.options.readonly) { 
			 return; 
			 } 
			 switch (e.which) { 
			 case 37: 
			 e.preventDefault(); 
			 e.stopImmediatePropagation(); 
			 return _this.state(false); 
			 case 39: 
			 e.preventDefault(); 
			 e.stopImmediatePropagation(); 
			 return _this.state(true); 
			 } 
			 }; 
			 })(this) 
			 }); 
	 }; 
	  
	 Switch.prototype._handleHandlers = function() { 
			 this.$on.on("click.fnswitch", (function(_this) { 
			 return function(event) { 
			 event.preventDefault(); 
			 event.stopPropagation(); 
			 _this.state(false); 
			 return _this.$element.trigger("focus.fnswitch"); 
			 }; 
			 })(this)); 
			 return this.$off.on("click.fnswitch", (function(_this) { 
			 return function(event) { 
			 event.preventDefault(); 
			 event.stopPropagation(); 
			 _this.state(true); 
			 return _this.$element.trigger("focus.fnswitch"); 
			 }; 
			 })(this)); 
	 }; 
	  
	 Switch.prototype._labelHandlers = function() { 
			 return this.$label.on({ 
			 "mousedown.fnswitch touchstart.fnswitch": (function(_this) { 
			 return function(e) { 
			 if (_this._dragStart || _this.options.disabled || _this.options.readonly) { 
			 return; 
			 } 
			 e.preventDefault(); 
			 e.stopPropagation(); 
			 _this._dragStart = (e.pageX || e.originalEvent.touches[0].pageX) - parseInt(_this.$container.css("margin-left"), 10); 
			 if (_this.options.animate) { 
			 _this.$wrapper.removeClass("" + _this.options.baseClass + "-animate"); 
			 } 
			 return _this.$element.trigger("focus.fnswitch"); 
			 }; 
			 })(this), 
			 "mousemove.fnswitch touchmove.fnswitch": (function(_this) { 
			 return function(e) { 
			 var difference; 
			 if (_this._dragStart == null) { 
			 return; 
			 } 
			 e.preventDefault(); 
			 difference = (e.pageX || e.originalEvent.touches[0].pageX) - _this._dragStart; 
			 if (difference < -_this._handleWidth || difference > 0) { 
			 return; 
			 } 
			 _this._dragEnd = difference; 
			 return _this.$container.css("margin-left", "" + _this._dragEnd + "px"); 
			 }; 
			 })(this), 
			 "mouseup.fnswitch touchend.fnswitch": (function(_this) { 
			 return function(e) { 
			 var state; 
			 if (!_this._dragStart) { 
			 return; 
			 } 
			 e.preventDefault(); 
			 if (_this.options.animate) { 
			 _this.$wrapper.addClass("" + _this.options.baseClass + "-animate"); 
			 } 
			 if (_this._dragEnd) { 
			 state = _this._dragEnd > -(_this._handleWidth / 2); 
			 _this._dragEnd = false; 
			 _this.state(_this.options.inverse ? !state : state); 
			 } else { 
			 _this.state(!_this.options.state); 
			 } 
			 return _this._dragStart = false; 
			 }; 
			 })(this), 
			 "mouseleave.fnswitch": (function(_this) { 
			 return function(e) { 
			 return _this.$label.trigger("mouseup.fnswitch"); 
			 }; 
			 })(this) 
			 }); 
	 }; 
	  
	 Switch.prototype._externalLabelHandler = function() { 
			 var $externalLabel; 
			 $externalLabel = this.$element.closest("label"); 
			 return $externalLabel.on("click", (function(_this) { 
			 return function(event) { 
			 event.preventDefault(); 
			 event.stopImmediatePropagation(); 
			 if (event.target === $externalLabel[0]) { 
			 return _this.toggleState(); 
			 } 
			 }; 
			 })(this)); 
	 }; 
	  
	 Switch.prototype._formHandler = function() { 
			 var $form; 
			 $form = this.$element.closest("form"); 
			 if ($form.data("fnui.switch")) { 
			 return; 
			 } 
			 return $form.on("reset.fnswitch", function() { 
			 return window.setTimeout(function() { 
			 return $form.find("input").filter(function() { 
			 return $(this).data("fnui.switch"); 
			 }).each(function() { 
			 return $(this).fnswitch("state", this.checked); 
			 }); 
			 }, 1); 
			 }).data("fnui.switch", true); 
	 }; 
	  
	 Switch.prototype._getClasses = function(classes) { 
			 var c, cls, _i, _len; 
			 if (!$.isArray(classes)) { 
			 return ["" + this.options.baseClass + "-" + classes]; 
			 } 
			 cls = []; 
			 for (_i = 0, _len = classes.length; _i < _len; _i++) { 
			 c = classes[_i]; 
			 cls.push("" + this.options.baseClass + "-" + c); 
			 } 
			 return cls; 
	 }; 
	   
	 
	 $.fn.fnswitch = function() { 
		 var args, option, ret; 
		 option = arguments[0], args = 2 <= arguments.length ? [].slice.call(arguments, 1) : []; 
		 ret = this; 
		 this.each(function() { 
		 var $this, data; 
		 $this = $(this); 
		 data = $this.data("fnui.switch"); 
		 if (!data) { 
		 $this.data("fnui.switch", data = new Switch(this, option)); 
		 } 
		 if (typeof option === "string") { 
		 return ret = data[option].apply(data, args); 
		 } 
		 }); 
		 return ret; 
	 }; 
	 $.fn.fnswitch.Constructor = Switch; 
	  
	 $(function() { 
		 $('[data-fn-switch]').fnswitch(); 
	 }); 
	 UI.switcher = Switch
	 return Switch;
});