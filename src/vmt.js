exportVMT = function() {
	var rootNode,
		parentNode,
		node;
	$('[id^=param_]').each(function(index, element){
			var e = $(element);
			node = new Ika.List(e.prev().text(), e.val());
			if (!parentNode) {
				parentNode = node;
				rootNode = parentNode;
			} else {
				node.setParent(parentNode);
				parentNode.addChild(node);
			}
	});	
	
	function indent(level) {
		indents = '';
		while (level > 0) {
			indents += '\t';
			level -= 1;
		}
		return indents;
	}
	
	function it(node, response, tier) {
		if (node.children.length > 0) {
			response += indent(tier-1);
			response += ('"' + node.value + '"\n');
			response += indent(tier-1);
			response += '{\n';
			++tier;
			node.children.forEach(function(child){
				response = it(child, response, tier);
			});
			response += indent(tier-1);
			response += '}\n';
		} else {	
			if (node.value != '' && node.value != '-1') {
				response += indent(tier);
				response += ('"' + node.key + '"\t"' + node.value + '"\n');
			}
		}
		
		return response;
	}
	
	response = it(rootNode, '', 0);
	var filename = $('#output-filename').val();
	if (!filename) {
		filename = 'vmteasy.vmt';
	} else {
		if (filename.indexOf('.vmt') === -1) {
			filename += '.vmt';
		}
	}
	saveToClient(filename, response);
}

importVMT = function() {
	
}

saveToClient = function(filename, data) {
    var blob = new Blob([data], {type: 'text/palin'});
    if(window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, filename);
    }
    else{
        var elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.download = filename;        
        document.body.appendChild(elem)
        elem.click();        
        document.body.removeChild(elem);
    }
}