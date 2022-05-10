#target Illustrator
if (app.documents.length>0) {
	showDialog();
}
else alert('Cancelled by user');

//레이어 선택창
function showDialog(){

	var docRef = app.activeDocument;
	var dlg = new Window('dialog', 'Replace Shape');
    var row;
	
	row = dlg.add('group', undefined, '')
	row.oreintation = 'row';
	row.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP]

	var lblFrom = row.add('statictext', undefined, 'From'); 
	lblFrom.size = [ 50,20 ];	
	
	var from = row.add('edittext', undefined, "");
    from.size = [ 150,20 ];
    row = dlg.add('group', undefined, '')
	row.oreintation = 'row';
	row.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP]

	var lblTo = row.add('statictext', undefined, 'To'); 
	lblTo.size = [ 50,20 ];	
	
	var to = row.add('edittext', undefined, "");
    to.size = [ 150,20 ];

	// buttons row
	row = dlg.add('group', undefined, ''); 
	row.orientation = 'row'

	var cancelBtn = row.add('button', undefined, 'Cancel', {name:'cancel'});
	cancelBtn.onClick = function() { global.dlg.close() };

	// OK button
	var okBtn = row.add('button', undefined, 'Replace', {name:'ok'});
	okBtn.onClick = function() { 
        replaceShape(from.text,to.text, selection);
		dlog.close();
	};
	
	dlg.show();
}

function replaceShape(from, to, array){
/*
From에 VAMP 넣고 To에 VAMP2 넣고 Replace 하면 기존 VAMP도형(DFS서치) 싹 찾아서 VAMP2로 교체. 위치 및 크기 똑같이 조정
*/
    alert(array.length);
    var fromShapes = [];
	var toShape = {};
    for (var i = 0; i < array.length; i++){
        var item = array[i];
		alert(item.typename);
        if(item.name == from){
            fromShapes.push(item);
        }else if(item.name == to){
            toShape = item;
        }else if(item.typename === "GroupItem"){
			var stack = [];
			stack.push(item);
			while(stack.length>0){
				var stkItem = stack.pop();
				for(var j = 0; j<stkItem.pageItems.length; j++){
					if(stkItem.pageItems[j].name == from){
						fromShapes.push(stkItem.pageItems[j]);
					}else if(stkItem.pageItems[j].name == to){
						toShape = stkItem.pageItems[j];
					}else if(stkItem.pageItems[j].typename === "GroupItem"){
						stack.push(stkItem.pageItems[j]);
					}
				}
			}
		}
    }
	alert(fromShapes.length)
	for(var i = 0; i<fromShapes.length; i++){
		var temp = toShape.duplicate(fromShapes[i].parent,ElementPlacement.PLACEATBEGINNING);
		temp.top = fromShapes[i].top;
		temp.left = fromShapes[i].left;
		temp.width = fromShapes[i].width;
		temp.height = fromShapes[i].height;
		
		//alert(fromShapes[i].zOrder(ZOrderMethod.SENDTOBACK));
		fromShapes[i].remove();
		
	}
	
	alert("Done")
	
	



}
