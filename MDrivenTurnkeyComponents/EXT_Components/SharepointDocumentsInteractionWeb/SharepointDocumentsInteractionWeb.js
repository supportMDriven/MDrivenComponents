function InstallTheDirectiveFor_SharepointDocs(streamingAppController) {
    streamingAppController.directive('sharepointdocumentsinteractionwebpastebutton', ['$document', function ($document) {
            return {
                link: function (scope, element, attr) {
                    // THIS IS WHERE YOU SEE THE HTML(element) AND THE DATA (scope) FOR EVERYTHING THAT USE OUR DIRECTIVE (test1)
					
				let myTextbox = document.getElementById("sharepointcopyfromclipresult");
				let thebutton=element[0];
				let buttonscope=scope;
				thebutton.addEventListener("click", async () => {
					try {
						// Use the Async Clipboard API to read text from the clipboard
						const clipboardText = await navigator.clipboard.readText();
						//myTextbox.value = clipboardText;
						buttonscope.data.WebDocRefUrlAdd=clipboardText;
						buttonscope.data.ViewData.Execute(buttonscope.data.VMClassId.VMClassName,'AddDocRef',null)
						debugger;
					} catch (error) {
						console.error("Error reading clipboard:", error);
					}
				});

                }
            };
        }]);
    console.trace("sharepointdocumentsinteractionwebpastebutton component Loaded");
}
InstallTheDirectiveFor_SharepointDocs(angular.module(MDrivenAngularAppModule));