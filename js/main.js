/////////////////////////////////////////////////////////////////
//Globally declaring $ as reference to jQuery as required in WP
var $ = jQuery
var HAWKINS_ENDURL = "https://hawkins.appknox.com/api/send/";
var SUBMIT_SUCCESS_MSG = "<i class='fa fa-check' aria-hidden='true'></i> Thank you! We will get in touch shortly";
var SUBMIT_ERROR_MSG = "<i class='fa fa-check-square' aria-hidden='true'></i> Sorry! Form submission failed";
var SUBMITTED_NO = "no";
var FORM_SUBMITTED_YES = "yes";
var FORM_SUBMITTING = "processing";
var API_KEY = 'ee8ebf9c-48e1-11e6-b56f-066beb27a027';
var AGENT_NUMBER = '+6598111992';
var SR_NUMBER = '+6531585898';

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
  var marginTop = this.header.css("margin-top");
  marginTop = (parseInt(marginTop));

  if(!marginTop){
    marginTop = 0;
  }

  var headerHeight = this.getHeaderHeight();
  var offsetTop = 0;

  if(!this.isHeaderFixed()){
    offsetTop = document.body.scrollTop || document.documentElement.scrollTop;
  }

  offsetTop = -offsetTop + headerHeight + marginTop;

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
  this.swipeHandler();
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
  var _this = this;
  var slideNumToBring = 0;

  if(_this.currentSlide == _this.noOfSlides - 1){
    slideNumToBring = 0;
  }else{
    slideNumToBring = _this.currentSlide + 1;
  }
  clearInterval(_this.interval);
  _this.interval = null;
  _this.hideSlide(slideNumToBring);
}

AkSlideManager.prototype.onSwipeRight = function(ev){
  var _this = this;
  var slideNumToBring = 0;

  if(_this.currentSlide == 0){
    slideNumToBring = _this.noOfSlides - 1;
  }else{
    slideNumToBring = _this.currentSlide - 1;
  }

  clearInterval(_this.interval);
  _this.interval = null;
  _this.hideSlide(slideNumToBring);
}

AkSlideManager.prototype.bringSlide = function(){
  var _this = this;
  var currentSlideBlock = this.slideBlocks[_this.currentSlide];
  var elesToAnimate = $(currentSlideBlock).find("." + this.eleAnimateClass);

  $(currentSlideBlock).stop().fadeIn(_this.appearDeltaTime);

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
  $(currentSlideBlock).stop().fadeOut(timeToHide + _this.hideDeltaTime,function(){_this.bringSlide()});
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

AkSlideManager.prototype.swipeHandler = function(){
  if(this.slideZone == undefined || this.slideZone.length ==0){
    return;
  }
  var _this = this;
  var touchsurface = this.slideZone[0],
  swipedir,
  startX,
  startY,
  distX,
  distY,
  threshold = 100, //required min distance traveled to be considered swipe
  restraint = 100, // maximum distance allowed at the same time in perpendicular direction
  allowedTime = 200, // maximum time allowed to travel that distance
  elapsedTime,
  startTime;

  var touchMoveEv = undefined;

  touchsurface.addEventListener('touchstart', function(e){
    var touchobj = e.changedTouches[0];
    swipedir = 'none';
    dist = 0;
    startX = touchobj.pageX;
    startY = touchobj.pageY;
    startTime = new Date().getTime();

  }, false)

  touchsurface.addEventListener('touchmove', function(e){

  }, false)

  touchsurface.addEventListener('touchend', function(e){
    var touchobj = e.changedTouches[0]
    distX = touchobj.pageX - startX; // get horizontal dist traveled by finger while in contact with surface
    distY = touchobj.pageY - startY; // get vertical dist traveled by finger while in contact with surface
    elapsedTime = new Date().getTime() - startTime; // get time elapsed
    if (elapsedTime <= allowedTime){ // first condition for awipe met
      if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint){ // 2nd condition for horizontal swipe met
        swipedir = (distX < 0)? 'left' : 'right'; // if dist traveled is negative, it indicates left swipe
      }
      else if (Math.abs(distY) >= threshold && Math.abs(distX) <= restraint){ // 2nd condition for vertical swipe met
        swipedir = (distY < 0)? 'up' : 'down'; // if dist traveled is negative, it indicates up swipe
      }
    }

    if(swipedir === "left"){
      _this.onSwipeLeft();
      e.preventDefault();
    }else if(swipedir === "right"){
      _this.onSwipeRight();
      e.preventDefault();
    }
  }, false)
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
    $("#company-dropdown").css("z-index","1");
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


////////////////////////////////////////////////////////
// Menu to work on iPad and iPhone

$(document).ready(function(){

    IS_IPAD = navigator.userAgent.match(/iPad/i) != null;
    IS_IPHONE = (navigator.userAgent.match(/iPhone/i) != null) || (navigator.userAgent.match(/iPod/i) != null);

    if (IS_IPAD || IS_IPHONE) {

        $('.menubar').on('click touchend', function() {
            var link = $(this).attr('href');
            window.open(link,'_self'); // open in the same window

            return true; // set false to prevent anchor click
        });
        $('.submenu').on('click touchend', function() {
            var link = $(this).attr('href');
            window.open(link,'_blank'); // open in the same window

            return true; // set false to prevent anchor click
        });

        $('input, textarea').on('click touchend', function() {
          var val = $(this).val();
          this.select();
        });
        $('.carousel-prev').on('click touchend', function() {
          $('#carousel-example-generic').carousel('prev')
        });
        $('.carousel-next').on('click touchend', function() {
          $('#carousel-example-generic').carousel('next')
        });




    }
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
  $('.faq-quest-area').on('click touchend', function(ev) {
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
  $("#contact-form-submit").unbind("click touchend",sendContactForm).bind("click touchend",sendContactForm);
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
  $("#subscribe-form").unbind("click touchend",sendSubsribeForm).bind("click touchend",sendSubsribeForm);
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
  $("#email-su-error").removeClass("red").addClass("green").html(getProcessingHtml());
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
  liInputs.unbind("click touchend",reactToDivCheckbox).bind("click touchend",reactToDivCheckbox);

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
  $("#demo-form-submit").unbind("click touchend",sendDemoForm).bind("click touchend",sendDemoForm);
}

$(document).ready(function() {

  $('.req-demo').on('click touchend', function(ev) {
    ev.preventDefault();
    fancyRequestDemoForm();
  });

  $(".pricing-demo").click(function(ev){
    ev.preventDefault();
    window.location= $(this).attr("href");
  });

  $(".bulk-order").click(function(ev){
    ev.preventDefault();
    fancyBulkOrderForm();
  });
  $("#callphone").click(function(ev){
    ev.preventDefault();
    fancyCallPhoneForm();
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
      maxlength: "Company maximum length 90",
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

var SOSFormValidateRules = {
  rules: {
    "name": {
      required: true,
      maxlength: 100,
    },
    "email": {
      required: true,
      maxlength: 100,
      email: true
    },
    "telephone":{
      required: true,
      maxlength: 40,
    },
    "app-url":{
      required: true,
      maxlength: 100
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
      maxlength: "Maximum 100 characters allowed"
    },
    "email": {
      required: "Email is required",
      maxlength: "Email maximum length 100"
    },
    "telephone": {
      required: "Phone Number is required",
      maxlength: "Phone Number maximum length 40"
    },
    "app-url":{
      maxlength: "300",
      required: "App name or URL is required"
    }
  }
}

function sendSOSForm(ev){
  ev.preventDefault();

  var form = $("#submit-sos-form");
  form.validate(SOSFormValidateRules);
  var isValid = form.valid();

  if(isValid){
    //Loading sign etc
  }else{
    return;
  }

  $("#SOSForm").html(getProcessingHtml());

  var serializeData = form.serialize();
  var url = HAWKINS_ENDURL + "appknox-sos-form/1029041/4l50bp";
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
    $("#SOSForm").removeClass("green").addClass("red").html(SUBMIT_ERROR_MSG);
    form.find("input,textarea").removeAttr("disabled");
  }

  function successCallback(resData){
    if(resData.status === "success"){
      $("#SOSForm").removeClass("red").addClass("green ak-margin-10").html(SUBMIT_SUCCESS_MSG);
      form.find("input,textarea").attr("disabled",true);
      form.remove();
    }else{
      $("#SOSForm").html(SUBMIT_ERROR_MSG);
      form.find("input,textarea").removeAttr("disabled");
    }
  }
}

function bindSOSForm(){
  $("#SOSForm-submit").unbind("click",sendSOSForm).bind("click",sendSOSForm);
}

function sendAGForm(ev){
  ev.preventDefault();

  var form = $("#submit-ag-form");
  form.validate(SOSFormValidateRules);
  var isValid = form.valid();

  if(isValid){
    //Loading sign etc
  }else{
    return;
  }

  $("#AGForm").html(getProcessingHtml());

  var serializeData = form.serialize();
  var url = HAWKINS_ENDURL + "appknox-sos-form/1029041/4n3jx1";
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
    $("#AGForm").removeClass("green").addClass("red").html(SUBMIT_ERROR_MSG);
    form.find("input,textarea").removeAttr("disabled");
  }

  function successCallback(resData){
    if(resData.status === "success"){
      $("#AGForm").removeClass("red").addClass("green ak-margin-10").html(SUBMIT_SUCCESS_MSG);
      form.find("input,textarea").attr("disabled",true);
      form.remove();
    }else{
      $("#AGForm").html(SUBMIT_ERROR_MSG);
      form.find("input,textarea").removeAttr("disabled");
    }
  }
}

function bindAGForm(){
  $("#AGForm-submit").unbind("click",sendAGForm).bind("click",sendAGForm);
}



function fancyCallPhoneForm() {
  var formStatus = $("#callphone-form").attr("data-attr-submitted");

  if(formStatus === SUBMITTED_NO){
    $("#messageBoxCall").html("");
  }

  $.fancybox("#callphone-box", {
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

$.validator.addMethod(
    "telephonecustom",
    function(value, element, regexp)
    {
        if (regexp.constructor != RegExp)
            regexp = new RegExp(regexp);
        else if (regexp.global)
            regexp.lastIndex = 0;
        return this.optional(element) || regexp.test(value);
    },
    "Number should be in international format like +65988888."
);

//Landing Page form1 validation rules
var CallFormValidateRules = {
  rules: {
    "phone": {
      telephonecustom: /(^\+(\d{10}|\d{12}|\d{11}|\d{13}|\d{14})|^(1800(\d{6}|\d{7}|\d{8}))|^(1888(\d{6}|\d{7}|\d{8})))$/,
      required: true,
      maxlength: 40,
    }
  },
  errorPlacement: function(error, element) {
    var errorEleId = "#" + element.attr("name") + "-call-error"
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
    "phone": {
      required: "Your Phone Number is required",
      maxlength: "Maximum 50 characters allowed"
    }
  }
}

function bindCallForm(){
  $("#CallForm-submit").unbind("click",sendCallForm).bind("click",sendCallForm);
}

function sendCallForm(ev){
  ev.preventDefault();

  var form = $("#callbox-form");
  form.validate(CallFormValidateRules);
  var isValid = form.valid();

  if(isValid){
    //Loading sign etc
  }else{
    return;
  }

  $("#CallForm").html(getProcessingHtml());
  phone_num = $("#visitorphone").val().trim();
  var serializeData = {
                  api_key: API_KEY,
                  agent_number: AGENT_NUMBER,
                  phone_number: phone_num,
                  sr_number: SR_NUMBER
              };
  var url = "https://sr.knowlarity.com/vr/api/click2call/";
  var method = form.attr("method");

  var option = {
    url : url,
    method : method,
    data : serializeData,
    asyn : true,
    error : errorCallback,
    success : successCallback,
    dataType : 'text',
    cache: !1
  }

  var xhr = $.ajax(option);
  form.find("input,textarea").attr("disabled",true);

  function errorCallback(jqXHR, err, errException){
    if (jqXHR.responseText) {
        $("#messageBoxCall").removeClass("green").addClass("red").html("Number should be in international format like +6598888888.");
        form.find("input,textarea").removeAttr("disabled");
    } else {
        successCallback("");
    }

  }

  function successCallback(resData){
      $("#messageBoxCall").removeClass("red").addClass("green ak-margin-10").html(SUBMIT_SUCCESS_MSG);
      form.find("input,textarea").attr("disabled",true);
      form.remove();
  }
}


$(document).ready(function(){
  activateDivCheckBox();
  bindSubscribeSubmitCheck();
  bindContactSubmitCheck();
  bindDemoSubmitCheck();
  bindBulkSubmitCheck();
  bindLandingPageForm1();
  bindSOSForm();
  bindAGForm();
  bindCallForm()
  $(".book_section").click(function() {
      $('html, body').animate({
          scrollTop: $("#sos-form-section").offset().top
      }, 200, function() {window.location.href="#sos-form-section";});
  });
});

$(document).ready(function() {
  $(".various").fancybox({
    autoSize  : true,
    closeClick  : true,
    openEffect  : 'none',
    closeEffect  : 'none'
  });
});

$(document).ready(function(){
  $('.month').on('click touchend', function() {
    $(".month").addClass("blue");
    $(".year").removeClass("blue");
    $(".yearly-plan").hide();
    $(".monthly-plan").show();
    $(".hide-savings").removeClass("show-savings");
  });
$('.year').on('click touchend', function() {
    $(".year").addClass("blue");
    $(".month").removeClass("blue");
    $(".monthly-plan").hide();
    $(".yearly-plan").show();
    $(".hide-savings").addClass("show-savings");
  });
});

$(document).ready(function(){
  $(".toggleNew").on("click", function(){
      var $href = $(this).attr('href');
      var $anchor = $('#'+$href).offset();
      window.scrollTo($anchor.left,$anchor.top-80);
      return false;
  });
  $('#sixteen').addClass('current-year');
    $('#year-selected li a').on('click', function (e) {
    e.preventDefault();
    $('#year-selected li a.current-year').removeClass('current-year');
    $(this).addClass('current-year');
    });
    $(".landing-page").click(function(){
    e.preventDefault();
    var url = $(this).attr('href');
    window.open(url, '_self');
    });
});

$(document).ready(function () {
  $(".grade_section").click(function() {
  window.location.href="#grade-section";
  });
});


 var css = "text-shadow: -1px -1px hsl(0,100%,50%), 1px 1px hsl(5.4, 100%, 50%), 3px 2px hsl(10.8, 100%, 50%), 5px 3px hsl(16.2, 100%, 50%), 7px 4px hsl(21.6, 100%, 50%), 9px 5px hsl(27, 100%, 50%), 11px 6px hsl(32.4, 100%, 50%), 13px 7px hsl(37.8, 100%, 50%), 14px 8px hsl(43.2, 100%, 50%), 16px 9px hsl(48.6, 100%, 50%), 18px 10px hsl(54, 100%, 50%), 20px 11px hsl(59.4, 100%, 50%), 22px 12px hsl(64.8, 100%, 50%), 23px 13px hsl(70.2, 100%, 50%), 25px 14px hsl(75.6, 100%, 50%), 27px 15px hsl(81, 100%, 50%), 28px 16px hsl(86.4, 100%, 50%), 30px 17px hsl(91.8, 100%, 50%), 32px 18px hsl(97.2, 100%, 50%), 33px 19px hsl(102.6, 100%, 50%), 35px 20px hsl(108, 100%, 50%), 36px 21px hsl(113.4, 100%, 50%), 38px 22px hsl(118.8, 100%, 50%), 39px 23px hsl(124.2, 100%, 50%), 41px 24px hsl(129.6, 100%, 50%), 42px 25px hsl(135, 100%, 50%), 43px 26px hsl(140.4, 100%, 50%), 45px 27px hsl(145.8, 100%, 50%), 46px 28px hsl(151.2, 100%, 50%), 47px 29px hsl(156.6, 100%, 50%), 48px 30px hsl(162, 100%, 50%), 49px 31px hsl(167.4, 100%, 50%), 50px 32px hsl(172.8, 100%, 50%), 51px 33px hsl(178.2, 100%, 50%), 52px 34px hsl(183.6, 100%, 50%), 53px 35px hsl(189, 100%, 50%), 54px 36px hsl(194.4, 100%, 50%), 55px 37px hsl(199.8, 100%, 50%), 55px 38px hsl(205.2, 100%, 50%), 56px 39px hsl(210.6, 100%, 50%), 57px 40px hsl(216, 100%, 50%), 57px 41px hsl(221.4, 100%, 50%), 58px 42px hsl(226.8, 100%, 50%), 58px 43px hsl(232.2, 100%, 50%), 58px 44px hsl(237.6, 100%, 50%), 59px 45px hsl(243, 100%, 50%), 59px 46px hsl(248.4, 100%, 50%), 59px 47px hsl(253.8, 100%, 50%), 59px 48px hsl(259.2, 100%, 50%), 59px 49px hsl(264.6, 100%, 50%), 60px 50px hsl(270, 100%, 50%), 59px 51px hsl(275.4, 100%, 50%), 59px 52px hsl(280.8, 100%, 50%), 59px 53px hsl(286.2, 100%, 50%), 59px 54px hsl(291.6, 100%, 50%), 59px 55px hsl(297, 100%, 50%), 58px 56px hsl(302.4, 100%, 50%), 58px 57px hsl(307.8, 100%, 50%), 58px 58px hsl(313.2, 100%, 50%), 57px 59px hsl(318.6, 100%, 50%), 57px 60px hsl(324, 100%, 50%), 56px 61px hsl(329.4, 100%, 50%), 55px 62px hsl(334.8, 100%, 50%), 55px 63px hsl(340.2, 100%, 50%), 54px 64px hsl(345.6, 100%, 50%), 53px 65px hsl(351, 100%, 50%), 52px 66px hsl(356.4, 100%, 50%), 51px 67px hsl(361.8, 100%, 50%), 50px 68px hsl(367.2, 100%, 50%), 49px 69px hsl(372.6, 100%, 50%), 48px 70px hsl(378, 100%, 50%), 47px 71px hsl(383.4, 100%, 50%), 46px 72px hsl(388.8, 100%, 50%), 45px 73px hsl(394.2, 100%, 50%), 43px 74px hsl(399.6, 100%, 50%), 42px 75px hsl(405, 100%, 50%), 41px 76px hsl(410.4, 100%, 50%), 39px 77px hsl(415.8, 100%, 50%), 38px 78px hsl(421.2, 100%, 50%), 36px 79px hsl(426.6, 100%, 50%), 35px 80px hsl(432, 100%, 50%), 33px 81px hsl(437.4, 100%, 50%), 32px 82px hsl(442.8, 100%, 50%), 30px 83px hsl(448.2, 100%, 50%), 28px 84px hsl(453.6, 100%, 50%), 27px 85px hsl(459, 100%, 50%), 25px 86px hsl(464.4, 100%, 50%), 23px 87px hsl(469.8, 100%, 50%), 22px 88px hsl(475.2, 100%, 50%), 20px 89px hsl(480.6, 100%, 50%), 18px 90px hsl(486, 100%, 50%), 16px 91px hsl(491.4, 100%, 50%), 14px 92px hsl(496.8, 100%, 50%), 13px 93px hsl(502.2, 100%, 50%), 11px 94px hsl(507.6, 100%, 50%), 9px 95px hsl(513, 100%, 50%), 7px 96px hsl(518.4, 100%, 50%), 5px 97px hsl(523.8, 100%, 50%), 3px 98px hsl(529.2, 100%, 50%), 1px 99px hsl(534.6, 100%, 50%), 7px 100px hsl(540, 100%, 50%), -1px 101px hsl(545.4, 100%, 50%), -3px 102px hsl(550.8, 100%, 50%), -5px 103px hsl(556.2, 100%, 50%), -7px 104px hsl(561.6, 100%, 50%), -9px 105px hsl(567, 100%, 50%), -11px 106px hsl(572.4, 100%, 50%), -13px 107px hsl(577.8, 100%, 50%), -14px 108px hsl(583.2, 100%, 50%), -16px 109px hsl(588.6, 100%, 50%), -18px 110px hsl(594, 100%, 50%), -20px 111px hsl(599.4, 100%, 50%), -22px 112px hsl(604.8, 100%, 50%), -23px 113px hsl(610.2, 100%, 50%), -25px 114px hsl(615.6, 100%, 50%), -27px 115px hsl(621, 100%, 50%), -28px 116px hsl(626.4, 100%, 50%), -30px 117px hsl(631.8, 100%, 50%), -32px 118px hsl(637.2, 100%, 50%), -33px 119px hsl(642.6, 100%, 50%), -35px 120px hsl(648, 100%, 50%), -36px 121px hsl(653.4, 100%, 50%), -38px 122px hsl(658.8, 100%, 50%), -39px 123px hsl(664.2, 100%, 50%), -41px 124px hsl(669.6, 100%, 50%), -42px 125px hsl(675, 100%, 50%), -43px 126px hsl(680.4, 100%, 50%), -45px 127px hsl(685.8, 100%, 50%), -46px 128px hsl(691.2, 100%, 50%), -47px 129px hsl(696.6, 100%, 50%), -48px 130px hsl(702, 100%, 50%), -49px 131px hsl(707.4, 100%, 50%), -50px 132px hsl(712.8, 100%, 50%), -51px 133px hsl(718.2, 100%, 50%), -52px 134px hsl(723.6, 100%, 50%), -53px 135px hsl(729, 100%, 50%), -54px 136px hsl(734.4, 100%, 50%), -55px 137px hsl(739.8, 100%, 50%), -55px 138px hsl(745.2, 100%, 50%), -56px 139px hsl(750.6, 100%, 50%), -57px 140px hsl(756, 100%, 50%), -57px 141px hsl(761.4, 100%, 50%), -58px 142px hsl(766.8, 100%, 50%), -58px 143px hsl(772.2, 100%, 50%), -58px 144px hsl(777.6, 100%, 50%), -59px 145px hsl(783, 100%, 50%), -59px 146px hsl(788.4, 100%, 50%), -59px 147px hsl(793.8, 100%, 50%), -59px 148px hsl(799.2, 100%, 50%), -59px 149px hsl(804.6, 100%, 50%), -60px 150px hsl(810, 100%, 50%), -59px 151px hsl(815.4, 100%, 50%), -59px 152px hsl(820.8, 100%, 50%), -59px 153px hsl(826.2, 100%, 50%), -59px 154px hsl(831.6, 100%, 50%), -59px 155px hsl(837, 100%, 50%), -58px 156px hsl(842.4, 100%, 50%), -58px 157px hsl(847.8, 100%, 50%), -58px 158px hsl(853.2, 100%, 50%), -57px 159px hsl(858.6, 100%, 50%), -57px 160px hsl(864, 100%, 50%), -56px 161px hsl(869.4, 100%, 50%), -55px 162px hsl(874.8, 100%, 50%), -55px 163px hsl(880.2, 100%, 50%), -54px 164px hsl(885.6, 100%, 50%), -53px 165px hsl(891, 100%, 50%), -52px 166px hsl(896.4, 100%, 50%), -51px 167px hsl(901.8, 100%, 50%), -50px 168px hsl(907.2, 100%, 50%), -49px 169px hsl(912.6, 100%, 50%), -48px 170px hsl(918, 100%, 50%), -47px 171px hsl(923.4, 100%, 50%), -46px 172px hsl(928.8, 100%, 50%), -45px 173px hsl(934.2, 100%, 50%), -43px 174px hsl(939.6, 100%, 50%), -42px 175px hsl(945, 100%, 50%), -41px 176px hsl(950.4, 100%, 50%), -39px 177px hsl(955.8, 100%, 50%), -38px 178px hsl(961.2, 100%, 50%), -36px 179px hsl(966.6, 100%, 50%), -35px 180px hsl(972, 100%, 50%), -33px 181px hsl(977.4, 100%, 50%), -32px 182px hsl(982.8, 100%, 50%), -30px 183px hsl(988.2, 100%, 50%), -28px 184px hsl(993.6, 100%, 50%), -27px 185px hsl(999, 100%, 50%), -25px 186px hsl(1004.4, 100%, 50%), -23px 187px hsl(1009.8, 100%, 50%), -22px 188px hsl(1015.2, 100%, 50%), -20px 189px hsl(1020.6, 100%, 50%), -18px 190px hsl(1026, 100%, 50%), -16px 191px hsl(1031.4, 100%, 50%), -14px 192px hsl(1036.8, 100%, 50%), -13px 193px hsl(1042.2, 100%, 50%), -11px 194px hsl(1047.6, 100%, 50%), -9px 195px hsl(1053, 100%, 50%), -7px 196px hsl(1058.4, 100%, 50%), -5px 197px hsl(1063.8, 100%, 50%), -3px 198px hsl(1069.2, 100%, 50%), -1px 199px hsl(1074.6, 100%, 50%), -1px 200px hsl(1080, 100%, 50%), 1px 201px hsl(1085.4, 100%, 50%), 3px 202px hsl(1090.8, 100%, 50%), 5px 203px hsl(1096.2, 100%, 50%), 7px 204px hsl(1101.6, 100%, 50%), 9px 205px hsl(1107, 100%, 50%), 11px 206px hsl(1112.4, 100%, 50%), 13px 207px hsl(1117.8, 100%, 50%), 14px 208px hsl(1123.2, 100%, 50%), 16px 209px hsl(1128.6, 100%, 50%), 18px 210px hsl(1134, 100%, 50%), 20px 211px hsl(1139.4, 100%, 50%), 22px 212px hsl(1144.8, 100%, 50%), 23px 213px hsl(1150.2, 100%, 50%), 25px 214px hsl(1155.6, 100%, 50%), 27px 215px hsl(1161, 100%, 50%), 28px 216px hsl(1166.4, 100%, 50%), 30px 217px hsl(1171.8, 100%, 50%), 32px 218px hsl(1177.2, 100%, 50%), 33px 219px hsl(1182.6, 100%, 50%), 35px 220px hsl(1188, 100%, 50%), 36px 221px hsl(1193.4, 100%, 50%), 38px 222px hsl(1198.8, 100%, 50%), 39px 223px hsl(1204.2, 100%, 50%), 41px 224px hsl(1209.6, 100%, 50%), 42px 225px hsl(1215, 100%, 50%), 43px 226px hsl(1220.4, 100%, 50%), 45px 227px hsl(1225.8, 100%, 50%), 46px 228px hsl(1231.2, 100%, 50%), 47px 229px hsl(1236.6, 100%, 50%), 48px 230px hsl(1242, 100%, 50%), 49px 231px hsl(1247.4, 100%, 50%), 50px 232px hsl(1252.8, 100%, 50%), 51px 233px hsl(1258.2, 100%, 50%), 52px 234px hsl(1263.6, 100%, 50%), 53px 235px hsl(1269, 100%, 50%), 54px 236px hsl(1274.4, 100%, 50%), 55px 237px hsl(1279.8, 100%, 50%), 55px 238px hsl(1285.2, 100%, 50%), 56px 239px hsl(1290.6, 100%, 50%), 57px 240px hsl(1296, 100%, 50%), 57px 241px hsl(1301.4, 100%, 50%), 58px 242px hsl(1306.8, 100%, 50%), 58px 243px hsl(1312.2, 100%, 50%), 58px 244px hsl(1317.6, 100%, 50%), 59px 245px hsl(1323, 100%, 50%), 59px 246px hsl(1328.4, 100%, 50%), 59px 247px hsl(1333.8, 100%, 50%), 59px 248px hsl(1339.2, 100%, 50%), 59px 249px hsl(1344.6, 100%, 50%), 60px 250px hsl(1350, 100%, 50%), 59px 251px hsl(1355.4, 100%, 50%), 59px 252px hsl(1360.8, 100%, 50%), 59px 253px hsl(1366.2, 100%, 50%), 59px 254px hsl(1371.6, 100%, 50%), 59px 255px hsl(1377, 100%, 50%), 58px 256px hsl(1382.4, 100%, 50%), 58px 257px hsl(1387.8, 100%, 50%), 58px 258px hsl(1393.2, 100%, 50%), 57px 259px hsl(1398.6, 100%, 50%), 57px 260px hsl(1404, 100%, 50%), 56px 261px hsl(1409.4, 100%, 50%), 55px 262px hsl(1414.8, 100%, 50%), 55px 263px hsl(1420.2, 100%, 50%), 54px 264px hsl(1425.6, 100%, 50%), 53px 265px hsl(1431, 100%, 50%), 52px 266px hsl(1436.4, 100%, 50%), 51px 267px hsl(1441.8, 100%, 50%), 50px 268px hsl(1447.2, 100%, 50%), 49px 269px hsl(1452.6, 100%, 50%), 48px 270px hsl(1458, 100%, 50%), 47px 271px hsl(1463.4, 100%, 50%), 46px 272px hsl(1468.8, 100%, 50%), 45px 273px hsl(1474.2, 100%, 50%), 43px 274px hsl(1479.6, 100%, 50%), 42px 275px hsl(1485, 100%, 50%), 41px 276px hsl(1490.4, 100%, 50%), 39px 277px hsl(1495.8, 100%, 50%), 38px 278px hsl(1501.2, 100%, 50%), 36px 279px hsl(1506.6, 100%, 50%), 35px 280px hsl(1512, 100%, 50%), 33px 281px hsl(1517.4, 100%, 50%), 32px 282px hsl(1522.8, 100%, 50%), 30px 283px hsl(1528.2, 100%, 50%), 28px 284px hsl(1533.6, 100%, 50%), 27px 285px hsl(1539, 100%, 50%), 25px 286px hsl(1544.4, 100%, 50%), 23px 287px hsl(1549.8, 100%, 50%), 22px 288px hsl(1555.2, 100%, 50%), 20px 289px hsl(1560.6, 100%, 50%), 18px 290px hsl(1566, 100%, 50%), 16px 291px hsl(1571.4, 100%, 50%), 14px 292px hsl(1576.8, 100%, 50%), 13px 293px hsl(1582.2, 100%, 50%), 11px 294px hsl(1587.6, 100%, 50%), 9px 295px hsl(1593, 100%, 50%), 7px 296px hsl(1598.4, 100%, 50%), 5px 297px hsl(1603.8, 100%, 50%), 3px 298px hsl(1609.2, 100%, 50%), 1px 299px hsl(1614.6, 100%, 50%), 2px 300px hsl(1620, 100%, 50%), -1px 301px hsl(1625.4, 100%, 50%), -3px 302px hsl(1630.8, 100%, 50%), -5px 303px hsl(1636.2, 100%, 50%), -7px 304px hsl(1641.6, 100%, 50%), -9px 305px hsl(1647, 100%, 50%), -11px 306px hsl(1652.4, 100%, 50%), -13px 307px hsl(1657.8, 100%, 50%), -14px 308px hsl(1663.2, 100%, 50%), -16px 309px hsl(1668.6, 100%, 50%), -18px 310px hsl(1674, 100%, 50%), -20px 311px hsl(1679.4, 100%, 50%), -22px 312px hsl(1684.8, 100%, 50%), -23px 313px hsl(1690.2, 100%, 50%), -25px 314px hsl(1695.6, 100%, 50%), -27px 315px hsl(1701, 100%, 50%), -28px 316px hsl(1706.4, 100%, 50%), -30px 317px hsl(1711.8, 100%, 50%), -32px 318px hsl(1717.2, 100%, 50%), -33px 319px hsl(1722.6, 100%, 50%), -35px 320px hsl(1728, 100%, 50%), -36px 321px hsl(1733.4, 100%, 50%), -38px 322px hsl(1738.8, 100%, 50%), -39px 323px hsl(1744.2, 100%, 50%), -41px 324px hsl(1749.6, 100%, 50%), -42px 325px hsl(1755, 100%, 50%), -43px 326px hsl(1760.4, 100%, 50%), -45px 327px hsl(1765.8, 100%, 50%), -46px 328px hsl(1771.2, 100%, 50%), -47px 329px hsl(1776.6, 100%, 50%), -48px 330px hsl(1782, 100%, 50%), -49px 331px hsl(1787.4, 100%, 50%), -50px 332px hsl(1792.8, 100%, 50%), -51px 333px hsl(1798.2, 100%, 50%), -52px 334px hsl(1803.6, 100%, 50%), -53px 335px hsl(1809, 100%, 50%), -54px 336px hsl(1814.4, 100%, 50%), -55px 337px hsl(1819.8, 100%, 50%), -55px 338px hsl(1825.2, 100%, 50%), -56px 339px hsl(1830.6, 100%, 50%), -57px 340px hsl(1836, 100%, 50%), -57px 341px hsl(1841.4, 100%, 50%), -58px 342px hsl(1846.8, 100%, 50%), -58px 343px hsl(1852.2, 100%, 50%), -58px 344px hsl(1857.6, 100%, 50%), -59px 345px hsl(1863, 100%, 50%), -59px 346px hsl(1868.4, 100%, 50%), -59px 347px hsl(1873.8, 100%, 50%), -59px 348px hsl(1879.2, 100%, 50%), -59px 349px hsl(1884.6, 100%, 50%), -60px 350px hsl(1890, 100%, 50%), -59px 351px hsl(1895.4, 100%, 50%), -59px 352px hsl(1900.8, 100%, 50%), -59px 353px hsl(1906.2, 100%, 50%), -59px 354px hsl(1911.6, 100%, 50%), -59px 355px hsl(1917, 100%, 50%), -58px 356px hsl(1922.4, 100%, 50%), -58px 357px hsl(1927.8, 100%, 50%), -58px 358px hsl(1933.2, 100%, 50%), -57px 359px hsl(1938.6, 100%, 50%), -57px 360px hsl(1944, 100%, 50%), -56px 361px hsl(1949.4, 100%, 50%), -55px 362px hsl(1954.8, 100%, 50%), -55px 363px hsl(1960.2, 100%, 50%), -54px 364px hsl(1965.6, 100%, 50%), -53px 365px hsl(1971, 100%, 50%), -52px 366px hsl(1976.4, 100%, 50%), -51px 367px hsl(1981.8, 100%, 50%), -50px 368px hsl(1987.2, 100%, 50%), -49px 369px hsl(1992.6, 100%, 50%), -48px 370px hsl(1998, 100%, 50%), -47px 371px hsl(2003.4, 100%, 50%), -46px 372px hsl(2008.8, 100%, 50%), -45px 373px hsl(2014.2, 100%, 50%), -43px 374px hsl(2019.6, 100%, 50%), -42px 375px hsl(2025, 100%, 50%), -41px 376px hsl(2030.4, 100%, 50%), -39px 377px hsl(2035.8, 100%, 50%), -38px 378px hsl(2041.2, 100%, 50%), -36px 379px hsl(2046.6, 100%, 50%), -35px 380px hsl(2052, 100%, 50%), -33px 381px hsl(2057.4, 100%, 50%), -32px 382px hsl(2062.8, 100%, 50%), -30px 383px hsl(2068.2, 100%, 50%), -28px 384px hsl(2073.6, 100%, 50%), -27px 385px hsl(2079, 100%, 50%), -25px 386px hsl(2084.4, 100%, 50%), -23px 387px hsl(2089.8, 100%, 50%), -22px 388px hsl(2095.2, 100%, 50%), -20px 389px hsl(2100.6, 100%, 50%), -18px 390px hsl(2106, 100%, 50%), -16px 391px hsl(2111.4, 100%, 50%), -14px 392px hsl(2116.8, 100%, 50%), -13px 393px hsl(2122.2, 100%, 50%), -11px 394px hsl(2127.6, 100%, 50%), -9px 395px hsl(2133, 100%, 50%), -7px 396px hsl(2138.4, 100%, 50%), -5px 397px hsl(2143.8, 100%, 50%), -3px 398px hsl(2149.2, 100%, 50%), -1px 399px hsl(2154.6, 100%, 50%); font-size: 40px;";

console.log("%cThis is AWESOME! We are looking for people like you, shoot us an email at careers@appknox.com !", css);
