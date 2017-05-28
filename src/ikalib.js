//Namespace
var Ika = {
	//ArrayIterator. Does what it sounds like
	//while(foo = bar.next()) { use foo }
	ArrayIterator: function(arr) {
		this.arr = arr;
		this.offset = -1;
		
		//Get contained array
		this.get = function() {
			return this.arr;
		}
		
		//Get next item
		this.next = function() {
			this.offset++;
			if (this.offset >= this.arr.length) {
				return false;
			}
			
			return this.arr[this.offset];
		}
		//Get previous item
		this.previous = function() {
			this.offset--;
			if (this.offset < 0) {
				return false;
			}
			
			return this.arr[this.offset];
		},
		//Get item at provided offset.
		this.at = function(position, shiftIteratorToLocation) {
			if (this.arr[position] === undefined) {
				return false;
			} else {
				if (shiftIteratorToLocation) {
					this.offset = position;
					return this.arr[this.offset];
				}
				return this.arr[position];
			}
		}
		//Get first item. Reset iterator
		this.first = function() {
			this.offset = 0;
			return this.arr[this.offset];
		}
		//Get last item. Move iterator to end
		this.last = function() {
			this.offset = this.arr.length-1;
			return this.arr[this.offset];
		}
	},
	
	

	List: function(key, value) {
		this.key = key;
		this.value = value;
		this.children = [];
		this.parent;
		
		this.addChild = function(child) {
			this.children.push(child);
		}
		
		this.setParent = function(parent) {
			this.parent = parent;
		}
		
		this.getParent = function() {
			return this.parent;
		}
		
		this.addData = function(data) {
			if (!this.key) {
				this.key = data;
			} else if (!this.value) {
				this.value = data;
			} else {
				//Broken syntax! Key/keypairs ONLY
			}
		}
		
		this.toArray = function() {
			var node = {};
			node.key = this.key;
			node.value = this.value;
			node.children = [];
			
			this.children.forEach(function(e){
				node.children.push(e.toArray());
			});
			
			return node;
		}
	}


};



//Various extensions to standard constructs
Number.prototype.clamp = function(min, max) {
  return Math.min(Math.max(this, min), max);
};