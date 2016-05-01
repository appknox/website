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
	;
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
	//this.interval = setInterval(repeatAnim,8000);
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

/*********************************************************************************
* COmpany Page Sub menu Activation
**********************************************************************************/
function activateCompanySubmenu(directCall){
	 var companyPage = $("#company-page");
	 var doc = $(document);

	 if(companyPage.length > 0 && doc.width() > 760){
		 $("#company-dropdown").addClass("block");
	 }else if( doc.width() > 760){
		 if(!directCall){
		    var menu =   $("#company-menu");
				$("#company-dropdown").addClass("block");
			}
	 }else if(companyPage.length === 0){
		  $("#company-dropdown").removeClass("block");
	 }
}

function hideCompanySubMenu(ev){
		var target = ev.currentTarget;
		var companyPage = $("#company-page");

		if(target.id !== "company-menu" && companyPage.length == 0){
			$("#company-dropdown").removeClass("block");
		}
}

function hideCompanySubMenuOnDepart(ev){
	var mouseY = ev.clientY;
	try{
		var subMenuTop = $("#company-dropdown").css("top");
		var subMenuHeight = $("#company-dropdown").outerHeight();
		var downEnd = parseInt(subMenuTop) + subMenuHeight;
		var companyPage = $("#company-page");

		if(companyPage.length == 0 && mouseY >= (downEnd + 100)){
			$("#company-dropdown").removeClass("block");
		}
 }catch(e){console.log(e.message)}
}

////////////////////////////////////////////////////////
//Method to prevent navigation of company-link in mobile menu
function companyLinkClickAction(){
	$("#company-link").click(function(ev){
		var doc = $(document);
		if(doc.width()<760){
			ev.preventDefault;
		}else{
			document.location = ev.currentTarget.href;
		}
	})
}

$(document).ready(function(){
	activateCompanySubmenu(true);
	companyLinkClickAction();

	$("#company-menu").bind("mouseover",function(){
			activateCompanySubmenu();
	});

  $(document).mousemove(hideCompanySubMenuOnDepart);
	$("#ak-menu>li").mouseover(hideCompanySubMenu);
});

$(window).resize(function(){
	activateCompanySubmenu();
});

/*************************************************************************************************
Hash Menu To inline page block scrol animation
*************************************************************************************************/
function HashMenuManager()
{
	this.currentHash = "";
	this.scrollSpeed = 20;
	this.nextHash = "";
	this.innerPageOffset = [''];

	this.privateCapsule = (function($){

		//private variables
		var currentHashMenu = null;
		var currentPageOffset = {};
		var finalPageOffset = {};
		var nextPageEleId = null;
		var scrollSteps = 0; //for negative exponential easing
		var intervalId = null; //reference to intervaled function, used to clearInterval
		var scrollLength  = 0; //magnitude of difference between current page/ele offset and next pageEle offset
		///////////////////////////////////////////////
		//private function to scroll page on menu click
		var scrollMenuPage = function(ev){
			var stepTime = 50;
			var scrollSpeed = 20;
			var currentScrollTop = document.documentElement.scrollTop ||  document.body.scrollTop;
			var hash = ev.target.href.substring(ev.target.href.lastIndexOf("#"));

			if($(hash).length === 0 || hash == nextPageEleId){
				return;
			}else{
				ev.preventDefault();
			}

			scrollSteps = 0; //for negative exponential easing Ae^-x
			nextPageEleId = hash;
			currentPageOffset.top = currentScrollTop;
			//console.log("Hah Id : "+ hash);

			//clearInterval  to prevent previous on going scroll
			clearInterval(intervalId);

			finalPageOffset = $(nextPageEleId).offset();
			scrollLength = Math.abs(currentScrollTop - finalPageOffset.top);

			intervalId = setInterval(animateScroll,scrollSpeed);

		}


		///////////////////////////////////////////////////////
		//Funtion to scroll the page with animation
		var animateScroll = function(){

			scrollSteps = scrollSteps + 0.1;
			//direction of scroll negative upward else downward
			var direction = ((document.documentElement.scrollTop ||  document.body.scrollTop) - finalPageOffset.top) > 0 ? -1 : 1;
			var scrollStep = currentPageOffset.top + (direction * (scrollLength + 10)*( 1 - Math.exp(-scrollSteps))) ; //easeout exponential function  , +10 as theoritically (1-exp(-x))  reaches 1 at infinte time

			if( scrollStep >= finalPageOffset.top && direction == 1) //reached at destination scrollTop
			{
				//document.documentElement.scrollTop =  document.body.scrollTop = finalPageOffset.top;
				clearInterval(intervalId);
				updateHash();
				return;
			}
			else if( scrollStep <= finalPageOffset.top && direction == -1) //reached at destination scrollTop
			{
				//document.documentElement.scrollTop =  document.body.scrollTop = finalPageOffset.top;
				clearInterval(intervalId);
				updateHash();
				return;
			}

			document.body.scrollTop =  document.documentElement.scrollTop = scrollStep;
			//console.log(document.documentElement.scrollTop + " : " + document.body.scrollTop)
		}


		//////////////////////////////////////////////////////////
		//Function to update hash at url bar
		var updateHash = function()
		{
			document.location.hash  = nextPageEleId;
			nextPageEleId = null; //reseting as it has been scrolled into view
		}

		//Funtion to register function onclick of main menu
		var registerMenuClick = function()
		{
			$(".hashMenu").unbind("click",scrollMenuPage).bind("click",scrollMenuPage);
			//console.log($(".hashMainMenu"));
		}

		return {
			registerMenuScroll : registerMenuClick,
		}
	}(jQuery));
}

HashMenuManager.prototype.initializer = function()
{
	var _that = this;
	$(document).ready(function(){
		_that.listenStart();
		_that.currentMenuHighlighter();
		_that.gatherOffsetData({data:{_that:_that}});
		$(window).on('hashchange', _that.currentMenuHighlighter);
		$(window).on('resize',{_that:_that}, _that.gatherOffsetData);
		$(document).on("scroll",{_that:_that},_that.currentMenuOnScroll);
	})

}

HashMenuManager.prototype.listenStart = function()
{
	var _this = this;
	this.privateCapsule.registerMenuScroll();

}

HashMenuManager.prototype.currentMenuHighlighter = function(){
	  var hash = window.location.hash;
		if(hash === ""){return;}

		$(".current-menu").removeClass("current-menu");
		$(hash+"-butn").addClass("current-menu");
}

//@Description : Changes the current menu highlighter on manual scroll of the page
HashMenuManager.prototype.currentMenuOnScroll = function(ev)
{
	var _this = ev.data._that, temp;
	var length = _this.innerPageOffset.length;

	var bodyScroll = document.body.scrollTop || document.documentElement.scrollTop;
	for(var i=0;i<length;i++)
	{
		temp = _this.innerPageOffset[i];

		//console.log(bodyScroll + " : " + temp.top + " : " + temp.bottom);
		if(bodyScroll >= temp.top && bodyScroll  <= temp.bottom )
		{
			currentActiveMenu = $(".current-menu").attr("id");
			if( currentActiveMenu != temp.id)
			{ //console.log("inside : " + temp.id);
				$(".current-menu").removeClass("current-menu");
				$("#"+temp.id).addClass("current-menu");
			}
		}
	}
}

//@Description : Gathers the offset of inner page of the main menu
HashMenuManager.prototype.gatherOffsetData = function(ev)
{
	var _this = ev.data._that;
	var id = null,top = null,bottom = null,menuId=null;
	var headerHeight = $("#main-header").height();
	var menuRefer = $(".topMenu");
	var menuLength = menuRefer.length;
	for(var i = 0; i < menuLength;i++)
	{
		id =  menuRefer.eq(i).attr("href");
		id = id.substring(id.lastIndexOf("#"));
		top = $(id).offset().top - headerHeight;
		bottom = top + $(id).outerHeight();
		menuId = menuRefer.eq(i).parent().attr("id");
		_this.innerPageOffset[i] = {top :  top, bottom : bottom, id : menuId}
	}
}


var hashMenuController = new HashMenuManager();
hashMenuController.initializer();


/***********************************************************
* Pricing Zone
***********************************************************/
function PricingManager(){
	//Data Attributes
	this.annualFactor = null;
	this.platforms  = [];
	this.appCountSubscribers = [];

	//Element(s) references
	this.minusOne = null;
	this.plusOne = null;
	this.inputBox = null;

	//Others
	this.platformHeadTimeout = null;

	//Ids and Classes
	this.annualFactorId =  "annualPricingFactor";
	this.platformsClass = "platforms";

}

PricingManager.prototype.init = function(){
  var _this = this;

	$(document).ready(function(){
		_this.gatherInitData();
		_this.resizeMiddleBox();
		_this.faqControl();
		_this.bindPlusOneClick();
		_this.bindMinusOneClick();
		_this.bindPlatformClick();

	})
}

PricingManager.prototype.gatherInitData = function(){
	var _this = this;

	this.annualFactor = $("#" + _this.annualFactorId).attr("data-attr-anf");
	this.inputBox = $("#noOfAppsInput");
	this.plusOne = $("#appPlus");
	this.minusOne = $("#appMinus");
	this.minAppCount = this.inputBox.attr("data-min");
	this.maxAppCount = this.inputBox.attr("data-max");
	this.gatherPlatformsData();
  this.activateQuantityGroup(_this);
	//subscribe app count Changes
  this.subscribeAppCount(_this.activateQuantityGroup);
	this.subscribeAppCount(_this.resetPlatformsOnInvalid);
}

PricingManager.prototype.gatherPlatformsData = function(){

}

PricingManager.prototype.bindPlusOneClick = function(){
	var _this = this;
	_this.plusOne.unbind("click",_this.onPlusOneClick).bind("click",{that: _this},_this.onPlusOneClick);
}

PricingManager.prototype.bindMinusOneClick = function(){
	var _this = this;
	_this.minusOne.unbind("click",_this.onMinusOneClick).bind("click",{that: _this},_this.onMinusOneClick);
}

PricingManager.prototype.onMinusOneClick = function(ev){
	var _this = ev.data.that;
	var noOfApp = parseInt(_this.inputBox.html());

	if(noOfApp > _this.minAppCount){
			noOfApp--;
			_this.inputBox.attr("data-value",noOfApp);
			_this.publishAppCountChange();
	}else{

	}

	_this.inputBox.text(noOfApp);
}

PricingManager.prototype.onPlusOneClick = function(ev){
	var _this = ev.data.that;
  var noOfApp = parseInt(_this.inputBox.html());

	if(noOfApp < _this.maxAppCount){
			noOfApp++;
			_this.inputBox.attr("data-value",noOfApp);
			_this.publishAppCountChange();
	}else{

	}

	_this.inputBox.text(noOfApp);
}

PricingManager.prototype.resizeMiddleBox = function(){
	$(document).ready(function(){
		resizeBox();
	});

	$(document).ready(function(){
		resizeBox();
	});

	function resizeBox(){
		var winWidth = $(document).width();
		var middleCol = $("#pricingInterMiddle");
		var boxHeight = $("#pricingZoneBox").height();

    if(winWidth>760 && middleCol.height() < boxHeight){
					middleCol.height(boxHeight);
		}else{
					middleCol.css("height","auto");
		}
	}
}

PricingManager.prototype.faqControl = function(){
	$(".faq-quest-area").click(function(ev){
		var faqEle = $(ev.currentTarget).parent();
		var icon = $(ev.currentTarget).parent().find("i");
		$(".faq-answer").stop().slideUp(400);
		faqEle.find(".faq-answer").slideToggle(400);
		var isClosed = icon.hasClass("fa-caret-right");
		icon.toggleClass("fa-caret-right fa-caret-down");

	});
}

PricingManager.prototype.publishAppCountChange = function(){
	var subscribersLength = this.appCountSubscribers.length;
	var _this = this;
	for(var i = 0; i < subscribersLength; i++){
		this.appCountSubscribers[i](_this);
	}
}

PricingManager.prototype.subscribeAppCount = function(callFunc){
	this.appCountSubscribers.push(callFunc);
}

PricingManager.prototype.activateQuantityGroup = function(_this){
	var appCount = parseInt(_this.inputBox.attr("data-value"));
	var quantizers = $(".quantizer");
	var quantizerTitle = $("#quantityTitleZones>li");
	var priceBox = $(".horz-pricing-box")

	for(var i = 0; i < quantizers.length; i++){
		var quantizer = $(quantizers[i]);

		var range = quantizer.attr("data-range").split("-");
		if(appCount >= parseInt(range[0]) && appCount <= parseInt(range[1])){
			$(".quantizer").removeClass("active");
			quantizer.addClass("active");

			quantizerTitle.removeClass("active");
			$(quantizerTitle[i]).addClass("active");

			priceBox.removeClass("active-pricing");
			$(priceBox[i]).addClass("active-pricing");
		}
	}
}

PricingManager.prototype.bindPlatformClick = function(){
	var _this = this;
	$("."+_this.platformsClass).unbind("click",_this.onPlatformClick).bind("click",{that: _this},_this.onPlatformClick);
}

PricingManager.prototype.onPlatformClick = function(ev){
	var _this = ev.data.that;
	var target = ev.currentTarget;
	var noOfApps = _this.inputBox.attr("data-value");
	var isActive = $(target).hasClass("active");
	var platfromsActive = $("."+_this.platformsClass+".active");

	if(isActive){
		_this.deactivatePlatform(target);
	}else if(noOfApps > platfromsActive.length){
		_this.activatePlatform(target);
	}else{
		var statistics = "<p class='gray-7 small-font'>Number of App(s): <span class='gray-4'> " + noOfApps +"</span></p><p class='gray-7 small-font'> Number Platform(s): <span class='gray-4'> " + platfromsActive.length + "</span></p>";
		fancyConfirm("<h4 class='text-center'><i class='fa fa-info-circle' aria-hidden='true'></i> Please increase app counts to choose more platform </h4> <div class='horz-split-1x'><span></span></div>" + statistics);
	}
}

PricingManager.prototype.activatePlatform = function(element){
  var ele = $(element);
	ele.addClass("active");
	ele.attr("data-seleceted","yes");
}

PricingManager.prototype.deactivatePlatform = function(element){
  var ele = $(element);
	ele.removeClass("active");
	ele.attr("data-seleceted","no");
}

PricingManager.prototype.resetPlatformsOnInvalid = function(_this){
	var platfromsActive = $("."+_this.platformsClass+".active");
	var heading = $("#platformHead");
  var noOfApps = _this.inputBox.attr("data-value");

	if(noOfApps >= platfromsActive.length){
		return;
	}

	platfromsActive.removeClass("active").attr("data-seleceted","no");

	clearTimeout(_this.platformHeadTimeout);
	heading.addClass("red");
	_this.platformHeadTimeout = setTimeout(removeRed,3000);

	function removeRed(){
		heading.removeClass("red");
	}
}

var pricingManager = new PricingManager();
pricingManager.init();

///////////////////////////////////////////////////////////////////////////////////////
// General pop up/alert with fancybox
function fancyConfirm(msg, options, callback) {
    $.fancybox("#fancyboxAlert", {

        beforeShow: function () {
            this.content.prepend("<p class=\"title\"></p>");
            $("#fancyboxAlert").html(msg);

        }
    });
}
