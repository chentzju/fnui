require.config({
	 baseUrl:"../src/js/",
	 paths:{
		jquery:'jquery.min',
		fnui:'fnui'
	 }
});
require(['jquery','fnui'],function($,UI){
	$(function(){
		$('.btn-loading-example').click(function () {
			  var $btn = $(this)
			  $btn.button('loading');
			    setTimeout(function()
							{
			      $btn.button('reset');
			  }, 2000);
			UI.toast.content("dfasfasf").show('warning',3000).clear();
			});
		$('#my-scrollspy').scrollspy({
		    animation: 'slide-left',
		    delay: 500
		  });


		$("form").validator({
			validateOnSubmit:true,
			onValid:function(a,b){
				console.log("print")
			},
			onInValid:function(a,c){
				console.log('invalid')
			},
			onSuccess:function(a,b){
				console.log('success');
			}
		})
	});
});

