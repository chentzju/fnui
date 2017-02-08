/*=============
  FNUI 2.0 TOAST
================*/
define(['jquery','./fnuicore'],function($,UI){

   'use strict';
	
var Toast = function(){
	this.$element = $(Toast.DEFAULT.tpl)
	this.inited =false;
}
	
	
Toast.DEFAULT ={
		tpl:'<!--BEGIN toast-->'
	    		+'<div id="toastInHtmlTemp" style="display:none">'
	    		+'<div class="fn-mask-transparent"></div>'
	    		+'<div class="fn-toast">'
	    			+'<i class="fn-icon-check fn-icon-lg"></i>'
	    			+'<p class="fn-toast-content">已完成</p>'
	    		+'</div>'
	    		+'</div>'
	    		+'<!--end toast-->'
	    		
	    		+'<!-- loading toast -->'
	    		+'<div id="loadingToast" class="fn-loading-toast" style="display:none">'
				+'<div class="fn-mask-transparent"></div>'
				+'<div class="fn-toast">'
				    +'<div class="fn-loading">'
				    +'<div class="fn-loading-leaf fn-loading-leaf_0"></div>'
				    +'<div class="fn-loading-leaf fn-loading-leaf_1"></div>'
				    +'<div class="fn-loading-leaf fn-loading-leaf_2"></div>'
				    +'<div class="fn-loading-leaf fn-loading-leaf_3"></div>'
				    +'<div class="fn-loading-leaf fn-loading-leaf_4"></div>'
				    +'<div class="fn-loading-leaf fn-loading-leaf_5"></div>'
				    +'<div class="fn-loading-leaf fn-loading-leaf_6"></div>'
				    +'<div class="fn-loading-leaf fn-loading-leaf_7"></div>'
				    +'<div class="fn-loading-leaf fn-loading-leaf_8"></div>'
				    +'<div class="fn-loading-leaf fn-loading-leaf_9"></div>'
				    +'<div class="fn-loading-leaf fn-loading-leaf_10"></div>'
				    +'<div class="fn-loading-leaf fn-loading-leaf_11"></div>'
				    +'</div>'
				    +'<p class="fn-toast-content">数据加载中</p>'
			    +'</div>'
			    +'</div>',
		info:'已完成',
		warning:'出错了',
		loading:'数据加载中',
		content: ""
};

Toast.prototype.init = function() {
    if (!this.inited) {
      $(document.body).append(this.$element);
      this.inited = true;
    }
    return this;
 };

Toast.prototype.content = function(content){
	if (!this.inited) {
        this.init();
    }
	Toast.DEFAULT.content = content;
	return this;
};
Toast.prototype.clear = function(content){
	if (!this.inited) {
        this.init();
    }
	Toast.DEFAULT.content = "";
	return this;
}
 
 
Toast.prototype.show = function(type,time){
	
	if (!this.inited) {
        this.init();
    }
	
	if(type != undefined && type.indexOf("loading") != -1 ){
	    var $loadingToast = $('#loadingToast');
	    this.$toast = $loadingToast;

	    if ($loadingToast.css('display') != 'none') {
	        return;
	    }
	    Toast.DEFAULT.content && $('#loadingToast .fn-toast-content').html(Toast.DEFAULT.content) ||
	    $('#loadingToast .fn-toast-content').html(Toast.DEFAULT.loading)
	
	    $loadingToast.show();
		time && setTimeout(function () {
		    	$loadingToast.hide();
		 }, time);
	}else if(type != undefined && type.indexOf("warning") != -1){
		 var $toast = $('#toastInHtmlTemp');
		 this.$toast = $toast;
		 $('#toastInHtmlTemp i').removeClass('fn-icon-check').addClass("fn-icon-exclamation")
		 Toast.DEFAULT.content && $('#toastInHtmlTemp .fn-toast-content').html(Toast.DEFAULT.content) || 
		  $('#toastInHtmlTemp .fn-toast-content').html(Toast.DEFAULT.warning);
		 
		 $toast.show();
		 time && setTimeout(function () {
		        $toast.hide();
		 }, time);
	}else{
	    var $toast = $('#toastInHtmlTemp');
		this.$toast = $toast;

	    $('#toastInHtmlTemp i').removeClass('fn-icon-exclamation').addClass("fn-icon-check")
	    Toast.DEFAULT.content && $('#toastInHtmlTemp .fn-toast-content').html(Toast.DEFAULT.content) || 
	    $('#toastInHtmlTemp .fn-toast-content').html(Toast.DEFAULT.info);
	    	
	    $toast.show();
	    time && setTimeout(function () {
	        $toast.hide();
	    }, time);
	}
    return this;
};
Toast.prototype.close = function(type){
	this.$toast.hide();
	return this;
};

	UI.toast = new Toast();
	return  $.toast = UI.toast;
});