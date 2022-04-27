#target Illustrator
if (app.documents.length>0) {
	//showDialog();
	makeGroups();
}
else alert('Cancelled by user');

//레이어 선택창
function showDialog(){

	var docRef = app.activeDocument;
	var layerSelect = [  {code:"all", name:'All Layers (except those beginning with - )'},
				{code:"none", name:'None (for use with \'Export Artboard Images\')'},
				{code:"selected", name:'Selected Items\' Layers'},
				{name:'---'} ];
				
				
       var dlg = new Window('dialog', 'Multi Exporter');
       var row;
	
	row = dlg.add('group', undefined, '')
	row.oreintation = 'row';
	row.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP]

	var typeSt = row.add('statictext', undefined, 'Export layers:'); 
	typeSt.size = [ 100,20 ];	
	
	var layerNames = [];
	
	for(var i=0; i<docRef.layers.length; i++){
		var layer = docRef.layers[i];
		layerNames.push((i+1)+": "+layer.name);
	}

	layerList = row.add('dropdownlist', undefined, layerNames);
	layerList.selection = findDataIndex(undefined, layerNames);

	// buttons row
	row = dlg.add('group', undefined, ''); 
	row.orientation = 'row'

	var cancelBtn = row.add('button', undefined, 'Cancel', {name:'cancel'});
	cancelBtn.onClick = function() { global.dlg.close() };


	// OK button
	var okBtn = row.add('button', undefined, 'Export', {name:'ok'});
	okBtn.onClick = function() { 
	
		var num = parseInt(layerList.selection);
		//alert(dirEt.text +" : "+docRef.layers[num] );
		makeGroups(docRef.layers[num].name); 
		dlog.close();
		
	};
	
	dlg.show();
}

//이미지 그룹화
function makeGroups(layerName){
	var groupItems = getSelectedItems();
	if(layerName) groupItems = getLayerItems(layerName);
	
	var exportLayer = app.activeDocument.layers.add();
    exportLayer.name = "exportLayer";
    exportLayer.visible = true;
	var groups = [];

	groupItems.sort(function(a, b){ return a.geometricBounds[0] - b.geometricBounds[0]; });
	for(var i = 0; i<groupItems.length; i++){
		var hasGroup = false;
		
		for(var j = 0; j<groups.length; j++){
			var dist = getDistance(groups[j], groupItems[i]);
			if(dist < 20){
				groupItems[i].duplicate(groups[j],ElementPlacement.PLACEATBEGINNING);
				//group 아이템의 zIndex를 newGroupZindex 배열에 저장. unshift는 맨 앞에 추가
				var newGroupZindex = groups[j].zIndex;
				newGroupZindex.unshift(groupItems[i].zIndex);
				//zIndex 배열을 group의 zIndex 속성에 추가
				groups[j].zIndex =	newGroupZindex;
				
				hasGroup = true;
				break;
			}
		}
		if(!hasGroup){
			var newGroup = app.activeDocument.groupItems.add();
			newGroup.move(exportLayer,ElementPlacement.PLACEATBEGINNING);
			groupItems[i].duplicate(newGroup,ElementPlacement.PLACEATBEGINNING);
			//group 아이템의 zIndex를 newGroupZindex 배열에 저장. unshift는 맨 앞에 추가
			//zIndex를 위한 배열을 따로 만드는 이유는 duplicate 하면서 아이템 객체를 따로 생성해 기존 zIndex가 날아감
			var newGroupZindex = [];
			newGroupZindex.unshift(groupItems[i].zIndex);
			//zIndex 배열을 group의 zIndex 속성에 추가
			newGroup.zIndex = newGroupZindex;
			
			groups.push(  newGroup );
		}
	}
	sortItems(groups, exportLayer);
	exportImage("exportLayer");
	exportLayer.remove();
}

//원래 레이어의 순서대로 정리해서 그룹 재구성
function sortItems(groups, exportLayer){
	
	//그룹들 돌면서 내부 아이템 zIndex로 재배열
	for(var i = 0; i<groups.length; i++){
		var arPageItems = [];
		//zIndex 값을 읽어 pageItem의 zIndex 속성에 추가
		for(var j = 0; j<groups[i].pageItems.length; j++){
			var curItem = groups[i].pageItems[j];
			var zIndex = groups[i].zIndex;
			groups[i].pageItems[j].zIndex = zIndex[j];
			arPageItems.push(curItem);
		}
		arPageItems.sort(function(a,b){ return a.zIndex - b.zIndex });
		
		var newGroup = app.activeDocument.groupItems.add();
		newGroup.move(exportLayer,ElementPlacement.PLACEATEND);
		for(var j = arPageItems.length-1; j>=0; j--){
			arPageItems[j].move(newGroup,ElementPlacement.PLACEATBEGINNING);
		}
	}
	
	for(var i = 0; i<groups.length; i++){
		groups[i].remove();
	}
}

function getSelectedItems(){
	var groupItems = [];
	
	for(var i = selection.length-1; i>=0; i--){
		selection[i].zIndex = i;
		groupItems.push(selection[i]);
	}
	return groupItems;
}

function getLayerItems(layerName){
	var document = app.activeDocument;
	var selectedLayer = document.layers[layerName];
	var groupItems = [];
	
	for(var i = 0; i<selectedLayer.pageItems.length; i++){
		groupItems.push(selectedLayer.pageItems[i]);
	}
	return groupItems;
}
	
//이미지들 사이의 거리 측정
function getDistance(s1, s2) {
	var bnd1 = s1.geometricBounds;
	var bnd2 = s2.geometricBounds;
	if(bnd1[0] > bnd2[0]){
		var temp = bnd1;
		bnd1 = bnd2;
		bnd2 = temp;
	}
	
	var isHoriz = bnd1[0] <= bnd2[0] && bnd2[0] <= bnd1[2];
	var horizDist = isHoriz?0:bnd2[0] - bnd1[2];    
	
	if(bnd1[3] > bnd2[3]){
		var temp = bnd1;
		bnd1 = bnd2;
		bnd2 = temp;
	}
	var isVert = bnd1[3] <=  bnd2[3] && bnd2[3] <= bnd1[1];
	var vertDist = isVert?0:bnd2[3] - bnd1[1];
	return horizDist + vertDist;
}

//특정 레이어의 도형들을 이미지로 익스포트
function exportImage(layerName) {
    var document = app.activeDocument;
    var afile = document.fullName;
    var filename = afile.name.split('.')[0];


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

    var n = document.groupItems.length;

    var selectedLayer = document.layers[layerName];
//Layer 선택
//1. 바로 밑 GroupItem 추출
//2. 각 그룹 아이템을 새로운 레이어에 저장
//3. 레이어별 파일 출
//4. 레이어 삭제
    hideAllLayers();
    for(var i = 0; i<selectedLayer.groupItems.length; i++){
        //1. 바로 밑 GroupItem 추출
        var groupItem = selectedLayer.groupItems[i];
        var newLayer = document.layers.add();
        newLayer.name = groupItem.name;
        newLayer.visible = true;
        //2. 각 그룹 아이템을 새로운 레이어에 저장
        groupItem.duplicate(newLayer,ElementPlacement.PLACEATBEGINNING);
        //3. 레이어별 파일 출력
		/*var d = new Date();
		var year = d.getFullYear();
		var month = d.getMonth()+1;
		var day = d.getDate();
		var hour = d.getHours();
		var min = d.getMinutes();
		var sec = d.getSeconds();
		var ms = d.getMilliseconds();
		var fileName = year+"-"+ month+"-"+day +" "+ hour+"."+min +"."+ sec +"."+ ms;*/
		var fileName = Date.now();
        var file = new File(folder.fsName + '/' +fileName+".png");
        document.exportFile(file,ExportType.PNG24,options);
        //4. 레이어 삭제
        newLayer.remove();
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
