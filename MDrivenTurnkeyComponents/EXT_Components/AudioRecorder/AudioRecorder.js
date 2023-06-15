function InstallTheDirectiveFor_audioRecorder(streamingAppController) {
  streamingAppController.directive('audioRecorder', ['$document', function ($document) {
    return {
        restrict: 'A',
        link: function ($scope, $element, $attrs) {
          $scope.isRecording = false;
          const [vclassName, vcolName] = $attrs.audioRecorder.split('.');
          const controlButton = $element[0].querySelector('button');
          const audioRecorder = new AudioRecorder();
          $element[0].classList.add('tk-audio-recorder');
          
          controlButton.addEventListener('click', () => {
            if (!$scope.isRecording) {
              audioRecorder.start()
              .then(() => {
                $scope.isRecording = true;
                $scope.$apply();
              })
            } else {
              audioRecorder.stop()
                .then((audioBlob) => {
                  $scope.isRecording = false;
                  $scope.$apply();
                  const audioAsFile = new File([audioBlob], `Recorded_audio_${new Date().toISOString()}`);
                  if (audioAsFile.size > 0) {
                    $scope.$parent.onFileSelectCustom(audioAsFile, `${vclassName}.${vcolName}`, $scope.$parent.data.VMClassId);
                  }
                })
            }
          });
        },
        scope: {},
        template: `
          <div class="tk-audio-recorder__indicator" ng-show="isRecording"></div>
          <button type="button" class="tk-audio-recorder__action">
            <span class="tk-audio-recorder__text">{{isRecording ? 'Stop recording' : 'Start recording'}}</span>
            <span class="mi tk-audio-recorder__icon">{{isRecording ? 'stop' : 'mic'}}</span>
          </button>
        `
    };
  }]);
}


class AudioRecorder {
  constructor() {
    this.audioBlobs = [];
    this.mediaRecorder = null;
    this.streamBeingCaptured = null;
  }

  start() {
    if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
      return Promise.reject(new Error('mediaDevices API or getUserMedia method is not supported in this browser'))
    } else {
      return navigator.mediaDevices.getUserMedia({audio: true})
        .then((stream) => { 
          this.streamBeingCaptured = stream;
          this.mediaRecorder = new MediaRecorder(stream);
          this.#clearBlobs();

          this.mediaRecorder.addEventListener('dataavailable', (event) => {
            this.audioBlobs.push(event.data);
          });


          this.mediaRecorder.start();
        })
    }
  }

  stop() {
    return new Promise(resolve => {
      const mimeType = this.mediaRecorder.mimeType;

      this.mediaRecorder.addEventListener('stop', () => {
        const audioBlob = new Blob(this.audioBlobs, {type: mimeType});
        resolve(audioBlob);
      });

      this.mediaRecorder.stop();
      this.#stopStream();
      this.#resetRecordingProperties();
    });
  }

  cancel() {
    this.mediaRecorder.stop();
    this.#stopStream();
    this.#resetRecordingProperties();
  }

  #clearBlobs() {
    this.audioBlobs = [];
  }

  #stopStream() {
    this.streamBeingCaptured.getTracks().forEach(track => track.stop());
  }

  #resetRecordingProperties() {
    this.mediaRecorder = null;
    this.streamBeingCaptured = null;
  }
}



InstallTheDirectiveFor_audioRecorder(angular.module(MDrivenAngularAppModule));