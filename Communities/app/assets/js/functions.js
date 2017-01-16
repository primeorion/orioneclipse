// JavaScript Document
$.material.init();
$(document.body).on('click', '.left-close' ,function(){
       $("body").toggleClass("hide-show");
	$('.fa-chevron-left').toggleClass('fa-chevron-right');
    $(this).parent('.menu-li').toggleClass('menuleft');
    $('.left-nav-block-hidden').toggleClass('hidden');
 }); 

/****Accordian****/

var selectIds = $('#panel1,#panel2,#panel3,#panel4');
 
$(function ($) {
    selectIds.on('show.bs.collapse hidden.bs.collapse', function () {
			
        $(this).prev().find('.fa').toggleClass('fa-plus-circle fa-minus-circle');
    });
		
		$("#querybuilder .panel-heading").on('click', function() {
		 	$("#querybuilder .panel-heading").removeClass("clicked");
			var shouldToggle = $(this).next().hasClass("in");
			if(!shouldToggle) {
				$(this).addClass("clicked");
			} else {
					$(this).removeClass("clicked");
			}
			
		});
		
		
});

  $( ".dropdown" ).click(function(event) {
        // stop bootstrap.js to hide the parents
        event.stopPropagation();
        // hide the open children
        $( this ).find(".submenu").removeClass('open');
        // add 'open' class to all parents with class 'dropdown-submenu'
        $( this ).parents(".submenu").addClass('open');
        // this is also open (or was)
        $( this ).toggleClass('open');
    });


/*********role permission toggel***/
$(document).ready( function() {
  $("a.toggleYes, a.toggleNo").click( function() {
	  var oldStatus = $(this).hasClass('toggleNo') ? 'toggleNo' : 'toggleYes';
	  var finalStatus = $(this).hasClass('toggleNo') ? 'toggleYes' : 'toggleNo';
     $(this).addClass(finalStatus).removeClass(oldStatus);
  });
  
   // $("[name='custom-checkbox']").bootstrapSwitch('size', 'mini');
    // $("[name='title-checkbox']").bootstrapSwitch('size', 'mini');
 
});
 

   