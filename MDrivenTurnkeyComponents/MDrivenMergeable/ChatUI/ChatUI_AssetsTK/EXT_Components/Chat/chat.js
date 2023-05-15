
var spin = $('.spin');
var board;
var invalidated=false;

function initScreen()
{
	  $('#sidebar').removeClass("onscreen");
	  $('#sidebar').addClass("offscreen");

	board = $('#chatdiv');
	//board.height($(window).height()*0.98);  move to css 
	
	
}



function myClose(element)
{
  var parent= $(element).parents();
  parent[2].style.display = "none";
}

var chat;
function InitThingsForChat()
{
  
    chat = {
    messageToSend: '',
    
    init: function() {
      this.cacheDOM();
      this.bindEvents();
      this.render();
    },
    cacheDOM: function() {
      this.$chatHistory = $('.chat-history');
      this.$button = $('button');
      this.$textarea = $('#message-to-send');
      this.$chatHistoryList =  this.$chatHistory.find('ul');
    },
    bindEvents: function() {
      this.$button.on('click', this.addMessage.bind(this));
      this.$textarea.on('keyup', this.addMessageEnter.bind(this));
    },
    render: function() {
      this.scrollToBottom();
      
    },
    
    addMessage: function() {
      this.messageToSend = this.$textarea.val()
      this.render();         
    },
    addMessageEnter: function(event) {
        // enter was pressed
        if (event.keyCode === 13) {
          this.addMessage();
        }
    },
    scrollToBottom: function() {
       this.$chatHistory.scrollTop(this.$chatHistory[0].scrollHeight);
    },
    getCurrentTime: function() {
      return new Date().toLocaleTimeString().
              replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, "$1$3");
    },
    getRandomItem: function(arr) {
      return arr[Math.floor(Math.random()*arr.length)];
    }
    
  };
  
  chat.init();
  
  
}


  /********THIS is for SlideoutMenu ******* */

  var slideout;
  function InitThingsForSlideOut()
  {
  
   slideout = new Slideout({
    'panel': document.getElementById('gridforchat'),
    'menu': document.getElementById('menu'),
    'padding': 256,
    'tolerance': 70
  });
  
  // Toggle button
  document.querySelector('.toggle-button').addEventListener('click', function() {
    slideout.toggle();
  });
  
  }
  
  
//****** Javascript - save as EXT_Components/test1/test1.js ******

function InstallTheDirectiveFor_chat(streamingAppController) {
        streamingAppController.directive('channel', ['$document', function ($document) {
    
    return {
                    link: function (scope, element, attr) {
                      if (slideout==undefined)
                          InitThingsForSlideOut();
                      if (chat==undefined)
                        InitThingsForChat();
                    }
                };
            }]);

        streamingAppController.directive('message', ['$document', function ($document) {
 
          return {
                         link: function (scope, element, attr) {
                          if (chat!=undefined)
                            chat.scrollToBottom();
                         }
                     };
                 }]);
         
    console.trace("channel component Loaded");
}
InstallTheDirectiveFor_chat(angular.module(MDrivenAngularAppModule));

