/////////////////////////////////////////////////////////////////
//Globally declaring $ as reference to jQuery as required in WP
var $ = jQuery
var HAWKINS_ENDURL = "https://hawkins.appknox.com/api/send/";
var SUBMIT_SUCCESS_MSG = "<i class='fa fa-check' aria-hidden='true'></i> Thank you! We will get in touch shortly";
var SUBMIT_ERROR_MSG = "<i class='fa fa-check-square' aria-hidden='true'></i> Sorry! Form submission failed";
var SUBMITTED_NO = "no";
var FORM_SUBMITTED_YES = "yes";
var FORM_SUBMITTING = "processing";

////////////////////////////////////////////////////////////////
//Commonly used functions

function getProcessingHtml(msg){
	msg = msg || "Processing";
	var html = '<span class="gray-6 green"><i class="fa fa-circle-o-notch fa-spin" aria-hidden="true"></i> ' + msg + "</span>";
	return html;
}

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
	this.hideDeltaTime = 0;
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
	this.addSupportElements();
	this.createJumpers();
	this.initSlidePosition();
	this.callAnimationLoop();
	this.bindSwipe();
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

AkSlideManager.prototype.bindSwipe = function(){
	var _this = this;

	_this.slideZone.unbind("swipeleft",_this.onSwipeLeft).bind("swipeleft",{that: _this},_this.onSwipeLeft);
	_this.slideZone.unbind("swiperight",_this.onSwipeRight).bind("swiperight",{that: _this},_this.onSwipeRight);
}

AkSlideManager.prototype.onSwipeLeft = function(ev){
	var _this = ev.data.that;
  var slideNumToBring = 0;

	if(_this.currentSlide == _this.noOfSlides - 1){
		slideNumToBring = 0;
	}else{
		slideNumToBring = _this.currentSlide + 1;
	}

	_this.hideSlide(slideNumToBring);
}

AkSlideManager.prototype.onSwipeRight = function(ev){
	var _this = ev.data.that;
	var slideNumToBring = 0;

	if(_this.currentSlide == 0){
		slideNumToBring = _this.noOfSlides - 1;
	}else{
		slideNumToBring = _this.currentSlide - 1;
	}

	_this.hideSlide(slideNumToBring);
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

	if(nextSlideNum != undefined ){
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
	this.interval = setInterval(repeatAnim,5000);
}

AkSlideManager.prototype.addSupportElements = function(){
	var _this = this;
	var appendMarginDefendLi = "<li style='height:1px'></li>";
	_this.slideZone.prepend(appendMarginDefendLi);
}

AkSlideManager.prototype.adjustSlideContainerHeight = function(){
	 var clonedSlideZone = _this.slideZone.clone();
	 var newRandomId = "clonedSlideZone" + Math.floor(Math.random()*1000);
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
	 }
	 else if(companyPage.length > 0 && doc.width() < 760){
		 $("#company-dropdown").removeClass("block");
	 }
	 else if( doc.width() > 760){
		 if(!directCall){
		    var menu =   $("#company-menu");
				$("#company-dropdown").addClass("block");
			}
	 }else if(companyPage.length === 0 && doc.width() > 760){
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
	var doc = $(document);

	if(doc.width()<760){
		$("#company-dropdown").removeClass("block");
		return; //to prevent non clickable menu links in iOS
	}

	try{
		var mouseY = ev.clientY;
		var subMenuTop = $("#company-dropdown").css("top");
		var subMenuHeight = $("#company-dropdown").outerHeight();
		var downEnd = parseInt(subMenuTop) + subMenuHeight;
		var companyPage = $("#company-page");

		if(companyPage.length == 0 && mouseY >= (downEnd + 100)){
			$("#company-dropdown").removeClass("block");
		}
 }catch(e){}
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

/*********************************************************************************
* Resource Page Sub menu Activation
**********************************************************************************/
function activateResourceSubmenu(directCall){
	 var resourcePage = $("#resource-page");
	 var doc = $(document);

	 if(resourcePage.length > 0 && doc.width() > 760){
		 $("#resource-dropdown").addClass("block");
	 }
	 else if(resourcePage.length > 0 && doc.width() < 760){
 		 $("#resource-dropdown").removeClass("block");
		 $("#resource-dropdown").css("display","");
 	 }else if( doc.width() > 760){
		 if(!directCall){
		    var menu =   $("#resource-menu");
				$("#resource-dropdown").addClass("block");
			}
	 }else if(resourcePage.length === 0 && doc.width() > 760){
		  $("#resource-dropdown").removeClass("block");
	 }
}

function hideResourceSubMenu(ev){
		var target = ev.currentTarget;
		var resourcePage = $("#resource-page");

		if(target.id !== "resource-menu" && resourcePage.length == 0){
			$("#resource-dropdown").removeClass("block");
		}
}

function hideResourceSubMenuOnDepart(ev){
	var doc = $(document);

	if(doc.width()<760){
		$("#company-dropdown").removeClass("block");
		return; //to prevent non clickable menu links in iOS
	}

	try{
		var mouseY = ev.clientY;
		var subMenuTop = $("#resource-dropdown").css("top");
		var subMenuHeight = $("#resource-dropdown").outerHeight();
		var downEnd = parseInt(subMenuTop) + subMenuHeight;
		var companyPage = $("#resource-page");

		if(companyPage.length == 0 && mouseY >= (downEnd + 100)){
			$("#resource-dropdown").removeClass("block");
		}
 }catch(e){console.log(e.message)}
}

////////////////////////////////////////////////////////
//Method to prevent navigation of resource-link in mobile menu
function resourceLinkClickAction(){
	$("#resource-link").click(function(ev){
		var doc = $(document);
		if(doc.width()<760){
			ev.preventDefault;
		}else{
			document.location = ev.currentTarget.href;
		}
	})
}

$(document).ready(function(){
	activateResourceSubmenu(true);
	resourceLinkClickAction();

	$("#resource-menu").bind("mouseover",function(){
			activateResourceSubmenu();
	});

  $(document).mousemove(hideResourceSubMenuOnDepart);
	$("#ak-menu>li").mouseover(hideResourceSubMenu);
});

$(window).resize(function(){
	activateResourceSubmenu();
});


/*************************************************************************************************
Resource Sub Menu To show specific reources
*************************************************************************************************/
function ResourceManager(){
	this.resourceType = null;
	this.subMenuSelector = ".resource-sublinks a";
	this.deltaToShow = 60;
}

ResourceManager.prototype.init = function(){
	var _this = this;

	$(document).ready(function(){
		var resourceZone =  $("#resources-zone");

		if(resourceZone.length == 0){
			return; //not resource page
		}

		_this.setResourceType();
		_this.showResourceType(true);
		_this.bindSubMenuClick();
		_this.bindScroll();
	});
}

ResourceManager.prototype.setResourceType = function(){
	this.resourceType = document.location.hash == "" ? "resource" : document.location.hash.substring(1).toLowerCase();
}

ResourceManager.prototype.showResourceType = function(directCall){
	var _this = this;
  var resourceClass =  _this.resourceType === "resource" || _this.resourceType === "all" ? "resource" : "res-"+_this.resourceType;
	var resources = $("." + resourceClass);

	var resBlock = $(".resource-block-zone");
	resBlock.height(resBlock.height());

	$(".resource").stop().fadeOut(300,function(){
		setTimeout(function(){
			$(".resource-block-zone").css("height","auto");
			$("." + resourceClass).stop().fadeIn(300);
			if(!directCall){
				_this.autoScroll();
			}
		},400);
	})

	_this.activateSubMenu();
}

ResourceManager.prototype.bindSubMenuClick = function(){
  var _this = this;
	$(_this.subMenuSelector).unbind("click",_this.onSubMenuClick).bind("click",{that:_this},_this.onSubMenuClick);
}

ResourceManager.prototype.onSubMenuClick = function(ev){
  var _this = ev.data.that;
	var target = ev.currentTarget;
	_this.resourceType = $(target).attr("data-id");

	var resourceClass =  _this.resourceType === "all" ? "resource" : "res-"+_this.resourceType;
	_this.showResourceType();
}

ResourceManager.prototype.autoScroll = function(){
	var resourceZone =  $("#resources-zone");
	var paddingTop = resourceZone.css("padding-top");
	var offsetTop = resourceZone.offset().top;
	var scrollSteps = 0;
	var intervalId = null;
	var finalPageOffset = offsetTop - parseInt(paddingTop)/2;
	var currentPageOffsetTop = document.documentElement.scrollTop ||  document.body.scrollTop;
	var scrollLength = Math.abs(currentPageOffsetTop - finalPageOffset);


	clearInterval(intervalId);
	intervalId = setInterval(animateScroll,30);

	function animateScroll(){
		//debugger;
		scrollSteps = scrollSteps + 0.1;
		//direction of scroll negative upward else downward
		var direction = ((document.documentElement.scrollTop ||  document.body.scrollTop) - finalPageOffset) > 0 ? -1 : 1;
		var scrollStep = currentPageOffsetTop + (direction * (scrollLength + 10)*( 1 - Math.exp(-scrollSteps))) ; //easeout exponential function  , +10 as theoritically (1-exp(-x))  reaches 1 at infinte time

		if( scrollStep >= finalPageOffset && direction == 1) //reached at destination scrollTop
		{
			//document.documentElement.scrollTop =  document.body.scrollTop = finalPageOffset.top;
			clearInterval(intervalId);
			return;
		}
		else if( scrollStep <= finalPageOffset && direction == -1) //reached at destination scrollTop
		{
			//document.documentElement.scrollTop =  document.body.scrollTop = finalPageOffset.top;
			clearInterval(intervalId);
			return;
		}

		document.body.scrollTop =  document.documentElement.scrollTop = scrollStep;
		//console.log(document.documentElement.scrollTop + " : " + document.body.scrollTop)
	}

}

ResourceManager.prototype.bindScroll = function(){
  var _this = this;
	$(window).unbind("scroll",_this.onWindowScroll).bind("scroll",{that:_this},_this.onWindowScroll);
}

ResourceManager.prototype.onWindowScroll = function(ev){
	var _this  = ev.data.that;
	var resourceContainer = $(".resource-block-zone");
	var offsetTop = resourceContainer.offset().top;
	var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;

	if(scrollTop > offsetTop + _this.deltaToShow){
		$("#resource-dropdown").fadeIn(300,function(){$(this).addClass("block")});
	}
	else{
		$("#resource-dropdown").fadeOut(300,function(){$(this).removeClass("block")});
	}

}

ResourceManager.prototype.activateSubMenu = function(){
	var _this = this;
	var resType = _this.resourceType === "resource" ? "all" : _this.resourceType;
	var subMenu = $(_this.subMenuSelector);

	subMenu.removeClass("active");
	$("#res-" + resType+",#res-in-"+resType).addClass("active");
}


var resourceManager = new ResourceManager();
resourceManager.init();

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
	this.noOfApps = 1;

	//Element(s) references
	this.minusOne = null;
	this.plusOne = null;
	this.inputBox = null;

	//Others
	this.platformHeadTimeout = null;

	//Ids and Classes
	this.annualFactorId =  "annualPricingFactor";
	this.platformsClass = "platforms";

	//pricing rate
	this.basePrice = 0;
	this.annualFactor = 0;
	this.deltaPriceMinus = 0;
	this.discountPercent = 0;

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
		_this.adjustPricePlan();
		_this.resgisterPlaceOrderClick();
		_this.resgisterSubmitOrderClick();

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
	this.basePrice = this.inputBox.attr("data-base-price");
	this.annualFactor = this.inputBox.attr("data-annual-factor");
	this.deltaPriceMinus = this.inputBox.attr("data-delta-minus");;
  this.activateQuantityGroup(_this);
	//subscribe app count Changes
  this.subscribeAppCount(_this.activateQuantityGroup);
	this.subscribeAppCount(_this.resetPlatformsOnInvalid);
	this.subscribeAppCount(_this.adjustPricePlan);
	this.subscribeAppCount(_this.setNumAppFormInput);
}

PricingManager.prototype.setNumAppFormInput = function(_this){
	_this = _this || this;
	$("#app-count-input").val(_this.noOfApps);
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
			_this.noOfApps = noOfApp;
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
			_this.noOfApps = noOfApp;
			_this.publishAppCountChange();
	}else{

	}

	_this.inputBox.text(noOfApp);
}

PricingManager.prototype.setDiscount = function(){
	this.discountPercent = this.noOfApps == 1 ? 0 :( this.noOfApps <= 4 ? 10 : 20);
}

PricingManager.prototype.resizeMiddleBox = function(){
	$(document).ready(function(){
		resizeBox();
	});

	$(window).resize(function(){
		resizeBox();
	});

	function resizeBox(){
		var winWidth = $(document).width();
		var middleCol = $("#pricingInterMiddle");
		var boxHeight = $("#pricingZoneBox").height();

    if(winWidth > 760 && middleCol.height() <= boxHeight){
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
		var displayCurEle = faqEle.css("display");
		$(".faq-answer").each(function(){
			if($(this).parent()[0] !== faqEle[0]){
				$(this).stop().slideUp(400);
				if($(this).parent().find("i").hasClass("fa-caret-down")){
						$(this).parent().find("i").toggleClass("fa-caret-right fa-caret-down");
				}
			}
		});

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
	var priceBox = $(".horz-pricing-box");

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
	ele.find(".os-input").val("1");
}

PricingManager.prototype.deactivatePlatform = function(element){
  var ele = $(element);
	ele.removeClass("active");
	ele.attr("data-seleceted","no");
	ele.find(".os-input").val("0");
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

PricingManager.prototype.adjustPricePlan = function(_this){
	var _this = _this || this;
	_this.setDiscount();
	_this.adjustStartPlan();
	_this.adjustGrowPlan();
	_this.adjustSucceedPlan();
	_this.adjustFinalPrice();
}

PricingManager.prototype.adjustStartPlan = function(basePrice){
  var _this = this;
	var monthlyZone = $("#startPriceMonth");
	var annualZone = $("#startPriceAnnual");
	var monthlyPrice = _this.basePrice - _this.deltaPriceMinus;
	var annualPrice = (_this.basePrice - _this.deltaPriceMinus)* _this.annualFactor;
	monthlyZone.html("$" + monthlyPrice);
	annualZone.html("$" + annualPrice);
}

PricingManager.prototype.adjustGrowPlan = function(){
	var _this = this;
	var monthlyZone = $("#growPriceMonth");
	var annualZone = $("#growPriceAnnual");
	var monthlyPrice = (_this.basePrice - (_this.basePrice * 0.1)) - _this.deltaPriceMinus;
	var annualPrice = monthlyPrice * _this.annualFactor;
	monthlyZone.html("$" + monthlyPrice);
	annualZone.html("$" + annualPrice);
}

PricingManager.prototype.adjustSucceedPlan = function(){
	var _this = this;
	var monthlyZone = $("#succeedPriceMonth");
	var annualZone = $("#succeedPriceAnnual");
	var monthlyPrice = (_this.basePrice - (_this.basePrice * 0.2)) - _this.deltaPriceMinus;
	var annualPrice = monthlyPrice * _this.annualFactor;
	monthlyZone.html("$" + monthlyPrice);
	annualZone.html("$" + annualPrice);
}

PricingManager.prototype.adjustFinalPrice = function(){
	var _this = this;
	var monthlyZone = $("#monthlySumZone");
	var monthlySaveZone = $("#monthlySumSave");
	var annualZone = $("#annualSumZone");
	var annualSumSave = $("#annualSumSave");

	var quantityCost =  _this.noOfApps * (_this.basePrice - (_this.basePrice * _this.discountPercent)/100);
	var monthPrice = quantityCost - (_this.deltaPriceMinus * _this.noOfApps) ;
  var monthSave = (_this.noOfApps * (_this.basePrice - _this.deltaPriceMinus)) - monthPrice;

	var annualPrice = monthPrice * _this.annualFactor;
  var annualSave = monthPrice * 12 - annualPrice;

	monthlyZone.html("$" + monthPrice);
	monthlySaveZone.html("$" + monthSave);

	annualZone.html("$" + annualPrice);
	annualSumSave.html("$" + annualSave);

}

PricingManager.prototype.appendPricingInputs = function(form){
	var dynamicClass = "added-input-dynamically";

	form.find("." + dynamicClass).remove();

	$("#pricingForm input").each(function(){
		var clone = $(this).clone();
		var value = $(this).val();
		clone.val(value);
	  clone.addClass(dynamicClass);
		clone.attr("id","");
		if(clone.length == 1){
			form.append(clone[0]);
		}

	});
}

PricingManager.prototype.resgisterPlaceOrderClick = function(){
	var _this = this;
	$("#placeOrder").unbind("click",_this.onPlaceOrderClick).bind("click",{that:_this},_this.onPlaceOrderClick);
}

PricingManager.prototype.onPlaceOrderClick = function(ev){
  var _this = ev.data.that;

	var formStatus = $("#place-order-form").attr("data-attr-submitted");

	if(formStatus === SUBMITTED_NO){
		$("#placeOrderMsgBox").html("");
	}

	$.fancybox("#place-order-box", {
			'autoResize': true,
			'autoSize': true,
			'maxHeight': "100%",
			'autoCenter': true,
			helpers: {
				overlay: {
					locked: false
				}
			},
	});
}

PricingManager.prototype.resgisterSubmitOrderClick = function(){
	var _this = this;
	$("#submit-order-button").unbind("click",_this.onSubmitOrderClick).bind("click",{that:_this},_this.onSubmitOrderClick);
}

PricingManager.prototype.orderFormValidateRules = {
	rules: {
		"name": {
			required: true,
			maxlength: 90,
		},
		"email": {
			required: true,
			maxlength: 90,
			email: true
		},
		"company": {
			required: true,
			maxlength: 90,
		},
		"jobtitle": {
			required: true,
			maxlength: 90,
		},
	},
	errorPlacement: function(error, element) {
		var errorEleId = "#" + element.attr("name") + "-sumbit-order-error"
		var errorBox = null;
		$(errorEleId).children().remove(); //removing if already outputed error from  backend
		errorBox = $("<div class='mp-dynamic-error' />");
		errorBox.fadeOut(200, function() {
			showError()
		});
		$(errorEleId).append(errorBox);

		function showError() {
			errorBox.append(error);
			errorBox.fadeIn(200);
		}
	},
	messages: {
		"name": {
			required: "Name is required",
			maxlength: "Maximum 90 characters allowed"
		},
		"email": {
			required: "Email is required",
			maxlength: "Email maximum length 90"
		},
		"company": {
			required: "Company is required",
			maxlength: "Email maximum length 90"
		},
		"jobtitle": {
			required: "Job Title is required",
			maxlength: "Email maximum length 90"
		},
	}
}


PricingManager.prototype.onSubmitOrderClick = function(ev){
		var _this = ev.data.that;
		ev.preventDefault();
		var form = $("#place-order-form");

		_this.appendPricingInputs(form);
		form.validate(_this.orderFormValidateRules);
		var isValid = form.valid();

		if(!isValid){
					return;
		}

		$("#placeOrderMsgBox").html(getProcessingHtml());

		var serializeData = form.serialize();
		var url = HAWKINS_ENDURL + "appknox-place-order/1029041/u8hzz6";
		var method = form.attr("method");

		var option = {
			url : url,
			method : method,
			data : serializeData,
			asyn : true,
			error : errorCallback,
			success : successCallback
		}

		var xhr = $.ajax(option);
		form.slideUp(300);
		form.attr("data-attr-submitted",FORM_SUBMITTING);

		function errorCallback(jqXHR, err, errException){
				$("#placeOrderMsgBox").removeClass("green").addClass("red").html(SUBMIT_ERROR_MSG);
				form.attr("data-attr-submitted",SUBMITTED_NO);
				form.slideDown(300);
		}

		function successCallback(resData){
				if(resData.status === "success"){
						$("#placeOrderMsgBox").removeClass("red").addClass("green").html(SUBMIT_SUCCESS_MSG);
						form.attr("data-attr-submitted", FORM_SUBMITTED_YES);
				}else{
						$("#placeOrderMsgBox").html(SUBMIT_ERROR_MSG);
						form.attr("data-attr-submitted",SUBMITTED_NO);
						form.slideDown(300);
				}
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

///////////////////////////////////////////////////////////////////////////////////////
// Contact Us form with Fancybox
function fancyContactForm() {
	var formStatus = $("#ak-contact-from").attr("data-attr-submitted");

	if(formStatus === SUBMITTED_NO){
		$("#messageBoxCU").html("");
	}

  $.fancybox("#cuform", {
			'autoResize': true,
			'autoSize': true,
			'maxHeight': "100%",
			'autoCenter': true,
			helpers: {
				overlay: {
					locked: false
				}
			},
    });
}

var contactFormRule = {rules:{
	name: "required",
	email: "email",
}}

$(document).ready(function() {
	$(".cubtn").click(function(ev){
		ev.preventDefault();
		fancyContactForm();
	});
});

//Contact us form validation rules
var contactFormValidateRules = {
	rules: {
		"name": {
			required: true,
			maxlength: 40,
		},
		"email": {
			required: true,
			maxlength: 90,
			email: true
		},
		"company": {
			required: true,
			maxlength: 40,
			minlength: 2,
		},
		"designation": {
			required: true,
			maxlength: 40,
			minlength: 2,
		},
		"phone": {
			required: true,
			maxlength: 20,
			minlength: 6,
		},
	},
	errorPlacement: function(error, element) {
		var errorEleId = "#" + element.attr("name") + "-cu-error"
		var errorBox = null;
		$(errorEleId).children().remove(); //removing if already outputed error from  backend
		errorBox = $("<div id='mp-dynamic-error' />");
		errorBox.fadeOut(200, function() {
			showError()
		});
		$(errorEleId).append(errorBox);

		function showError() {
			errorBox.append(error);
			errorBox.fadeIn(200);
		}
	},
	messages: {
		"name": {
			required: "Name is required",
			maxlength: "Maximum 50 characters allowed"
		},
		"email": {
			required: "Email is required",
			maxlength: "Email maximum length 90"
		},
		"company": {
			required: "Company name is required",
		},
		"phone": {
			required: "Phone number is required"
		},
		"designation": {
			required: "Designation is required"
		}
	}
}

//Function to watch subscribe form submit
function bindContactSubmitCheck(){
	$("#contact-form-submit").unbind("click",sendContactForm).bind("click",sendContactForm);
}

function sendContactForm(ev){
	ev.preventDefault();
	var form = $("#ak-contact-from");
	form.validate(contactFormValidateRules);
	var isValid = form.valid();

	if(isValid){
				//Loading sign etc
	}else{
		return;
	}

	var serializeData = form.serialize();
	var url = HAWKINS_ENDURL + "contact-us/1029041/u5obs8";
	var method = form.attr("method");
	form.attr("action",url);

	var option = {
		url : url,
		method : method,
		data : serializeData,
		asyn : true,
		error : errorCallback,
		success : successCallback
	}

	var xhr = $.ajax(option);
	$("#messageBoxCU").removeClass("red").addClass("green").html(getProcessingHtml());
	form.slideUp(300);
	form.attr("data-attr-submitted",FORM_SUBMITTING);

	function errorCallback(jqXHR, err, errException){
			$("#messageBoxCU").removeClass("green").addClass("red").html(SUBMIT_ERROR_MSG);
			form.slideDown(300);
	}

	function successCallback(resData){
			if(resData.status === "success"){
					$("#messageBoxCU").removeClass("red").addClass("green").html(SUBMIT_SUCCESS_MSG);
					form.attr("data-attr-submitted",FORM_SUBMITTED_YES);
			}else{
					$("#messageBoxCU").removeClass("green").addClass("red").html(resData.data.message);
					form.attr("data-attr-submitted",SUBMITTED_NO);
					form.slideDown(300);
			}
	}
}

//subscribe form validation
var subscribeFormValidateRules = {
	rules: {
		"email": {
			required: true,
			maxlength: 90,
			email: true
		},
	},
	errorPlacement: function(error, element) {
		var errorEleId = "#" + element.attr("name") + "-su-error"
		var errorBox = null;
		$(errorEleId).children().remove(); //removing if already outputed error from  backend
		errorBox = $("<div class='mp-dynamic-error' />");
		errorBox.fadeOut(200, function() {
			showError()
		});
		$(errorEleId).append(errorBox);

		function showError() {
			errorBox.append(error);
			errorBox.fadeIn(200);
		}
	},
	messages: {
		"email": {
			required: "Email is required",
			maxlength: "Email maximum length 90"
		},
	},
	submitHandler: function(form) {

	}
}

//Function to watch subscribe form submit
function bindSubscribeSubmitCheck(){
$("#subscribe-form").unbind("click",sendSubsribeForm).bind("click",sendSubsribeForm);
}

function sendSubsribeForm(ev){
	ev.preventDefault();
	var form = $("#subscribe-form");
	form.validate(subscribeFormValidateRules);
	var isValid = form.valid();

	if(isValid){
				//Loading sign etc
	}else{
		return;
	}

	var serializeData = form.serialize();
	var url = HAWKINS_ENDURL + "appknox-email-subscribe/1029041/urrz0l";
	var method = form.attr("method");

	var option = {
		url : url,
		method : method,
		data : serializeData,
		asyn : true,
		error : errorCallback,
		success : successCallback
	}

	var xhr = $.ajax(option);
	form.attr("data-attr-submitted",FORM_SUBMITTING);
	form.find("input").fadeOut(300);

	function errorCallback(jqXHR, err, errException){
			$("#email-su-error").removeClass("green").addClass("red").html(SUBMIT_ERROR_MSG);
			form.attr("data-attr-submitted",SUBMITTED_NO);
			form.find("input").fadeIn(300);
	}

	function successCallback(resData){
			if(resData.status === "success"){
					$("#email-su-error").removeClass("red").addClass("green").html(SUBMIT_SUCCESS_MSG);
					form.attr("data-attr-submitted",FORM_SUBMITTED_YES);
					form.find("input").fadeOut(300);
			}else{
					$("#email-su-error").removeClass("green").addClass("red").html(SUBMIT_ERROR_MSG);
					form.attr("data-attr-submitted",SUBMITTED_NO);
					form.find("input").fadeOut(300);
			}
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Activate the div based checkboxes in contact us form
function activateDivCheckBox(){
	var liInputs = $("#cu-ak-checkbox-pannel > li");
	liInputs.unbind("click",reactToDivCheckbox).bind("click",reactToDivCheckbox);

	function reactToDivCheckbox(ev){
			var target = ev.currentTarget;
			var isActive = $(target).hasClass("active");
			var idFirstSegment = $(target).attr("id").split("-")[0];
			var inputValue = "0";
			var isRadio = $(target).hasClass("radio-apk");

			$(target).parent().find("li.radio-apk").removeClass("active");
			$(target).parent().find("li.radio-apk input").attr("value","0")

			if(isActive){
					inputValue = "0";
					$(target).removeClass("active");
			}else{
					inputValue = "1";
					$(target).addClass("active");
			}

			$("#" + idFirstSegment + "-input").attr("value",inputValue);
	}
}

///////////////////////////////////////////////////////////////////////////////////////
// Request Demo form with Fancybox
function fancyRequestDemoForm() {
		var formStatus = $("#request-demo-form").attr("data-attr-submitted");

		if(formStatus === SUBMITTED_NO){
			$("#messageBoxDemo").html("");
		}

    $.fancybox("#request-demo-box", {
				'autoResize': true,
				'autoSize': true,
				'maxHeight': "100%",
				'autoCenter': true,
				helpers: {
					overlay: {
						locked: false
					}
				},
    });
}

//Contact us form validation rules
var demoFormValidateRules = {
	rules: {
		"name": {
			required: true,
			maxlength: 90
		},
		"email": {
			required: true,
			maxlength: 90
		},
		"company": {
			required: true,
			maxlength: 90
		},
		"jobtitle": {
			required: true,
			maxlength: 90
		},
	},
	errorPlacement: function(error, element) {
		var errorEleId = "#" + element.attr("name") + "-ds-error"
		var errorBox = null;
		$(errorEleId).children().remove(); //removing if already outputed error from  backend
		errorBox = $("<div class='mp-dynamic-error' />");
		errorBox.fadeOut(200, function() {
			showError()
		});
		$(errorEleId).append(errorBox);

		function showError() {
			errorBox.append(error);
			errorBox.fadeIn(200);
		}
	},
	messages: {
		"name": {
			required: "Full Name is required",
			maxlength: "Maximum 90 characters allowed"
		},
		"email": {
			required: "Email is required",
			maxlength: "Email maximum length 90"
		},
		"company": {
			required: "Company is required",
			maxlength: "Company maximum length 90"
		},
		"jobtitle": {
			required: "Job Title is required",
			maxlength: "Job Title maximum length 90"
		},
	}
}

function sendDemoForm(ev){
	ev.preventDefault();

	var form = $("#request-demo-form");
	form.validate(demoFormValidateRules);
	var isValid = form.valid();

	if(isValid){
				//Loading sign etc
	}else{
		return;
	}

	var msgBox = $("#messageBoxDemo");

	msgBox.html(getProcessingHtml());
	form.slideUp(300);

	var serializeData = form.serialize();
	serializeData += "&MXCProspectId=" + encodeURIComponent(MXCProspectId);
	var url = HAWKINS_ENDURL + "appknox-demo-signup/1029041/u8hu7c";
	var method = form.attr("method");

	var option = {
		url : url,
		method : method,
		data : serializeData,
		asyn : true,
		error : errorCallback,
		success : successCallback
	}

	var xhr = $.ajax(option);
	form.attr("data-attr-submitted",FORM_SUBMITTING);

	function errorCallback(jqXHR, err, errException){
			msgBox.removeClass("green").addClass("red").html("Some error occurred while submitting the form");
			form.slideDown(300);
	}

	function successCallback(resData){
			if(resData.status === "success"){
					msgBox.removeClass("red").addClass("green").html(SUBMIT_SUCCESS_MSG);
					form.attr("data-attr-submitted",FORM_SUBMITTED_YES);
			}else{
					msgBox.removeClass("green").addClass("red").html(SUBMIT_ERROR_MSG);
					form.slideDown(300);
			}
	}
}

//Function to watch demo form submit
function bindDemoSubmitCheck(){
	$("#demo-form-submit").unbind("click",sendDemoForm).bind("click",sendDemoForm);
}

$(document).ready(function() {
	$(".req-demo").click(function(ev){
		ev.preventDefault();
		fancyRequestDemoForm();
	});

	$(".bulk-order").click(function(ev){
		ev.preventDefault();
		fancyBulkOrderForm();
	});
});

///////////////////////////////////////////////////////////////////////////////////////
// Bulk Order form with Fancybox
function fancyBulkOrderForm() {
	var formStatus = $("#bulk-order-form").attr("data-attr-submitted");

	if(formStatus === SUBMITTED_NO){
		$("#messageBoxBulk").html("");
	}

    $.fancybox("#bulk-orders-box", {
				'autoResize': true,
				'autoSize': true,
				'maxHeight': "100%",
				'autoCenter': true,
				helpers: {
					overlay: {
						locked: false
					}
				},
    });
}

//Contact us form validation rules
var bulkFormValidateRules = {
	rules: {
		"name": {
			required: true,
			maxlength: 40,
		},
		"email": {
			required: true,
			maxlength: 90,
			email: true
		},
		"company": {
			required: true,
			maxlength: 90
		},
		"jobtitle": {
			required: true,
			maxlength: 90
		},
		"numapp": {
			required: true,
			digits: true,
		}
	},
	errorPlacement: function(error, element) {
		var errorEleId = "#" + element.attr("name") + "-bulk-error"
		var errorBox = null;
		$(errorEleId).children().remove(); //removing if already outputed error from  backend
		errorBox = $("<div class='mp-dynamic-error' />");
		errorBox.fadeOut(200, function() {
			showError()
		});
		$(errorEleId).append(errorBox);

		function showError() {
			errorBox.append(error);
			errorBox.fadeIn(200);
		}
	},
	messages: {
		"name": {
			required: "Name is required",
			maxlength: "Maximum 50 characters allowed"
		},
		"email": {
			required: "Email is required",
			maxlength: "Email maximum length 90"
		},
		"company": {
			required: "Company is required",
			maxlength: "Company maximum length 90"
		},
		"jobtitle": {
			required: "Job Title is required",
			maxlength: "Job Title maximum length 90"
		},
		"numapp": {
			required: "Number of apps is required",
			maxlength: "Job Title maximum length 90",
			digits: "Only numeric values"
		},
	}
}

function sendBulkOrderForm(ev){
	ev.preventDefault();

	var form = $("#bulk-order-form");
	form.validate(bulkFormValidateRules);
	var isValid = form.valid();

	if(isValid){
				//Loading sign etc
	}else{
		return;
	}

	$("#messageBoxBulk").html(getProcessingHtml());

	var serializeData = form.serialize();
	var url = HAWKINS_ENDURL + "appknox-bulk-order/1029041/u8h9no";
	var method = form.attr("method");

	var option = {
		url : url,
		method : method,
		data : serializeData,
		asyn : true,
		error : errorCallback,
		success : successCallback
	}

	var xhr = $.ajax(option);
	form.attr("data-attr-submitted",FORM_SUBMITTING);
	form.slideUp(300);

	function errorCallback(jqXHR, err, errException){
			$("#messageBoxBulk").removeClass("green").addClass("red").html("Some error occurred while submitting the form");
			form.attr("data-attr-submitted",SUBMITTED_NO);
			form.slideDown(300);
	}

	function successCallback(resData){
			if(resData.status === "success"){
					$("#messageBoxBulk").removeClass("red").addClass("green").html(SUBMIT_SUCCESS_MSG);
					form.attr("data-attr-submitted",FORM_SUBMITTED_YES);
			}else{
					$("#messageBoxBulk").html(SUBMIT_ERROR_MSG);
					form.attr("data-attr-submitted",SUBMITTED_NO);
					form.slideDown(300);
			}
	}
}

//Function to watch demo form submit
function bindBulkSubmitCheck(){
	$("#bulk-order-submit").unbind("click",sendBulkOrderForm).bind("click",sendBulkOrderForm);
}

///////////////////////////////////////////////////////////////////////////////////////
// Landing Page form with Fancybox

//Landing Page form1 validation rules
var landinPageForm1ValidateRules = {
	rules: {
		"name": {
			required: true,
			maxlength: 40,
		},
		"email": {
			required: true,
			maxlength: 90,
			email: true
		},
		"company":{
			required: true,
			maxlength: 40,
		},
		"app-url":{
			maxlength: 100,
			url:true,
		}

	},
	errorPlacement: function(error, element) {
		var errorEleId = "#" + element.attr("name") + "-lp-error"
		var errorBox = null;
		$(errorEleId).children().remove(); //removing if already outputed error from  backend
		errorBox = $("<div class='mp-dynamic-error' />");
		errorBox.fadeOut(200, function() {
			showError()
		});
		$(errorEleId).append(errorBox);

		function showError() {
			errorBox.append(error);
			errorBox.fadeIn(200);
		}
	},
	messages: {
		"name": {
			required: "Name is required",
			maxlength: "Maximum 50 characters allowed"
		},
		"email": {
			required: "Email is required",
			maxlength: "Email maximum length 90"
		},
		"company": {
			required: "Company is required",
			maxlength: "Company maximum length 90"
		},
		"app-url":{
			maxlength: "300",
			url: "Please enter a valid URL"
		}
	}
}

function sendLandingPageForm1(ev){
	ev.preventDefault();

	var form = $("#lp_form_1");
	form.validate(landinPageForm1ValidateRules);
	var isValid = form.valid();

	if(isValid){
				//Loading sign etc
	}else{
		return;
	}

	$("#lpForm1MsgBox").html(getProcessingHtml());

	var serializeData = form.serialize();
	var url = HAWKINS_ENDURL + "appknox-lp-form-1/1029041/u8hakm";
	var method = form.attr("method");

	var option = {
		url : url,
		method : method,
		data : serializeData,
		asyn : true,
		error : errorCallback,
		success : successCallback
	}

	var xhr = $.ajax(option);
	form.find("input,textarea").attr("disabled",true);

	function errorCallback(jqXHR, err, errException){
			$("#lpForm1MsgBox").removeClass("green").addClass("red").html(SUBMIT_ERROR_MSG);
			form.find("input,textarea").removeAttr("disabled");
	}

	function successCallback(resData){
			if(resData.status === "success"){
					$("#lpForm1MsgBox").removeClass("red").addClass("green").html(SUBMIT_SUCCESS_MSG);
					form.find("input,textarea").attr("disabled",true);
			}else{
					$("#lpForm1MsgBox").html(SUBMIT_ERROR_MSG);
					form.find("input,textarea").removeAttr("disabled");
			}
	}
}

//Function to watch demo form submit
function bindLandingPageForm1(){
	$("#landing_page_1_submit").unbind("click",sendLandingPageForm1).bind("click",sendLandingPageForm1);
}



$(document).ready(function(){
	activateDivCheckBox();
	bindSubscribeSubmitCheck();
	bindContactSubmitCheck();
	bindDemoSubmitCheck();
	bindBulkSubmitCheck();
	bindLandingPageForm1();
});

$(document).ready(function() {
	$(".various").fancybox({
		autoSize	: true,
		closeClick	: true,
		openEffect	: 'none',
		closeEffect	: 'none'
	});
	});
