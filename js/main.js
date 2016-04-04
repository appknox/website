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

/*******************************************************************************
SLide Manager
*******************************************************************************/
function AkSlideManager(){
	this.noOfSlides = 0;
	this.slideBlocks = null;  // jQuery Reference
	this.jumperBlock = null;  // jQueryReferenece
	this.jumpers = null;
	this.currentSlide = 0;
	this.akJumpButtonClass = "ak-slide-jump-butn";
	this.autoAnimate = false;
	this.eleAnimateClass = "ak-ele-animate";
	this.hideDeltaTime = 500;
	this.appearDeltaTime = 50;
	this.slideZoneId = "ak-slide-zone";
}

AkSlideManager.prototype.init = function(){
	var _this = this;
	
	$(document).ready(function(){
		_this.initiate();
	});
	
	$(window).resize(function(){
		
	});
}

AkSlideManager.prototype.initiate = function(){
	this.slideBlocks = $(".ak-slide");
	this.noOfSlides = this.slideBlocks.length;
	this.jumperBlock = $("#ak-jumper-block");
	
	this.addSupportElements();
	this.createJumpers();
	this.initSlidePosition();
	this.callAnimationLoop();
}

AkSlideManager.prototype.initSlidePosition = function(){
	var _this = this;
	this.slideBlocks.css("display","none");
	$(this.slideBlocks[0]).css("display","block");
	
	var currentSlideBlock = this.slideBlocks[_this.currentSlide];
	var elesToAnimate = $(currentSlideBlock).find("." + this.eleAnimateClass);
	
	for(var i=0; i < elesToAnimate.length; i++){
		var animator = new AkElementAnimator(elesToAnimate[i]);
		animator.setInitialState();
		animator.appearanceAnimate();
	}
}

//Create the jump navigation for the slide
AkSlideManager.prototype.createJumpers = function(){
	var _this = this;
	var html = "";

	for(var i = 0; i < this.noOfSlides; i++){
		html = html + "<div class=' " + this.akJumpButtonClass + "' id=ak-jumpto-" + (i+1) +" ><div class='ak-slide-jump-circle'></div></div>";
	}
	
	this.jumperBlock.append(html);
	this.jumpers = $("."+_this.akJumpButtonClass);
	this.jumpers.mouseover(function(){
		$(this).find(".ak-slide-jump-circle").addClass("ak-hovered-jumper");
	});
	
	this.jumpers.mouseout(function(){
		$(this).find(".ak-slide-jump-circle").removeClass("ak-hovered-jumper");
	});
	
	this.bindJumperClick();
}

AkSlideManager.prototype.bindJumperClick = function(){
	var _this = this;
	$("."+_this.akJumpButtonClass).unbind("click",_this.onJumperClick).bind("click",{self:_this},_this.onJumperClick);
}

AkSlideManager.prototype.onJumperClick = function(ev){
	var _this = ev.data.self;
	var target = ev.currentTarget;
	var slideNum = null;
	var id = $(target).attr("id");
	
	slideNum = id.split("ak-jumpto-")[1];
	clearInterval(_this.interval);
	_this.interval = null;
	_this.hideSlide(slideNum-1);
}


AkSlideManager.prototype.jumperActivate = function(){
	var _this = this;
	
	$(".ak-jump-active").removeClass("ak-jump-active");
	$(_this.jumpers[_this.currentSlide]).find(".ak-slide-jump-circle").addClass("ak-jump-active");
}


AkSlideManager.prototype.bringSlide = function(){
	var _this = this;
	var currentSlideBlock = this.slideBlocks[_this.currentSlide];
	var elesToAnimate = $(currentSlideBlock).find("." + this.eleAnimateClass);
	
	$(currentSlideBlock).fadeIn(_this.appearDeltaTime);
	
	for(var i=0; i < elesToAnimate.length; i++){
		var animator = new AkElementAnimator(elesToAnimate[i]);
		animator.setInitialState();
		animator.appearanceAnimate();
	}
	
	if(_this.interval == null){
		_this.callAnimationLoop();
	}
}

AkSlideManager.prototype.hideSlide = function(nextSlideNum){
	var _this  = this;
	var currentSlideBlock = this.slideBlocks[this.currentSlide];
	var elesToAnimate = $(currentSlideBlock).find("." + this.eleAnimateClass);
	var timeToHide = 0;
	
	for(var i=0; i < elesToAnimate.length; i++){
		var animator = new AkElementAnimator(elesToAnimate[i]);
		animator.perishAnimate();
		timeToHide = animator.animTime > timeToHide ? animator.animTime : timeToHide;
	}
	
	if(nextSlideNum && parseInt(nextSlideNum) != NaN ){
		_this.currentSlide = nextSlideNum;
	}
	else{
		_this.currentSlide = _this.currentSlide == (_this.noOfSlides - 1) ? 0 : _this.currentSlide + 1;
	}
	
	_this.jumperActivate();
	$(currentSlideBlock).fadeOut(timeToHide + _this.hideDeltaTime,function(){_this.bringSlide()});
}

AkSlideManager.prototype.createIntervalAnim = function(){
	this.hideSlide();
}

AkSlideManager.prototype.binder = function(Method){
	var _this = this;
 
    return(
		function(){
           return( Method.apply( _this, arguments ) );
		}
	);
}

AkSlideManager.prototype.callAnimationLoop = function()
{
	var repeatAnim = this.binder(this.createIntervalAnim);
	this.interval = setInterval(repeatAnim,8000);
}

AkSlideManager.prototype.addSupportElements = function(){
	var _this = this;
	var appendMarginDefendLi = "<li style='height:1px'></li>";
	$("#"+_this.slideZoneId).prepend(appendMarginDefendLi);
	
}

var akSlideManager = new AkSlideManager();
akSlideManager.init();

/***********************************************************************************
* Appknox Element Animator
***********************************************************************************/
function AkElementAnimator(element){
	this.eleToAnimate = element;
	this.initialCss = null;
	this.appearanceCss = null;
	this.perishCss = null;
	this.animTime = null;
	this.defaultAnimTime = 500;
	this.createAnimator(element);
}

AkElementAnimator.prototype.createAnimator = function(element){
	this.initialCss = JSON.parse($(element).attr("data-init-css"));
	this.appearanceCss = JSON.parse($(element).attr("data-appear-css"));
	this.perishCss = JSON.parse($(element).attr("data-perish-css"));
	this.animTime = parseInt($(element).attr("data-ak-anim-time"));
	this.animDelay = parseInt($(element).attr("data-ak-anim-delay"));
	
	if(this.animTime === NaN){
		this.animTime = this.defaultAnimTime;
	}
	
	if(this.animDelay === NaN){
		this.animTime = 0;
	}
}

AkElementAnimator.prototype.setInitialState = function(){
	var _this = this;
	$(_this.eleToAnimate).stop().css(_this.initialCss);
}

AkElementAnimator.prototype.appearanceAnimate = function(){
	var _this = this;
	var animTime = _this.animTime;
	
	if(_this.animDelay != 0){
		setTimeout(function(){$(_this.eleToAnimate).stop().animate(_this.appearanceCss,animTime,function(){})},_this.animDelay);
	}else{
		$(_this.eleToAnimate).stop().animate(_this.appearanceCss,animTime,function(){});
	}
	
}

AkElementAnimator.prototype.perishAnimate = function(){
	var _this = this;
	var animTime = _this.animTime;
	$(_this.eleToAnimate).stop().animate(_this.perishCss,animTime,function(){});
}
