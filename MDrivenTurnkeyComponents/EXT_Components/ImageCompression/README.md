# Image compression and upload

Image compression component allows to upload the image and compress it on client side. It helps to reduce the size of the uploaded image sent to the server in case of the bad bandwidth. 

Keep in mind that this component implements lossy compression.

You can configure component with help of the following HTML atttibutes on parent element (`ImageCompression.cshtml`):

| Attribute   | Value  | Description                                                              |
|-------------|--------|--------------------------------------------------------------------------|
| compression |        | Data binding to Blob attribute in Angular scope.                         |
| preview     |        | Data binding for image preview.                                          |
| max-width   | number | Value in pixels for maximum image width after compression.               |
| max-height  | number | Value in pixels for maximum image height after compression.              |
| format      | string | Format to save compressed image. (png, jpeg)                             |