function actuallyTakePicture(video,scope,nametobindto){

navigator.mediaDevices.getUserMedia({ video: true })
        .then(function(stream) {
          video.srcObject = stream;
          video.style.display = 'block';

          // Capture image from video stream
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');

          video.onplay = function() {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            requestAnimationFrame(function() {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            video.pause();
            stream.getTracks().forEach(track => track.stop()); // Stop the camera

            // Convert the canvas to a blob and upload it
            requestAnimationFrame(function() {
              setTimeout(function() {              
                canvas.toBlob((blob)=>{
                  scope.StreamingViewModelClient.UploadFile(nametobindto, scope.data.VMClassId.asString, blob, 'image.png');
                }, 'image/png');
              }, 50); // 50 milliseconds delay
            });
          });
          };
          
        })
        .catch(function(error) {
          console.error('Error accessing the camera:', error);
        });

}

function InstallTheDirectiveFor_takepicture(streamingAppController) {
    streamingAppController.directive('takepicture', ['$document', function ($document) {
            return {
                link: function (scope, element, attr) {
                    // THIS IS WHERE YOU SEE THE HTML(element) AND THE DATA (scope) FOR EVERYTHING THAT USE OUR DIRECTIVE (test1)
                    if (element[0].childElementCount>1){
                      nametobindto=element[0].attributes.viewmodelname.value;
                      let video=element[0].children[0];
                      let button=element[0].children[1];
                      button.onclick=()=>{
                        actuallyTakePicture(video,scope,nametobindto);
                      };
                    }
                }
            };
        }]);
    console.trace("takepicture component Loaded");
}
InstallTheDirectiveFor_takepicture(angular.module(MDrivenAngularAppModule));