
/*=============
  FNUI 2.0 SELECT
================*/

define(['jquery','./fnuicore','./dropdown'],function($,UI){

  
  'use strict';

// Make jQuery :contains Case-Insensitive
$.expr[':'].containsNC = function(elem, i, match, array) {
  return (elem.textContent || elem.innerText || '').toLowerCase().
      indexOf((match[3] || '').toLowerCase()) >= 0;
};

var Selected = function(element, options) {
  this.$element = $(element);
  this.options = $.extend({}, Selected.DEFAULTS, {
    placeholder: element.getAttribute('placeholder') ||
    Selected.DEFAULTS.placeholder
  }, options);
  this.$originalOptions = this.$element.find('option');
  this.multiple = element.multiple;
  this.$selector = null;
  this.initialized = false;
  this.init();
};

Selected.DEFAULTS = {
  btnWidth: null,
  btnSize: null,
  btnStyle: 'default',
  dropUp: 0,
  maxHeight: null,
  maxChecked: null,
  placeholder: '点击选择...',
  selectedClass: 'fn-checked',
  disabledClass: 'fn-disabled',
  searchBox: false,
  tpl: '<div class="fn-selected fn-dropdown ' +
  '<%= dropUp ? \'fn-dropdown-up\': \'\' %>" id="<%= id %>" data-fn-dropdown>' +
  '  <button type="button" class="fn-selected-btn fn-btn fn-dropdown-toggle">' +
  '    <span class="fn-selected-status fn-fl"></span>' +
  '    <i class="fn-selected-icon fn-icon-caret-' +
  '<%= dropUp ? \'up\' : \'down\' %>"></i>' +
  '  </button>' +
  '  <div class="fn-selected-content fn-dropdown-content">' +
  '    <h2 class="fn-selected-header">' +
  '<span class="fn-icon-chevron-left">返回</span></h2>' +
  '   <% if (searchBox) { %>' +
  '   <div class="fn-selected-search">' +
  '     <input autocomplete="off" class="fn-form-field fn-input-sm" />' +
  '   </div>' +
  '   <% } %>' +
  '    <ul class="fn-selected-list">' +
  '      <% for (var i = 0; i < options.length; i++) { %>' +
  '       <% var option = options[i] %>' +
  '       <% if (option.header) { %>' +
  '  <li data-group="<%= option.group %>" class="fn-selected-list-header">' +
  '       <%= option.text %></li>' +
  '       <% } else { %>' +
  '       <li class="<%= option.classNames%>" ' +
  '         data-index="<%= option.index %>" ' +
  '         data-group="<%= option.group || 0 %>" ' +
  '         data-value="<%= option.value %>" >' +
  '         <span class="fn-selected-text"><%= option.text %></span>' +
  '         <i class="fn-icon-check"></i></li>' +
  '      <% } %>' +
  '      <% } %>' +
  '    </ul>' +
  '    <div class="fn-selected-hint"></div>' +
  '  </div>' +
  '</div>',
  listTpl:   '<% for (var i = 0; i < options.length; i++) { %>' +
  '       <% var option = options[i] %>' +
  '       <% if (option.header) { %>' +
  '  <li data-group="<%= option.group %>" class="fn-selected-list-header">' +
  '       <%= option.text %></li>' +
  '       <% } else { %>' +
  '       <li class="<%= option.classNames %>" ' +
  '         data-index="<%= option.index %>" ' +
  '         data-group="<%= option.group || 0 %>" ' +
  '         data-value="<%= option.value %>" >' +
  '         <span class="fn-selected-text"><%= option.text %></span>' +
  '         <i class="fn-icon-check"></i></li>' +
  '      <% } %>' +
  '      <% } %>'
};

Selected.prototype.init = function() {
  var _this = this;
  var $element = this.$element;
  var options = this.options;

  $element.hide();

  var data = {
    id:Selected.generateGUID(),
    multiple: this.multiple,
    options: [],
    searchBox: options.searchBox,
    dropUp: options.dropUp,
    placeholder: options.placeholder
  };

  this.$selector = $(Selected.template(this.options.tpl, data));
  // set select button styles
  this.$selector.css({width: this.options.btnWidth});

  if (this.$element[0].disabled) {
    this.$selector.addClass(options.disabledClass);
  }

  this.$list = this.$selector.find('.fn-selected-list');
  this.$searchField = this.$selector.find('.fn-selected-search input');
  this.$hint = this.$selector.find('.fn-selected-hint');

  var $selectorBtn = this.$selector.find('.fn-selected-btn');
  var btnClassNames = [];

  options.btnSize && btnClassNames.push('fn-btn-' + options.btnSize);
  options.btnStyle && btnClassNames.push('fn-btn-' + options.btnStyle);
  $selectorBtn.addClass(btnClassNames.join(' '));

  this.$selector.dropdown({
    justify: $selectorBtn
  });

  // set list height
  if (options.maxHeight) {
    this.$selector.find('.fn-selected-list').css({
      'max-height': options.maxHeight,
      'overflow-y': 'scroll'
    });
  }

  // set hint text
  var hint = [];
  var min = $element.attr('minchecked');
  var max = $element.attr('maxchecked') || options.maxChecked;

  this.maxChecked = max || Infinity;

  if ($element[0].required) {
    hint.push('必选');
  }

  if (min || max) {
    min && hint.push('至少选择 ' + min + ' 项');
    max && hint.push('至多选择 ' + max + ' 项');
  }

  this.$hint.text(hint.join('，'));

  // render dropdown list
  this.renderOptions();

  // append $selector after <select>
  this.$element.after(this.$selector);
  this.dropdown = this.$selector.data('fnui.dropdown');
  this.$status = this.$selector.find('.fn-selected-status');

  // #try to fixes #476
  setTimeout(function() {
    _this.syncData();
    _this.initialized = true;
  }, 0);

  this.bindEvents();
};

Selected.prototype.renderOptions = function() {
  var $element = this.$element;
  var options = this.options;
  var optionItems = [];
  var $optgroup = $element.find('optgroup');
  this.$originalOptions = this.$element.find('option');

  // 单选框使用 JS 禁用已经选择的 option 以后，
  // 浏览器会重新选定第一个 option，但有一定延迟，致使 JS 获取 value 时返回 null
  if (!this.multiple && ($element.val() === null)) {
    this.$originalOptions.length &&
    (this.$originalOptions.get(0).selected = true);
  }

  function pushOption(index, item, group) {
    if (item.value === '') {
      // skip to next iteration
      // @see http://stackoverflow.com/questions/481601/how-to-skip-to-next-iteration-in-jquery-each-util
      return true;
    }

    var classNames = '';
    item.disabled && (classNames += options.disabledClass);
    !item.disabled && item.selected && (classNames += options.selectedClass);

    optionItems.push({
      group: group,
      index: index,
      classNames: classNames,
      text: item.text,
      value: item.value
    });
  }

  // select with option groups
  if ($optgroup.length) {
    $optgroup.each(function(i) {
      // push group name
      optionItems.push({
        header: true,
        group: i + 1,
        text: this.label
      });

      $optgroup.eq(i).find('option').each(function(index, item) {
        pushOption(index, item, i);
      });
    });
  } else {
    // without option groups
    this.$originalOptions.each(function(index, item) {
      pushOption(index, item, null);
    });
  }

  this.$list.html(Selected.template(options.listTpl, {options: optionItems}));
  this.$shadowOptions = this.$list.find('> li').
    not('.fn-selected-list-header');
};

Selected.prototype.setChecked = function(item) {
  var options = this.options;
  var $item = $(item);
  var isChecked = $item.hasClass(options.selectedClass);

  if (this.multiple) {
    // multiple
    var checkedLength = this.$list.find('.' + options.selectedClass).length;

    if (!isChecked && this.maxChecked <= checkedLength) {
      this.$element.trigger('checkedOverflow.selected', {
        selected: this
      });

      return false;
    }
  } else {
    if (isChecked) {
      return false;
    }

    this.dropdown.close();
    this.$shadowOptions.not($item).removeClass(options.selectedClass);
  }

  $item.toggleClass(options.selectedClass);
  this.syncData(item);
};

/**
 * syncData
 * @desc if `item` set, only sync `item` related option
 * @param {Object} item
 */
Selected.prototype.syncData = function(item) {
  var _this = this;
  var options = this.options;
  var status = [];
  var $checked = $([]);

  this.$shadowOptions.filter('.' + options.selectedClass).each(function() {
    var $this = $(this);
    status.push($this.find('.fn-selected-text').text());

    if (!item) {
      $checked = $checked.add(_this.$originalOptions
        .filter('[value="' + $this.data('value') + '"]')
        .prop('selected', true));
    }
  });

  if (item) {
    var $item = $(item);
    this.$originalOptions
      .filter('[value="' + $item.data('value') + '"]')
      .prop('selected', $item.hasClass(options.selectedClass));
  } else {
    this.$originalOptions.not($checked).prop('selected', false);
  }

  // nothing selected
  if (!this.$element.val()) {
    status = [options.placeholder];
  }

  this.$status.text(status.join(', '));

  // Do not trigger change event on initializing
  this.initialized && this.$element.trigger('change');
};

Selected.prototype.bindEvents = function() {
  var _this = this;
  var header = 'fn-selected-list-header';
  var handleKeyup = UI.utils.debounce(function(e) {
    _this.$shadowOptions.not('.' + header).hide().
     filter(':containsNC("' + e.target.value + '")').show();
  }, 100);

  this.$list.on('click', '> li', function(e) {
    var $this = $(this);
    !$this.hasClass(_this.options.disabledClass) &&
      !$this.hasClass(header) && _this.setChecked(this);
  });

  // simple search with jQuery :contains
  this.$searchField.on('keyup.selected', handleKeyup);

  // empty search keywords
  this.$selector.on('closed.dropdown', function() {
    _this.$searchField.val('');
    _this.$shadowOptions.css({display: ''});
  });

  // work with Validator
  // @since 2.5
  this.$element.on('validated.field.validator', function(e) {
    if (e.validity) {
      var valid = e.validity.valid;
      var errorClassName = 'fn-invalid';

      _this.$selector[(!valid ? 'add' : 'remove') + 'Class'](errorClassName);
    }
  });

  // observe DOM
  if (UI.support.mutationobserver) {
    this.observer = new UI.support.mutationobserver(function() {
      _this.$element.trigger('changed.selected');
    });

    this.observer.observe(this.$element[0], {
      childList: true,
      attributes: true,
      subtree: true,
      characterData: true
    });
  }

  // custom event
  this.$element.on('changed.selected', function() {
    _this.renderOptions();
    _this.syncData();
  });
};

// @since: 2.5
Selected.prototype.select = function(item) {
  var $item;

  if (typeof item === 'number') {
    $item = this.$list.find('> li').not('.fn-selected-list-header').eq(item);
  } else if (typeof item === 'string') {
    $item = this.$list.find(item);
  } else {
    $item = $(item);
  }

  $item.trigger('click');
},

// @since: 2.5
Selected.prototype.enable = function() {
  this.$element.prop('disable', false);
  this.$selector.dropdown('enable');
},

// @since: 2.5
Selected.prototype.disable = function() {
  this.$element.prop('disable', true);
  this.$selector.dropdown('disable');
},

Selected.prototype.destroy = function() {
  this.$element.removeData('fnui.selected').show();
  this.$selector.remove();
};

Selected.generateGUID = function(namespace) {
  var uid = namespace + '-' || 'fn-';

  do {
    uid += Math.random().toString(36).substring(2, 7);
  } while (document.getElementById(uid));

  return uid;
};

Selected.template = function(id, data) {
  var me = Selected.template;

  if (!me.cache[id]) {
    me.cache[id] = (function() {
      var name = id;
      var string = /^[\w\-]+$/.test(id) ?
        me.get(id) : (name = 'template(string)', id); // no warnings

      var line = 1;
      var body = ('try { ' + (me.variable ?
      'var ' + me.variable + ' = this.stash;' : 'with (this.stash) { ') +
      "this.ret += '" +
      string.
        replace(/<%/g, '\x11').replace(/%>/g, '\x13'). // if you want other tag, just edit this line
        replace(/'(?![^\x11\x13]+?\x13)/g, '\\x27').
        replace(/^\s*|\s*$/g, '').
        replace(/\n/g, function() {
          return "';\nthis.line = " + (++line) + "; this.ret += '\\n";
        }).
        replace(/\x11-(.+?)\x13/g, "' + ($1) + '").
        replace(/\x11=(.+?)\x13/g, "' + this.escapeHTML($1) + '").
        replace(/\x11(.+?)\x13/g, "'; $1; this.ret += '") +
      "'; " + (me.variable ? "" : "}") + "return this.ret;" +
      "} catch (e) { throw 'TemplateError: ' + e + ' (on " + name +
      "' + ' line ' + this.line + ')'; } " +
      "//@ sourceURL=" + name + "\n" // source map
      ).replace(/this\.ret \+= '';/g, '');
      /* jshint -W054 */
      var func = new Function(body);
      var map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '\x22': '&#x22;',
        '\x27': '&#x27;'
      };
      var escapeHTML = function(string) {
        return ('' + string).replace(/[&<>\'\"]/g, function(_) {
          return map[_];
        });
      };

      return function(stash) {
        return func.call(me.context = {
          escapeHTML: escapeHTML,
          line: 1,
          ret: '',
          stash: stash
        });
      };
    })();
  }

  return data ? me.cache[id](data) : me.cache[id];
};
/* jshint +W109 */
/* jshint +W054 */

Selected.template.cache = {};

Selected.template.get = function(id) {
  if (id) {
    var element = document.getElementById(id);
    return element && element.innerHTML || '';
  }
};


UI.plugin('selected', Selected);


UI.ready(function(context) {
  $('[data-fn-selected]', context).selected();
});

  return Selected;
});
