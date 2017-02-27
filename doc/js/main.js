var viewpath = "html/";
var csspath = 'css/';
var cssary = [	 
              	{name:'基本样式',head:true},
            	{id:'utility',name:'辅助类',url:'utility.html'},
              	{name:'布局相关', head:true},
            	{id:'grid',name:'布局网格',url:'grid.html'},
               	{id:'block-grid',name:'等分网格',url:'block-grid.html'},
        
              	{name:'html元素',head:true},
            	{id:'button',name:'按钮',url:'button.html'},
                {id:'form',name:'表单',url:'form.html'},  
            	{id:'image',name:'图片',url:'image.html'},
               	{id:'table',name:'表格',url:'table.html'},
              
				{name:'组件',head:true},
				{id:'article',name:'文本',url:'article.html'},   	
				{id:'badge',name:'小徽章',url:'badge.html'},
				{id:'breadcrumb',name:'面包屑',url:'breadcrumb.html'},  
				{id:'button-group',name:'按钮组',url:'button-group.html'},
				{id:'close',name:'关闭按钮',url:'close.html'},
				{id:'code',name:'代码',url:'code.html'},
				{id:'icon',name:'图标',url:'icon.html'},
				{id:'input-group',name:'输入框',url:'input-group.html'},
				{id:'list',name:'列表',url:'list.html'},
				{id:'nav',name:'导航',url:'nav.html'},
				{id:'pagination',name:'分页',url:'pagination.html'},
				{id:'panel',name:'面板',url:'panel.html'},
				{id:'progress',name:'进度条',url:'progress.html'},
				{id:'thumbnail',name:'缩略图',url:'thumbnail.html'},
				{id:'topbar',name:'导航条',url:'topbar.html'},
				{id:'animation',name:'动画',url:'animation.html'},
		];

var jspath = "javascript/";
var jsobj = [
				{name:'JS控件',head:true},
				{id:'alert',name:'警告框',url:'alert.html'},
				{id:'button',name:'按钮交互',url:'button.html'},
				{id:'collapse',name:'折叠面板',url:'collapse.html'},
				{id:'datepicker',name:'日期组件',url:'datePicker.html'},
				{id:'dropdown',name:'下拉组件',url:'dropdown.html'},
				//{id:'fastclick',name:'',url:'fastclick.html'},
				{id:'modal',name:'模态窗口',url:'modal.html'},  
				{id:'offcanvas',name:'侧边栏',url:'offcanvas.html'},
				{id:'popover',name:'提示框',url:'popover.html'},
				{id:'progress',name:'加载进度条',url:'progress.html'},
				{id:'scrollspy',name:'滚动侦测',url:'scrollspy.html'},
				//{id:'scrollspynav',name:'滚动导航',url:'scrollspynav.html'},
				{id:'select',name:'下拉选择框',url:'select.html'},
				{id:'slider',name:'图片轮播',url:'slider.html'},
				{id:'smooth-scroll',name:'平滑滚动',url:'smooth-scroll.html'},
				{id:'sticky',name:'固定元素',url:'sticky.html'},
				{id:'switch',name:'单选开关',url:'switch.html'},
				{id:'tabs',name:'选项卡',url:'tabs.html'},
				{id:'toast',name:'对话框',url:'toast.html'},
				{id:'uCheck',name:'单/多选框',url:'uCheck.html'},
				
				{name:'实用工具',head:true},
				{id:'dimmer',name:'遮罩',url:'dimmer.html'},
				{id:'validator',name:'表单验证',url:'validator.html'}
				//localstorage 未添加
             ];

var store = (function(){
	 var localStore = window.localStorage;
	 var set = function(key,value){
		 localStore.setItem(key,value);
	 };
	 var get = function(key){
		 return localStore.getItem(key);
	 };
	 var remove = function(key){
		 localStore.removeItem(key);
	 }
	 return{
		 set:set,
		 get:get,
		 remove:remove
	 }	 
})(window);

$(function(){
  var loadPage = function(id){
	  if(id == "css" || id === "javascript"){
		  var template = $("#manual").html();
		  $("#container").html(template);
		  //load list
		  listInit(id);
	  }else if(id === "home"){
		  $("#container").load(viewpath+id+".html");
	  }else{
		  var template = $("#manual").html();
		  $("#container").html(template);
		  $("#container .subcontainer").load(viewpath+id+".html");
	  }
  };
  
  //用来初始化manual的内容
	var listInit = function(id){
		var ary = [];
		var path = "";
		if(id === "css"){
			path = viewpath+csspath;
			ary = cssary;
		}else{
			path = viewpath+jspath;
			ary = jsobj;
		}
		
		var list = "";
		var headtemp = "<li class='fn-nav-header listhead'>NAME</li>";
		var anchortemp = "<li><a id='ANCHORID' href='javascript:void(0);'>NAME<span class='fn-nav-en'>ANCHORID</span></a></li>"
		for(var i = 0;i<ary.length;i++){
			var obj = ary[i];
			if(obj['head'])
				list += headtemp.replace('NAME',obj.name);
			else{
				var str = anchortemp.replace('NAME',obj.name);
				str = str.replace(/ANCHORID/g,obj.id);
				list += str;
			}
		}
		$("#listinit").html(list);
		//binding
		$("#listinit a").on("click",function(e){
			var id = $(this).attr("id");
			store.set("subnav",id);
			$("#listinit .fn-active").removeClass("fn-active")
			$(this).parent().addClass("fn-active");
			$("#content").load(path+id+".html");
			
			//page cleaner
			$("#vld-tooltip").remove();
			$(".fn-popover").remove();
		});
		var subnav = store.get("subnav");
		if(subnav && $("#"+subnav).length)
			$("#listinit #"+subnav).click();
		else
			$("#listinit a:first").click();
	};
  

	$("#top a").on("click",function(e){
		  store.remove("subnav");
		  var page = $(this).attr('id');
		  store.set("nav",page);
		  loadPage(page);
		  $('#top .fn-active').removeClass('fn-active');
		  $(this).parent().addClass('fn-active'); 
	});
	
  //init page
  var nav = store.get("nav");
  nav && $("#"+nav).parent().addClass("fn-active");
  loadPage(nav||"home");
  
});