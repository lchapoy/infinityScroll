'use strict';

/**
 * @ngdoc function
 * @name infinityScrollApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the infinityScrollApp
 */
angular.module('infinityScrollApp')
	.constant({
		'baseUrl':'https://www.reddit.com/r',
	  })
  .controller('MainCtrl', function (imageServ,$scope) {
	 				$scope.options={
					  'id':'pics',
					  'limit':10,
					  'count':10,
					  'sort':'top',
					  'time':'week'
				}
	 
	  console.log()
	  
	
  }) .factory('imageServ',function($resource,baseUrl){
		
		var resource=$resource(baseUrl+'/:id'+'/top.json',
			{'id':'@id','limit':'@limit','count':'@count','after':'@after','before':'@before','sort':'@sort','t':'@time'},{ get: { method: 'GET'}});
		
		var get=function(obj){
			return resource.get(obj);
		}
		
		  return{
			getImages:get
		  };
  }).directive("loadImages",function(imageServ){
	  return{
		  templateUrl:"../../views/images.html",
		  scope:{options:"="},
		  link:function(scope,el,attr){

				var container=angular.element(el.find('div')[1]);
				
				scope.images={};
				var charging=true;
				var number=0;
				var after=[],before=[];
				
				imageServ.getImages(scope.options).$promise.then(function(data){
					var imgData=data.data.children;
					var div=angular.element('<div>');
					console.log(div[0])
					after[0]=(data.data.after);
					
					for(var i=0;i<imgData.length;i++){
						var img=new Image()
						//scope.images[i]=
						if(imgData[i].data.preview)
						
							img.src=(imgData[i].data.preview.images[0].source.url);
						else{
							img.src=(imgData[i].data.url+'.jpg')
						}
						if((scope.options.limit-1)==i)
							angular.element(img).on('load',function(){
								charging=false;
								number++;
							})
								
							
						img.className='loopImages';
						div.append(img)
					}
					container.append(div)
					
					
				})
				
				var checker=false;
				var hei=[0],lastHeight=0;
				
			    var checkScroll = function(evt) {
					var rectObject = el[0].getBoundingClientRect();
					//Check Scroll DOWN
					if (rectObject.bottom <= window.innerHeight+2000&&!charging) {
						console.log("trigger 2",rectObject.bottom,window.innerHeight)
						
						//Update variables
						charging=true;
						hei[number]=rectObject.height;
						scope.options.after=after[number-1];
						//Delete options
						delete scope.options.before;
						imageServ.getImages(scope.options).$promise.then(function(data){
							
							var imgData=data.data.children;
							after[number]=(data.data.after);
							before[number-1]=(data.data.before);
							var div=angular.element('<div>');
							for(var i=0;i<imgData.length;i++){
								var img=new Image()
								//Add new Group
								if(imgData[i].data.preview)
								img.src=imgData[i].data.preview.images[0].source.url;
								else{
								img.src=imgData[i].data.url+'.jpg'
								}
								img.className='loopImages';
								div.append(img)
								if((scope.options.limit-1)==i)
								angular.element(img).on('load',function(){
									charging=false;
									number++;
								})
							}
							
							container.append(div);
							//Update Variables
							if(checker){
								angular.element(container.find('div')[0]).remove();
								lastHeight=hei[number-1]+(hei[number]-hei[number-1])/3
								scope.height=hei[number-1];
							}
						
							checker=true
							
							
							
	
						})
						
					}
					
					// Check scrolling UP
					if (lastHeight >=(rectObject.height-rectObject.bottom)&&lastHeight!=0&&!charging) {
						console.log("trigger 1",lastHeight,rectObject.height-rectObject.bottom)
						charging=true;
						number--;
				
						scope.options.before=before[number-2];
						delete scope.options.after;
						
						imageServ.getImages(scope.options).$promise.then(function(data){
							var imgData=data.data.children;
							var div=angular.element('<div>');
							for(var i=0;i<imgData.length;i++){
								var img=new Image();
								if(imgData[i].data.preview)
								img.src=imgData[i].data.preview.images[0].source.url;
								else{
								img.src=imgData[i].data.url+'.jpg'
								}
								img.className='loopImages';
								div.append(img)
								
								if((scope.options.limit-1)==i)
								angular.element(img).on('load',function(){
									charging=false;
								})
								
							}
							container.prepend(div);
						
							if(hei[number-2]!=0)
								lastHeight=hei[number-2]+(hei[number-1]-hei[number-2])/3;
							else
								lastHeight=0;
							
							angular.element(container.find('div')[2]).remove();
							scope.height=hei[number-2];
							

							
						})
						
					}
					

			};	
			
			 angular.element(window).bind('scroll load', checkScroll);
		  }
	  }
  });
