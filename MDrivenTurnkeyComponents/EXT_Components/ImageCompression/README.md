# Image compression and upload

Image compression component allows to upload the image and compress it on client side. It helps to reduce the size of the uploaded image sent to the server in case of the bad bandwidth. 

Keep in mind that this component implements losefull compression (more compression = lower quality of the image)

You can configure component with help of the following HTML atttibutes on parent element:

| Attribute   | Value  | Description                                                              |
|-------------|--------|--------------------------------------------------------------------------|
| compression |        | Data-binding to your Blob attribute in Angular scope.                    |
| max-width   | number | Value in pixels for maximum image width after compression and resizing.  |
| max-height  | number | Value in pixels for maximum image height after compression and resizing. |
| format      | string | Format to save compressed image.                                         |
| preview     |        | Data-binding for image preview.                                          |