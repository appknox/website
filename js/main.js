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
	this.slideZoneId = null;
	this.slideZone = null;
}

AkSlideManager.prototype.init = function(akSlideZoneId){
	var _this = this;
	_this.slideZoneId = akSlideZoneId;
	
	
	$(document).ready(function(){
		_this.initiate();
	});
	
	$(window).resize(function(){
		
	});
}

AkSlideManager.prototype.initiate = function(){
	var _this = this;
	
	this.slideZone = $("#"+_this.slideZoneId);
	
	this.slideBlocks = this.slideZone.find(".ak-slide");
	this.noOfSlides = this.slideBlocks.length;
	this.jumperBlock = this.slideZone.find(".ak-jumper-block");
	debugger;
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
	debugger;
	for(var i = 0; i < this.noOfSlides; i++){
		var first = "";
		if(i == 0){first = "ak-jump-active"}
		html = html + "<div class=' " + this.akJumpButtonClass + " " + first + "' id=ak-jumpto-" + (i+1) +" ></div>";
	}
	
	this.jumperBlock.append(html);
	this.jumpers = this.slideZone.find("."+_this.akJumpButtonClass);
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
	this.slideZone.find("."+_this.akJumpButtonClass).unbind("click",_this.onJumperClick).bind("click",{self:_this},_this.onJumperClick);
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
	
	this.slideZone.find(".ak-jump-active").removeClass("ak-jump-active");
	$(_this.jumpers[_this.currentSlide]).addClass("ak-jump-active");
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
	_this.slideZone.prepend(appendMarginDefendLi);
	
}


//For top main slider at home page
var akSlideManager = new AkSlideManager();
akSlideManager.init("ak-slide-zone");

//For testimonials slider
var akSlideManager = new AkSlideManager();
akSlideManager.init("ak-testimony-zone");

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


/************************************************************************
*Canvas drawing to connect scan procedure breifing zone 
************************************************************************/

var connectScanZone = (function($){
	var scanListContainer = $("#scan-process-list");
	var uploadBlock = $("#uploadAppIcon");
	var DASTBlock = $("#DASTZone");
	var SASTIcon = $("#sastIcon");
	var SASTBlock = $("#SASTZone");
	var UBABlock = $("#UBAInnerZone");
	var scanReportBlock = $("#reportZoneTitle");
	var canvas = null;
	var ctx = null;
	
	function calcOffset(ele){
		var blockOffset = scanListContainer.offset();
		var eleOffset = ele.offset();
		
		return {top: eleOffset.top - blockOffset.top , left: eleOffset.left - blockOffset.left }
	}
	
	function createCanvas(){
		canvas = document.createElement("canvas");
		canvas.id = "scanConnectZoneCanvas";
		$("body").append(canvas);
		ctx = canvas.getContext("2d");
		positionCanvas();
	}
	
	function positionCanvas(){
		scanListContainer.css({position:"relative",zIndex:100})
		var containerOffset = scanListContainer.offset();
		var height = scanListContainer.height();
		var width = scanListContainer.width();
		$(canvas).css({position:"absolute",zIndex:99,top:containerOffset.top,left:containerOffset.left});
		canvas.height = height;
		canvas.width = width;
	}
	
	function drawDiagram(){
		var scanReportOffset = calcOffset(scanReportBlock);
		var reportLeft = scanReportOffset.left + scanReportBlock.width()/2;
		var reportTop = scanReportOffset.top;
		var uploadOffset = calcOffset(uploadBlock);
		var width = uploadBlock.width();
		var topDelta = 20;
		
		
		if(canvas == null){
			createCanvas();
		}
		
		ctx.restore();
		positionCanvas();
		
		
		if($(window).width()<480){
			ctx.clearRect(0,0,canvas.width,canvas.height);
			return;
		}
		
		ctx.beginPath();
		ctx.lineWidth = 1;
		ctx.strokeStyle = "#FF4236";
		
		var sastOffset = calcOffset(SASTIcon);
		var deltaY = uploadOffset.top - sastOffset.top - SASTIcon.height()/2;
		
		ctx.beginPath();
		ctx.moveTo(uploadOffset.left + width/2,uploadOffset.top);
		ctx.lineTo(uploadOffset.left + width/2,uploadOffset.top - deltaY );
		ctx.stroke();
		ctx.closePath();

		
		ctx.beginPath();
		
		ctx.moveTo(uploadOffset.left + width/2,uploadOffset.top - deltaY );
		ctx.lineTo(sastOffset.left,uploadOffset.top - deltaY);
		ctx.stroke();
		ctx.closePath();
		traingle = {
			x1:sastOffset.left-10,
			y1:uploadOffset.top - deltaY - 10,
			x2:sastOffset.left-10,
			y2:uploadOffset.top - deltaY + 10,
			x3:sastOffset.left ,
			y3:uploadOffset.top - deltaY,
			fillStyle:"#FF4236"
		} 
		drawTriangle(traingle);
		
		ctx.strokeStyle = "#ccc";
		ctx.beginPath();
		var sastBlockOffset = calcOffset(SASTBlock);
		var sastBottom = sastBlockOffset.top + SASTBlock.height();
		var sastLeft = sastBlockOffset.left + SASTBlock.width()/2;
		ctx.moveTo(sastLeft,sastBottom + topDelta);
		ctx.lineTo(reportLeft-20,reportTop);
		ctx.stroke();
		ctx.closePath();
		
		
		ctx.beginPath();
		var dastBlockOffset = calcOffset(DASTBlock);
		var dastBottom = dastBlockOffset.top + DASTBlock.height();
		var dastLeft = dastBlockOffset.left + DASTBlock.width()/2;
		ctx.moveTo(dastLeft,dastBottom + topDelta);
		var reportLessLeft = reportLeft;
		if(dastBlockOffset.top > sastBlockOffset.top + SASTBlock.height()){
			reportLessLeft = reportLeft - 50;
		}
		ctx.lineTo(reportLessLeft,reportTop);
		ctx.stroke();
		ctx.closePath();
		
		ctx.beginPath();
		var ubaBlockOffset = calcOffset(UBABlock);
		var ubaBottom = ubaBlockOffset.top + UBABlock.height();
		var ubaLeft = ubaBlockOffset.left + UBABlock.width()/2;
		ctx.moveTo(ubaLeft,ubaBottom + topDelta);
		ctx.lineTo(reportLeft+20,reportTop);
		ctx.stroke();
		ctx.closePath();
	}
	
	function drawTriangle(data){
		
		ctx.moveTo(data.x1,data.y1);
		ctx.lineTo(data.x2,data.y2);
		ctx.lineTo(data.x3,data.y3);
		ctx.closePath();
		ctx.fillStyle = data.fillStyle;
		ctx.fill();
	}
	
	function draw(){
		$(document).ready(function(){
			drawDiagram();
		});
		
		$(window).resize(function(){
			drawDiagram();
		});
	}
	
	return {draw : draw}
	
})(jQuery);


connectScanZone.draw();

/**************************************************************************************
/ Radar Zone List Animator
**************************************************************************************/
function ListAnimator(){
	this.animatorBlock = null;
	this.animatorBlockId = null;
	this.currentListNum = 0;
	this.animationLists = null;
	this.animationListsCount = 0;
	this.animateItemClass = "ak-vert-animate-ele";
	this.persistanceTime = null;
}

ListAnimator.prototype.init = function(initData){
	var _this = this;
	this.animatorBlockId = initData.blockId;
	this.persistanceTime = initData.time;
	
	$(document).ready(function(){
		_this.startAnimation();
	});	
	
}

ListAnimator.prototype.startAnimation = function(){
	var _this = this;
	this.animatorBlock = $("#"+_this.animatorBlockId);
	debugger;
	this.animationLists = this.animatorBlock.find("."+_this.animateItemClass); 
	this.animationListsCount = this.animationLists.length;
	
	if(this.animationListsCount > 0){
		$(_this.animationLists[0]).css("display","inline");
	}
	
	_this.bindInterval();
}

ListAnimator.prototype.play = function(){
	var _this = this;
	
	var currentEle = this.animationLists[this.currentListNum];
	$(currentEle).stop().fadeOut(_this.persistanceTime,appear);
	
	function appear(){
		if(_this.currentListNum >=  _this.animationListsCount-1){
			_this.currentListNum = 0;
		}else{
			_this.currentListNum++;
		}
		
		_this.animationLists.css({display:"none"});
		var nextEle = _this.animationLists[_this.currentListNum];
		$(nextEle).stop().fadeIn(_this.persistanceTime);
	}
}

ListAnimator.prototype.createIntervalAnim = function(){
	this.play();
}

ListAnimator.prototype.bindInterval = function(){
	var repeatAnim = this.binder(this.createIntervalAnim);
	this.interval = setInterval(repeatAnim,3000);
}

ListAnimator.prototype.binder = function(Method){
	var _this = this;
 
    return(
		function(){
           return( Method.apply(_this, arguments));
		}
	);
}

var listAnimatorRadar = new ListAnimator();
listAnimatorRadar.init({blockId:"radar-list-block",time:500});

