function installImageUploadCompressionDirective(appModule) {
  appModule.directive("compression", ['$document', function($document) {
    return {
      restrict: 'A',
      scope: {
        preview: '<preview'
      },
      link: ($scope, $element, $attrs) => {
        const [vclassName, vcolName] = $attrs.compression.split('.');

        $element.addClass('tk-image-upload');
        const input = $element[0].querySelector('input');
        const label = $element[0].querySelector('label');
        input.setAttribute('id', $attrs.compression);
        label.setAttribute('for', $attrs.compression);

        input.addEventListener('change', async (event) => {
          const uploadedImage = input.files[0];
          if (!uploadedImage) return;
          const imagePreview = $element[0].querySelector('img');
          imagePreview.setAttribute('id', `preview.${$attrs.compression}`);
          imagePreview.src = URL.createObjectURL(uploadedImage);
          const [width, height] = await getImageDimesnsions(imagePreview);

          const MAX_WIDTH = Number($attrs.maxWidth) || 800;
          const MAX_HEIGHT = Number($attrs.maxHeight) || 800;
          const TYPE = $attrs.format || 'jpeg';

          const widthRatioBlob = await compressImage(imagePreview, MAX_WIDTH / width, width, height, TYPE);
          const heightRatioBlob = await compressImage(imagePreview, MAX_HEIGHT / height, width, height, TYPE);

          const compressedBlob = widthRatioBlob.size > heightRatioBlob.size ? heightRatioBlob : widthRatioBlob;

          const compressedFileFromBlob = new File([compressedBlob], input.files[0].name + 'compressed' , {type: compressedBlob.type});
          if (!compressedFileFromBlob) return;
          $scope.$parent.onFileSelectCustom(compressedFileFromBlob, `${vclassName}.${vcolName}`, $scope.$parent.data.VMClassId);

          const optimalBlob = compressedBlob.size < uploadedImage.size ? compressedBlob : uploadedImage; 
  
          URL.revokeObjectURL(imagePreview);
        });

        function getImageDimesnsions(image) {
          return new Promise((resolve, reject) => {
            image.onload = function(e) {
              const width = image.width;
              const height = image.height;
              resolve([width, height]);
            }
          })
        }
        
        function compressImage(image, scale, initialWidth, initialHeight, type) {
          return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            canvas.width = scale * initialWidth;
            canvas.height = scale * initialHeight;
        
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(image, 0, 0, canvas.width, canvas.height);
        
            ctx?.canvas.toBlob((blob) => {
              resolve(blob);
            }, `image/${type}`);
          });
        }

      },
      template: `
      <div class="tk-image-upload__inner">
        <input type="file" class="tk-image-upload__native"/>
        <label class="tk-image-upload__interactive"></label>
        <img onerror="this.src = './Content/icons/fallback-image.svg'" ng-src="{{preview}}">
      </div>
      `
    }
  }])
}

installImageUploadCompressionDirective(angular.module(MDrivenAngularAppModule));