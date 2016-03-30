/*****************************************************************
*Object prototype to manage the sub drop-down menu as full width
*
*Dependencies Css to fix the position of dropdown-menu class
*****************************************************************/
function MenuManager(){
	this.dropMenus = $(".dropdown-menu");
	this.header = $("#ak-header");
}

MenuManager.prototype.init = function(){
	var _this  = this;
	$(document).ready(function(){
		_this.positionDropMenu();
	});
	
	$(window).resize(function(){
		_this.positionDropMenu();
	});
	
	$(document).scroll(function(){
		_this.positionDropMenu();
	});
}

MenuManager.prototype.getHeaderOffsetTop = function(){
	return this.header.offset().top;
}

MenuManager.prototype.getHeaderHeight = function(){
	return  this.header.height();
}

MenuManager.prototype.isHeaderFixed = function(){
	var fixedCSS = this.header.css("position");
	return  fixedCSS === "fixed" ? true : false;
}

MenuManager.prototype.positionDropMenu = function(){
	var headerTop = this.getHeaderOffsetTop();
	var headerHeight = this.getHeaderHeight(); 
	var offsetTop = 0;
	
	if(!this.isHeaderFixed()){
		offsetTop = document.body.scrollTop || document.documentElement.scrollTop;
	}
	
	offsetTop = -offsetTop + headerHeight;
	this.dropMenus.css("top",offsetTop);
}


var dropMenuManager = new MenuManager();
dropMenuManager.init();
