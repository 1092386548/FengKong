$(function(){
	$(window).scroll(function(){
		var headerIndex = $('.headerIndex');
		var backTop = $("#back-top");
		
		var sh=$(window).scrollTop();

		if(sh >= 500){
			headerIndex.addClass('headerFix');
		}else{
			headerIndex.removeClass('headerFix');
		}

		if(sh >= 200){
			backTop.fadeIn();
		}else{
			backTop.fadeOut();
		}
	})

	$("#back-top").click(function(){
		$('html,body').animate({scrollTop:0},'slow','swing');
		
	})

})