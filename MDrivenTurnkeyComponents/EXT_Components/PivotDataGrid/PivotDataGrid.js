let _therootpivot;
let _therootpivotinvalidated=false;

function InvalidatePivot(){
	if (_therootpivot!=undefined){
		if(_therootpivotinvalidated)
			return;
		_therootpivotinvalidated=true;
		setTimeout(() => {
			  RefreshPivot(_therootpivot);
			  _therootpivotinvalidated=false;
			}, 200);
		
	}
}

function RefreshPivot(therootpivot){

		let my2DArray = Array.from({ length: therootpivot.XAxis.length+2 }, () =>
		  Array.from({ length: therootpivot.YAxis.length+2 }, (_, j) => ({ IsTaken: false }))
		);
		for (var i = 0; i < therootpivot.Values.length; i++) {
			let thevalue=therootpivot.Values[i];
			RefreshPivotOneValueX(thevalue,therootpivot);
			RefreshPivotOneValueY(thevalue,therootpivot);			
			my2DArray[thevalue.LocalXGrid][thevalue.LocalYGrid].IsTaken=true;
		}	
		
		let arrayOfEmpties=[];
		for (var xx = 0; xx < therootpivot.XAxis.length+1; xx++) {
			for (var yy = 0; yy < therootpivot.YAxis.length+1; yy++) {
				if (my2DArray[xx][yy].IsTaken){
					
				}
				else if (yy<=1 || xx<=1){
					my2DArray[xx][yy].IsTaken=true;
				}
				else{					
				    let empty=my2DArray[xx][yy];
					empty.LocalXGrid=xx;
					empty.LocalYGrid=yy;
					arrayOfEmpties.push(empty)
				}
			}
		}
		//debugger;
		therootpivot.LocalEmpties=arrayOfEmpties;
		
}

function RefreshPivotOneValueX(oneValue,therootpivot){

	for (var ii = 0; ii < therootpivot.XAxis.length; ii++) {
		if(therootpivot.XAxis[ii].HeaderKey==oneValue.X){
		
			oneValue.LocalXGrid=ii+1;
			break;
		}
	}
}

function RefreshPivotOneValueY(oneValue,therootpivot){

	for (var ii = 0; ii < therootpivot.YAxis.length; ii++) {
		if(therootpivot.YAxis[ii].HeaderKey==oneValue.Y){
		
			oneValue.LocalYGrid=ii+1;
			break;
		}
	}	
}


function InstallTheDirectiveFor_pivotdatagrid(streamingAppController) {
	streamingAppController.directive('pivotdatagrid', ['$document', function ($document) {
            return {
                link: function (scope, element, attr) {
                    // THIS IS WHERE YOU SEE THE HTML(element) AND THE DATA (scope) FOR EVERYTHING THAT USE OUR DIRECTIVE (test1)
					//debugger;
					_therootpivot=scope.data;  
					scope.$watch('data.Values', function (newv, oldval, thescope) {
						if (_therootpivot==undefined || _therootpivot.Values == undefined)
							return;
						InvalidatePivot();
						//RefreshPivot(_therootpivot);						  
					});
						
                }
            };
        }]);
	streamingAppController.directive('pivotdatagridonevalue', ['$document', function ($document) {
            return {
                link: function (scope, element, attr) {
                    // THIS IS WHERE YOU SEE THE HTML(element) AND THE DATA (scope) FOR EVERYTHING THAT USE OUR DIRECTIVE (test1)
					//debugger;
					scope.$watch('row.X', function (newv, oldval, thescope) {
						InvalidatePivot();
						//RefreshPivotOneValueX(thescope.row, _therootpivot);						  
					});
					scope.$watch('row.Y', function (newv, oldval, thescope) {
						InvalidatePivot();
						//RefreshPivotOneValueY(thescope.row, _therootpivot);						  
					});
						
                }
            };
        }]);
    console.trace("pivotdatagrid component Loaded");
}
InstallTheDirectiveFor_pivotdatagrid(angular.module(MDrivenAngularAppModule));