
var spin = $('.spin');
var board;
var invalidated=false;

function initScreen()
{
	  $('#sidebar').removeClass("onscreen");
	  $('#sidebar').addClass("offscreen");

	board = $('#cardshufflediv');
	//board.height($(window).height()*0.98);  move to css 
	
	
}


function myAddToBookmark() {
            // Mozilla Firefox Bookmark
            if ('sidebar' in window && 'addPanel' in window.sidebar) { 
                window.sidebar.addPanel(location.href,document.title,"");
            } else if( /*@cc_on!@*/false) { // IE Favorite
                window.external.AddFavorite(location.href,document.title); 
            } else { // webkit - safari/chrome
                alert('Press ' + (navigator.userAgent.toLowerCase().indexOf('mac') != - 1 ? 'Command/Cmd' : 'CTRL') + ' + D to bookmark this page.');
            }
}

function myClose(element)
{
  var parent= $(element).parents();
  parent[2].style.display = "none";
}

function myShuffle()
{
 invalidated=false;
 initScreen();
var i = 1;
$($(".box").get().reverse()).each(function( index ) {
//  TweenMax.to(this, 1, {x:20*i, y:10*i});
  TweenMax.to(this, 1, {
    delay:i*0.1,
    x:Math.random()*board.width(),
    y:Math.random()*board.height()
  });
  var spin=$(this).find( "div" );
  TweenMax.to(spin, 1, {
    delay:i*0.1,
    rotation:Math.random()*360
  });
  TweenMax.to($(this), 0.4, {rotationY:-180});
  $(this).removeClass("front");
  $(this).addClass("back");

  i++;
  Draggable.create(this, {
    bounds: board,
    throwProps: true
  });
});
}

function myShuffleAsync()
{
  if (!invalidated)
  {
    invalidated=true;
    requestAnimationFrame(myShuffle);
  }
}


Draggable.create(spin, {
  type: "rotation",
  throwProps: true
});


$('.spin').on('click', function(){
  TweenMax.to(this, 1, {rotation:0});
});
/*
$(function() {
    // Change this selector to find whatever your 'boxes' are
    var boxes = $(".box");

    // Set up click handlers for each box
    boxes.click(function() {
        var el = $(this), // The box that was clicked
            max = 0;

        // Find the highest z-index
        boxes.each(function() {
            // Find the current z-index value
            var z = parseInt( $( this ).css( "z-index" ), 10 );
            // Keep either the current max, or the current z-index, whichever is higher
            max = Math.max( max, z );
        });

        // Set the box that was clicked to the highest z-index plus one
        el.css("z-index", max + 1 );
    el.removeClass("back");
  el.addClass("front");
  });
});
*/

//****** Javascript - save as EXT_Components/test1/test1.js ******

function InstallTheDirectiveFor_cards(streamingAppController) {
    streamingAppController.directive('cards', ['$document', function ($document) {
 
 return {
                link: function (scope, element, attr) {
                    // THIS IS WHERE YOU SEE THE HTML(element) AND THE DATA (scope) FOR EVERYTHING THAT USE OUR DIRECTIVE (cards)
                    //var c = document.createElement('canvas');
                    //element[0].appendChild(c);
					


	
	$('.box').on('click', function(){
  var board = $('#cardshufflediv');
  TweenMax.to(this, 1, {
    x:(board.width()/2-this.scrollWidth/2),
    y:board.height()*0.3});
    TweenMax.to(this, 0.4, {rotationY:0});
      $(this).removeClass("back");
  $(this).addClass("front");

});

$('.spin').on('click', function(){
  TweenMax.to(this, 1, {rotation:0});

});


 	myShuffleAsync();

                }
            };
        }]);

    console.trace("cards component Loaded");
}
InstallTheDirectiveFor_cards(angular.module(MDrivenAngularAppModule));