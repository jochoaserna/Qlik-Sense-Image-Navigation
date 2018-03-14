define( [
        'jquery',
        'text!./lib/css/main.css',
        'qlik',
        'ng!$q'
    ],
    function ( $, cssContent, qlik, $q ) {
        'use strict';
        $( '<style>' ).html(cssContent).appendTo( 'head' );
        var app = qlik.currApp();

        //app.variable.create('vNavigation');

        var imageFormattingHeader = {
            type: "items",
            label: "Image Formatting",
            items: {
                imageHorizontalAlign: {
                    type: "string",
                    ref: "props.image.horizontalAlign",
                    component: "buttongroup",
                    label: "Horizontal align",
                    optionas: [
                        {
                            value: "left",
                            label: "Left"
                        },
                        {
                            value: "center",
                            label: "Center"
                        },
                        {
                            value: "right",
                            label: "Right"
                        }
                    ],
                    defaultValue: "center"
                },
                imageVerticalAlign: {
                    type: "string",
                    ref: "props.image.verticalAlign",
                    component: "buttongroup",
                    label: "Vertical align",
                    options: [
                        {
                            value: "top",
                            label: "Top"
                        },
                        {
                            value: "middle",
                            label: "Middle"
                        },
                        {
                            value: "bottom",
                            label: "Bottom"
                        }
                    ],
                    defaultValue: "top"
                },
                imageAspectRatio: {
                    type: "string",
                    ref: "props.image.imageAspectRatio",
                    component: "dropdown",
                    label: "Image aspect ratio",
                    options: [
                        {
                            value: "keep",
                            label: "Keep size"
                        },
                        {
                            value: "bestfit30",
                            label: "Best fit 30%"
                        },
                        {
                            value: "bestfit50",
                            label: "Best fit 50%"
                        },
                        {
                            value: "bestfit70",
                            label: "Best fit 70%"
                        },
                        {
                            value: "bestfit100",
                            label: "Best fit 100%"
                        }
                    ],
                    defaultValue: "bestfit100"
                }
            },
        };

          var getSheetList = function () {

            var defer = $q.defer();

            app.getAppObjectList(function (data) {
              var sheets = [];
              var sortedData = _.sortBy(data.qAppObjectList.qItems, function (item) {
                return item.qData.rank;
              });
              _.each(sortedData, function (item) {
                sheets.push({
                  value: item.qInfo.qId,
                  label: item.qMeta.title
                });
              });
              return defer.resolve(sheets);
            });

            return defer.promise;
          };


          var action = {
            ref: "props.action",
            label: "Navigation Action",
            type: "string",
            component: "dropdown",
            default: "nextSheet",
            options: [
              {
                value: "none",
                label: "None"
              },
              {
                value: "nextSheet",
                label: "Go to next sheet"
              },
              {
                value: "prevSheet",
                label: "Go to previous sheet"
              },
              {
                value: "gotoSheet",
                label: "Go to a specific sheet"
              },
              {
                value: "comingfromSheet",
                label: "Coming from sheet"
              },
            ]
          };

          var sheetList = {
            type: "string",
            component: "dropdown",
            label: "Select Sheet",
            ref: "props.selectedSheet",
            options: function () {
              return getSheetList().then(function (items) {
                return items;
              });
            },
            show: function (layout) {
              return layout.props.action === 'gotoSheet';
            }
          };

        var selectedSheet = sheetList;

        var isActionsBefore = {
          type: "boolean",
          component: "switch",
          label: "Actions before navigating",
          ref: "props.isActionsBefore",
          defaultValue: false,
          options: [
            {
              value: true,
              label: "Enabled"
            },
            {
              value: false,
              label: "Disabled"
            }
          ]
        };

        var actionOptions = [
          {
            value: "none",
            label: "None"
          },
          {
            value: "clearAll",
            label: "Clear All Selections"
          },
        ];

        var actionBefore = {
          type: "string",
          component: "dropdown",
          label: "First Action",
          ref: "props.actionBefore",
          defaultValue: "none",
          show: function (data) {
            return data.props.isActionsBefore;
          },
          options: actionOptions
        };
    
        return {
            definition: {
                type: "items",
                component: "accordion",
                items: {
                    appearancePanel: {
                        uses: "settings",
                        items: {
                            MyMedia: {
                                label:"Image Selection",
                                component: "media",
                                ref: "myMedia",
                                layoutRef: "myMedia",
                                type: "string"
                            },
                            imageFormattingHeader: imageFormattingHeader,
                            behavior: {
                                type: "items",
                                label: "Navigation Behavior",
                                items: {
                                  action: action,
                                  sheetList: sheetList
                                }
                              },
                            actionsBefore: {
                              type: "items",
                              label: "Actions",
                              items: {
                                isActionsBefore: isActionsBefore,
                                actionBefore: actionBefore,
                              }
                            }

                        }
                    }
                }
            },


            paint: function ( $element, layout ) {
                $element.empty(); 
                console.info('paint >> layout >> ', layout); 
                var $msg = $( document.createElement( 'div' ) );

                var origUrl = window.location.href;
                var searchUrl= "/app/";
                var searchUrl2 = "/sheet/";
                var appId = "appcontent/"+ origUrl.substring(origUrl.indexOf(searchUrl)+searchUrl.length,origUrl.indexOf(searchUrl2)) + "/";
                var res = layout.myMedia;

                var searchUrl3 = "appcontent";
                var isAppContent = layout.myMedia.substring(0,layout.myMedia.indexOf(searchUrl3)+searchUrl3.length);

                if (isAppContent == "/appcontent" ){
                  var res = layout.myMedia.replace(/appcontent\/.*\//, appId);
                };

                var html = '<img id="'+layout.qInfo.qId+'" src="' + res +'" class="'+ layout.props.action+'-'+layout.qInfo.qId +' '+ layout.props.image.verticalAlign +' '+ layout.props.image.horizontalAlign +' '+ layout.props.image.imageAspectRatio +'" />';
                console.info('html: ', html);
                $msg.html( html );
                $element.append( $msg );

                $('.nextSheet-'+layout.qInfo.qId)
                  .css('cursor', 'pointer')
                  .click(
                    function(){
                      if (layout.props.actionBefore == "clearAll") {
                          app.clearAll();
                      };
                      qlik.navigation.nextSheet();// goes to next sheet
                      app.variable.setContent('vNavigation', qlik.navigation.getCurrentSheetId().sheetId);
                    }
                  );  
                 
                $('.prevSheet-'+layout.qInfo.qId)
                  .css('cursor', 'pointer')
                  .click(
                    function(){
                      if (layout.props.actionBefore == "clearAll") {
                          app.clearAll();
                      };
                      qlik.navigation.prevSheet();// goes to prev sheet
                      app.variable.setContent('vNavigation', qlik.navigation.getCurrentSheetId().sheetId);
                    }
                  );

                $('.gotoSheet-'+layout.qInfo.qId)
                  .css('cursor', 'pointer')
                  .click(
                    function(){
                      if (layout.props.actionBefore== "clearAll") {
                          app.clearAll();
                      };                      
                      qlik.navigation.gotoSheet(''+ layout.props.selectedSheet +'');// goes to the selected sheet
                      app.variable.setContent('vNavigation', qlik.navigation.getCurrentSheetId().sheetId);
                    }
                  );

                app.variable.getContent('vNavigation',function ( reply ) { 
                  $('.comingfromSheet-'+layout.qInfo.qId)
                    .css('cursor', 'pointer')
                    .click(
                      function(){
                      if (layout.props.actionBefore == "clearAll") {
                          app.clearAll();
                      };                        
                        qlik.navigation.gotoSheet(''+ reply.qContent.qString +'');// goes to the coming sheet
                        app.variable.setContent('vNavigation', qlik.navigation.getCurrentSheetId().sheetId);
                      }
                    );
                } );
            }
        };
    } );