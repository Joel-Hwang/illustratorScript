#target Illustrator
if (app.documents.length>0) {
    exportImage();
}
else alert('Cancelled by user');

//특정 레이어의 도형들을 이미지로 익스포트
function exportImage() {
    var document = app.activeDocument;
    var afile = document.fullName;
    var folder = afile.parent.selectDlg("Export as CSS Layers (images only)...");
    if(!folder) return;
    var activeABidx = document.artboards.getActiveArtboardIndex();
    var activeAB = document.artboards[activeABidx]; // get active AB        
    var abBounds = activeAB.artboardRect;// left, top, right, bottom

    showAllLayers();
    var docBounds = document.visibleBounds;
    //activeAB.artboardRect = docBounds;

    var options = new ExportOptionsPNG24();
    options.antiAliasing = true;
    options.transparency = true;

    hideAllLayers();
	
    for(var i = 0; i<document.layers.length; i++){
	if(document.layers[i].pageItems.length == 0) continue;
        document.layers[i].visible = true;
		var fileName = document.layers[i].name;
        var file = new File(folder.fsName + '/' +fileName+".png");
        document.exportFile(file,ExportType.PNG24,options);
        document.layers[i].visible = false;
    }
    showAllLayers();
    //activeAB.artboardRect = abBounds;
}

function forEach(collection, fn){
    var n = collection.length;
    for(var i=0; i<n; ++i)
    {
        fn(collection[i]);
    }
}

function hideAllLayers(){
    forEach(app.activeDocument.layers, function(layer) {
        layer.visible = false;
    });
}
   
function showAllLayers(){
    forEach(app.activeDocument.layers, function(layer) {
         layer.visible = true;
    }); 
}

function findDataIndex(data, selectList){
	if(typeof(data)=="string" && parseInt(data).toString()==data){
		data = parseInt(data);
	}
	if(typeof(data)=="number"){
		return selectList.length+data;
	}else{
		for(var i=0; i<selectList.length; ++i){
			if(selectList[i].code==data){
				return i;
			}
		}
	}
	alert("no find: "+data);
}
