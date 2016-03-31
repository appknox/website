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
	
	this.createJumpers();
	this.initSlidePosition();
	this.callAnimationLoop();
	
}

AkSlideManager.prototype.positionSlideChilds = function(){
	
}

AkSlideManager.prototype.initSlidePosition = function(){
	this.slideBlocks.css("display","none");
	$(this.slideBlocks[0]).css("display","block");
}

//Create the jump navigation for the slide
AkSlideManager.prototype.createJumpers = function(){
	var html = "";
	debugger;
	for(var i = 0; i < this.noOfSlides; i++){
		html = html + "<div class=' " + this.akJumpButtonClass + "' id=ak-jumpto-" + (i+1) +" ><div class='ak-slide-jump-circle'></div></div>";
	}
	
	this.jumperBlock.append(html);
}

AkSlideManager.prototype.bindJumperClick = function(){
	var _this = this;
	$(_this.akJumpButtonClass).unbind("click").bind({self:_this},_this.onJumperClick);
}

AkSlideManager.prototype.onJumperClick = function(ev){
	var _this = ev.data.self;
	
}

AkSlideManager.prototype.bringSlide = function(){
	var _this = this;
	var currentSlideBlock = this.slideBlocks[_this.currentSlide];
	
	$(currentSlideBlock).fadeIn(_this.appearDeltaTime);
	
	var elesToAnimate = $(currentSlideBlock).find("." + this.eleAnimateClass);
	
	for(var i=0; i < elesToAnimate.length; i++){
		var animator = new AkElementAnimator(elesToAnimate[i]);
		animator.setInitialState();
		animator.appearanceAnimate();
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
	this.interval = setInterval(repeatAnim,4000);
}

//Test Zone
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
	
	if(this.animTime === NaN){
		this.animTime = this.defaultAnimTime;
		
	}
}

AkElementAnimator.prototype.setInitialState = function(){
	var _this = this;
	$(_this.eleToAnimate).css(_this.initialCss);
	
}

AkElementAnimator.prototype.appearanceAnimate = function(){
	var _this = this;
	$(_this.eleToAnimate).animate(_this.appearanceCss);
}

AkElementAnimator.prototype.perishAnimate = function(){
	var _this = this;
	$(_this.eleToAnimate).animate(_this.perishCss,_this.animTime,function(){});
}


