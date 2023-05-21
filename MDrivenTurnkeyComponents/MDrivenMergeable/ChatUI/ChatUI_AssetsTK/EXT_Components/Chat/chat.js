


let chat;
function InitThingsForChat(scope)
{
  
    if ($('.chat-history').length==0)
      return;
    chat = {
      StreamingViewModelClient:scope.StreamingViewModelClient,
    messageToSend: '',    
    
    init: function() {
      this.cacheDOM();
      this.bindEvents();
      this.scrollToBottom();
    },
    cacheDOM: function() {
      this.$chatHistory = $('.chat-history').parent();
      this.$button = $('.sendButton');
      this.$textarea = $('#message-to-send');
    },
    bindEvents: function() {
      //this.$button.on('click', this.addMessage.bind(this));
      this.$textarea.on('keyup', this.addMessageEnter.bind(this));
    },
    
    addMessage: function() {
      this.$button.focus();
      chat.StreamingViewModelClient.ExecuteAfterFullRoundtrip('waitforapply',null,()=>{
        chat.StreamingViewModelClient.CallServerAction('ChatView','SendAction');
          this.scrollToBottom();      
        });
      this.$textarea.focus();
    },
    addMessageEnter: function(event) {
        // enter was pressed
        if (event.keyCode === 13) {
          this.addMessage();
        }
    },
    scrollToBottom: function() {
      chat.StreamingViewModelClient.ExecuteAfterFullRoundtrip('waitformessage',null,()=>{
        if (this.$chatHistory)
          this.$chatHistory.scrollTop(this.$chatHistory[0].scrollHeight);
      });
    }
    
  };
  
  chat.init();
  
  
}


  
  
//****** Javascript - save as EXT_Components/test1/test1.js ******

function InstallTheDirectiveFor_chat(streamingAppController) {

        streamingAppController.directive('message', ['$document', function ($document) {
 
          return {
                         link: function (scope, element, attr) { 
                          if (chat==undefined)
                            InitThingsForChat(scope);
                          if (chat!=undefined)
                          {
                            scope.$watch(
                              function () {
                                  return chat.StreamingViewModelClient.ViewData.RootVMClassObject.NumberOfMessages;
                              },
                              function (newValue, oldValue) {
                                  if (!angular.equals(oldValue, newValue)) {
                                    chat.scrollToBottom();
                                  }
                              },
                              true);
                          }
                         }
                     };
                 }]);
         
    console.trace("channel component Loaded");
}
InstallTheDirectiveFor_chat(angular.module(MDrivenAngularAppModule));

