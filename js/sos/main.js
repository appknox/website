


/////////////////////////////////////////////////////////////////
//Globally declaring $ as reference to jQuery as required in WP
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

  $(".pricing-demo").click(function(ev){
    ev.preventDefault();
    window.location= $(this).attr("href");
  });

  $(".bulk-order").click(function(ev){
    ev.preventDefault();
    fancyBulkOrderForm();
  });
});

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

$(document).ready(function () {
  $(".book_section").click(function() {
  window.location.href="#submit_section";
  });
});
