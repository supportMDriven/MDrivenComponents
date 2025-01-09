/**
 * Binds a TinyMCE widget to <textarea> elements.
 */
angular.module('ui.tinymce', [])
  .value('uiTinymceConfig', {})
  .directive('uiTinymce', ['$rootScope', '$compile', '$timeout', '$window', '$sce', '$http', 'uiTinymceConfig', 'uiTinymceService', 'getUserOptions', function ($rootScope, $compile, $timeout, $window, $sce, $http, uiTinymceConfig, uiTinymceService, getUserOptions) {
    uiTinymceConfig = uiTinymceConfig || {};
    if (uiTinymceConfig.baseUrl) {
      tinymce.baseURL = uiTinymceConfig.baseUrl;
    }

    return {
      require: ['ngModel', '^?form'],
      priority: 599,
      link: function (scope, element, attrs, ctrls) {
        if (!$window.tinymce) {
          return;
        }

        var ngModel = ctrls[0],
          form = ctrls[1] || null;

        var expression, options = {
          debounce: true
        }, tinyInstance,
          updateView = function (editor) {
            var content = editor.getContent({ format: options.format }).trim();
            content = $sce.trustAsHtml(content);

            ngModel.$setViewValue(content);
            if (!$rootScope.$$phase) {
              scope.$digest();
            }
          };

        function toggleDisable(disabled) {
          if (disabled) {
            ensureInstance();

            if (tinyInstance) {
              tinyInstance.getBody().setAttribute('contenteditable', false);
            }
          } else {
            ensureInstance();

            if (tinyInstance && !tinyInstance.settings.readonly && tinyInstance.getDoc()) {
              tinyInstance.getBody().setAttribute('contenteditable', true);
            }
          }
        }

        // fetch a unique ID from the service
        var uniqueId = uiTinymceService.getUniqueId();
        attrs.$set('id', uniqueId);

        expression = {};

        angular.extend(expression, scope.$eval(attrs.uiTinymce));

        //Debounce update and save action
        var debouncedUpdate = (function (debouncedUpdateDelay) {
          var debouncedUpdateTimer;
          return function (ed) {
            $timeout.cancel(debouncedUpdateTimer);
            debouncedUpdateTimer = $timeout(function () {
              return (function (ed) {
                if (ed.isDirty()) {
                  ed.save();
                  updateView(ed);
                }
              })(ed);
            }, debouncedUpdateDelay);
          };
        })(400);

        var userOptions = getUserOptions || {};

        var setupOptions = {
          // Update model when calling setContent
          // (such as from the source editor popup)
          setup: function (ed) {
            ed.on('init', function () {
              ngModel.$render();
              ngModel.$setPristine();
              ngModel.$setUntouched();
              if (form) {
                form.$setPristine();
              }
            });

            // Update model when:
            // - a button has been clicked [ExecCommand]
            // - the editor content has been modified [change]
            // - the node has changed [NodeChange]
            // - an object has been resized (table, image) [ObjectResized]
            ed.on('ExecCommand change NodeChange ObjectResized', function () {
              if (!options.debounce) {
                ed.save();
                updateView(ed);
                return;
              }
              debouncedUpdate(ed);
            });

            ed.on('blur', function () {
              element[0].blur();
              ngModel.$setTouched();
              if (!$rootScope.$$phase) {
                scope.$digest();
              }
            });

            ed.on('remove', function () {
              element.remove();
            });

            if (uiTinymceConfig.setup) {
              uiTinymceConfig.setup(ed, {
                updateView: updateView
              });
            }

            if (expression.setup) {
              expression.setup(ed, {
                updateView: updateView
              });
            }
          },
          format: expression.format || 'html',
          selector: '#' + attrs.id,
          plugins: userOptions.plugins || '',
          toolbar: userOptions.toolbar || '',
		  // Addition for file picker if image insert is enabled in TinyMCE
		  // enable title field in the Image dialog
		  image_title: true, 
		  // enable automatic uploads of images represented by blob or data URIs
		  automatic_uploads: true,
		  // add custom filepicker only to Image dialog
		  file_picker_types: 'image',
		  file_picker_callback: function(cb, value, meta) {
			var input = document.createElement('input');
			input.setAttribute('type', 'file');
			input.setAttribute('accept', 'image/*');

			input.onchange = function() {
			  var file = this.files[0];
			  var reader = new FileReader();
			  
			  reader.onload = function () {
				var id = 'blobid' + (new Date()).getTime();
				var blobCache =  tinymce.activeEditor.editorUpload.blobCache;
				var base64 = reader.result.split(',')[1];
				var blobInfo = blobCache.create(id, file, base64);
				blobCache.add(blobInfo);

				// call the callback and populate the Title field with the file name
				cb(blobInfo.blobUri(), { title: file.name });
			  };
			  reader.readAsDataURL(file);
			};
			
			input.click();
		  }
		  // END OF Addition for file picker if image insert is enabled in TinyMCE
        };


        // extend options with initial uiTinymceConfig and
        // options from directive attribute value
        angular.extend(options, uiTinymceConfig, expression, setupOptions);
        // Wrapped in $timeout due to $tinymce:refresh implementation, requires
        // element to be present in DOM before instantiating editor when
        // re-rendering directive
        $timeout(function () {
          if (options.baseURL) {
            tinymce.baseURL = options.baseURL;
          }
          var maybeInitPromise = tinymce.init(options);
          if (maybeInitPromise && typeof maybeInitPromise.then === 'function') {
            maybeInitPromise.then(function () {
              toggleDisable(scope.$eval(attrs.ngDisabled));
            });
          } else {
            toggleDisable(scope.$eval(attrs.ngDisabled));
          }
        });

        ngModel.$formatters.unshift(function (modelValue) {
          return modelValue ? $sce.trustAsHtml(modelValue) : '';
        });

        ngModel.$parsers.unshift(function (viewValue) {
          return viewValue ? $sce.getTrustedHtml(viewValue) : '';
        });

        ngModel.$render = function () {
          ensureInstance();

          var viewValue = ngModel.$viewValue ?
            $sce.getTrustedHtml(ngModel.$viewValue) : '';

          // instance.getDoc() check is a guard against null value
          // when destruction & recreation of instances happen
          if (tinyInstance &&
            tinyInstance.getDoc()
          ) {
            tinyInstance.setContent(viewValue);
            // Triggering change event due to TinyMCE not firing event &
            // becoming out of sync for change callbacks
            tinyInstance.fire('change');
          }
        };

        attrs.$observe('disabled', toggleDisable);

        // This block is because of TinyMCE not playing well with removal and
        // recreation of instances, requiring instances to have different
        // selectors in order to render new instances properly
        var unbindEventListener = scope.$on('$tinymce:refresh', function (e, id) {
          var eid = attrs.id;
          if (angular.isUndefined(id) || id === eid) {
            var parentElement = element.parent();
            var clonedElement = element.clone();
            clonedElement.removeAttr('id');
            clonedElement.removeAttr('style');
            clonedElement.removeAttr('aria-hidden');
            tinymce.execCommand('mceRemoveEditor', false, eid);
            parentElement.append($compile(clonedElement)(scope));
            unbindEventListener();
          }
        });

        scope.$on('$destroy', function () {
          ensureInstance();

          if (tinyInstance) {
            tinyInstance.remove();
            tinyInstance = null;
          }
        });

        function ensureInstance() {
          if (!tinyInstance) {
            tinyInstance = tinymce.get(attrs.id);
          }
        }
      }
    };
  }])
  .service('uiTinymceService', [
    /**
     * A service is used to create unique ID's, this prevents duplicate ID's if there are multiple editors on screen.
     */
    function () {
      var UITinymceService = function () {
        var ID_ATTR = 'ui-tinymce';
        // uniqueId keeps track of the latest assigned ID
        var uniqueId = 0;
        // getUniqueId returns a unique ID
        var getUniqueId = function () {
          uniqueId++;
          return ID_ATTR + '-' + uniqueId;
        };
        // return the function as a public method of the service
        return {
          getUniqueId: getUniqueId
        };
      };
      // return a new instance of the service
      return new UITinymceService();
    }

  ])
  .factory('getUserOptions', ['$http', 'uiTinymceConfig', function ($http) {
    var userOptions = {
      plugins: '',
      toolbar: ''
    };

    $http.get(tinymce.baseURL + '/userOptions.json')
      .then(function (response) {
        var data = response.data;
        userOptions.plugins = data.plugins || '';
        userOptions.toolbar = data.toolbar || '';
      })
      .catch(function (error) {
        throw new Error(error);
      });

    return userOptions;
  }]);

// Push the module into the MDrivenAngularAppModule (hack way)
angular.module(MDrivenAngularAppModule).requires.push('ui.tinymce');

