
function InitDragDrop(inputElement) {
	  const dropZoneElement = inputElement.closest(".drop-zone");

	  dropZoneElement.addEventListener("click", (e) => {
		inputElement.click();
	  });

	  inputElement.addEventListener("change", (e) => {
		if (inputElement.files.length) {
		  updateThumbnail(dropZoneElement, inputElement.files[0]);
		}
	  });

	  dropZoneElement.addEventListener("dragover", (e) => {
		e.preventDefault();
		dropZoneElement.classList.add("drop-zone--over");
	  });

	  ["dragleave", "dragend"].forEach((type) => {
		dropZoneElement.addEventListener(type, (e) => {
		  dropZoneElement.classList.remove("drop-zone--over");
		});
	  });

	  dropZoneElement.addEventListener("drop", (e) => {
		e.preventDefault();

		if (e.dataTransfer.files.length) {
		  inputElement.files = e.dataTransfer.files;
		  updateThumbnail(dropZoneElement, e.dataTransfer.files[0]);
		  var event = new Event('change');
		  inputElement.dispatchEvent(event);
		}

		dropZoneElement.classList.remove("drop-zone--over");
	  });
}

/**
 * Updates the thumbnail on a drop zone element.
 *
 * @param {HTMLElement} dropZoneElement
 * @param {File} file
 */
function updateThumbnail(dropZoneElement, file) {
  let thumbnailElement = dropZoneElement.querySelector(".drop-zone__thumb");

  // First time - remove the prompt
  if (dropZoneElement.querySelector(".drop-zone__prompt")) {
    dropZoneElement.querySelector(".drop-zone__prompt").remove();
  }

  // First time - there is no thumbnail element, so lets create it
  if (!thumbnailElement) {
    thumbnailElement = document.createElement("span");
    thumbnailElement.classList.add("drop-zone__thumb");
    dropZoneElement.appendChild(thumbnailElement);
  }

  thumbnailElement.dataset.label = file.name;

  // Show thumbnail for image files
  if (file.type.startsWith("image/")) {
    const reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onload = () => {
      thumbnailElement.style.backgroundImage = `url('${reader.result}')`;
    };
  } else {
    thumbnailElement.style.backgroundImage = null;
  }
}

function InstallTheDirectiveFor_DragDropUpload(streamingAppController) {
    streamingAppController.directive('ddupload', ['$document', function ($document) {
            return {
				link: function (scope, element, attr) {
					
					InitDragDrop(element[0]);
					
                    element.bind('change', function () {
						scope.StreamingViewModelClient.UploadFile(element[0].Target, element[0].VMClassId, element[0].Data, element[0].FileName);
					});
					/*
                    element.bind('change', function () {
                        const maxSizeInBytes = 100000000;
                        var nrExpectedFiles = element[0].files.length;
                        var filesToUpload = [];
                        angular.forEach(element[0].files, function (item) {
                            if (maxSizeInBytes === 0 || item.size <= maxSizeInBytes) {
                                const filereader = new FileReader();
                                const filename = item.name;
                                const vmclassid = scope.data.VMClassId.asString;
                                const viewModelName = scope.data.ViewModelName;
                                const target = viewModelName + '.AttachmentUploadTarget'; // CHANGE IF NOT APPLICABLE

                                filereader.onloadend = function (loadendevent) {
                                    var data = loadendevent.target.result;
                                    var fileToUpload = {
                                        Target: target,
                                        VMClassId: vmclassid,
                                        Data: data,
                                        FileName: filename
                                    };
                                    filesToUpload.push(fileToUpload);
                                    if (filesToUpload.length == nrExpectedFiles) {
                                        UploadFiles(filesToUpload, scope);
                                    }
                                };

                                filereader.onabort = function (abortevent) {
                                    filesToUpload = [];
                                    nrExpectedFiles = -1;
                                };

                                filereader.onerror = function (erroevent) {
                                    nrExpectedFiles--;
                                    if (filesToUpload.length == nrExpectedFiles) {
                                        UploadFiles(filesToUpload, scope);
                                    }
                                };

                                filereader.readAsArrayBuffer(item);    
                            } else {
                                window.alert(item.name + " is larger than " + maxSizeInBytes + " bytes, can't upload.");
                            }
						});
					});*/
				}
			}	
        }]);
		
    console.trace("DragDropUpload");
}

InstallTheDirectiveFor_DragDropUpload(angular.module(MDrivenAngularAppModule));
