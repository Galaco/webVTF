Editor = function(el) {
	this.inputContainer = el;
	this.caret = new Caret(el);
	this.autoComplete = new AutoCompleter(el, this.caret);
	this.autoComplete.enableScopeCompletion();
	
	this.generateShaderStructure = function() {
		var text = this.inputContainer.value,
			textArray = text.replace(/["']/g, '').split(/[\s\t\n]/g);		
		
		//Do some simple checks for syntax validity before parsing. 
		//THIS ONLY CHECK PARENTHESES ARE PAIRED
		if (((text.match(/{/) || []).length != (text.match(/}/) || []).length) ||
			((text.match(/"/) || []).length % 2 != 0) ||
			((text.match(/'/) || []).length % 2 != 0)) {
			//One or more braces arent closed OR
			//Whatever quotes used closed improperly
			//return -1;
		}
		
		var arr = new Ika.ArrayIterator(textArray);
		var parentNode,
			node = new MaterialNode(),
			data = [];
			
		while((kv = arr.next()) !== false) {
			if (kv != "") {
				if (kv == '{') {
					parentNode = node;
					node = new Ika.List();
					node.setParent(parentNode);
					parentNode.addChild(node);
				} else if (kv == '}') {
					node = node.getParent();
				} else {
					if (node.key && node.value) {
						node = new MaterialNode();
						node.setParent(parentNode);
						parentNode.addChild(node);
					}
					node.addData(kv.replace(/["']/g, ""));
				}	
			}
					
		}
		return parentNode.toArray();
	}
}

//el: Container to work with
//caret: containers caret to control
AutoCompleter = function(el, caret) {
	this.container = el;
	this.caret = caret;
	
	this.enableScopeCompletion = function() {
		//Autoclose character pairs: "{('
		$(this.container).on('keypress', $.proxy(function(e) {
			var cO = ['"', '{', '(', '\''],
				cC = ['"', '}', ')', '\''],
				c = String.fromCharCode(e.which),
				cPos = this.caret.getPosition(),	
				loc = cO.indexOf(c);
			
			//Check if input matched		
			if (loc > -1) {
				var text1 = e.currentTarget.value.substring(0, cPos),
					text2 = e.currentTarget.value.substring(cPos);
					
				e.currentTarget.value = (text1 + c +cC[loc] + text2);
				this.caret.setPosition(cPos + 1);	
					
				e.preventDefault();
				e.stopPropagation();
			} else {
				loc = cC.indexOf(c);
				//Check if input matched		
				if (loc > -1 && (e.currentTarget.value.substring(cPos).substring(0,1) == cC[loc])) {				
					this.caret.setPosition(cPos + 1);
					
					e.preventDefault();
					e.stopPropagation();
				}
			}	
		},this));
	}
}

Caret = function(el) {
	this.container = el;
	
	this.getPosition = function () {
		var cur_pos = 0;
		if (this.container.selectionStart) { 
			cur_pos = this.container.selectionStart; 
		} else if (document.selection) { 
			this.container.focus(); 

			var r = document.selection.createRange(); 
			if (r != null) {
				var re = this.container.createTextRange(), 
					rc = re.duplicate(); 
				re.moveToBookmark(r.getBookmark()); 
				rc.setEndPoint('EndToStart', re); 

				cur_pos = rc.text.length; 
			}
		}		
		return cur_pos;
	}
	
	this.setPosition = function (pos) {
	  this.setSelectionRange(pos, pos);
	}

	this.setSelectionRange = function(selectionStart, selectionEnd) {
	  if (this.container.setSelectionRange) {
		this.container.focus();
		this.container.setSelectionRange(selectionStart, selectionEnd);
	  }
	  else if (this.container.createTextRange) {
		var range = this.container.createTextRange();
		range.collapse(true);
		range.moveEnd('character', selectionEnd);
		range.moveStart('character', selectionStart);
		range.select();
	  }
	}
}