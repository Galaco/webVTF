$(document).ready(function(){
	window._renderer = new Renderer(document.getElementById('renderer'));
	window._renderer.init();
	window._renderer.animate();

//LAYOUT CONTROLLERS	
	$('.nav-sidebar > div').click(function(e) {
		$(this).toggleClass('active');
	});

//SIMULATION CONTROL BUTTONS	
	$('#btn-play').click(function(e) {
		$(e.target).toggleClass('glyphicon-play');
		$(e.target).toggleClass('glyphicon-pause');
		window._renderer.toggleAnimation();
	});

//LISTENER FOR PARAMETERS
	$('#vmt-import').click(function(e){
		$('#vmt-file').click();
	});	
	$('#vmt-file').change(function(e){
		importVMT();
	});	
	$('#vmt-export').click(function(e){
		exportVMT();
	});	
	$('[id^=param_]').change(function(e){
		processChange(e.target.id.split('_')[1], e.target);
	});	
	
	function processChange(param, element) {
		switch (param) {
//BASIC
			case 'shader':
				window._renderer.obj.setShader($(element).val().toLowerCase());
				break;
			case 'basetexture':
				readTexture(element.id);
				window._renderer.obj.setDiffuseMap();
				break;
//ADJUSTMENT
			//color
			
//TRANSPARENCY
			case 'alpha':
				window._renderer.obj.setOpacity(Number($(element).val()));
				break;
			case 'translucent':
				window._renderer.obj.setTranslucent($(element).val());
				break;

//LIGHTING
			case 'bumpmap':
				readTexture(element.id);
				window._renderer.obj.setBumpMap();
				break;
			//ssbump
			//bumptransform
			//selfillum
			//halflambert
			//ambientocclusion
			
//REFLECTIVITY
			//reflectivity
			//phong
			//phongexponent
			//phongexponenttexture
			//phongboost
			//phongfresnelangles
			
			case 'envmap':
				if ($(element).val() == 'env_cubemap') {
					window._renderer.obj.setCubeMap(window._renderer.cubemapTexture);
				} else {
					window._renderer.obj.setCubeMap()
				}
				break;
			case 'envmaptint':
				window._renderer.obj.setCubeMapTint($(element).val());
				break;
		}
	}
	
	
	
	
//JAVASCRIPT TEXTURE READER (uses vtf.js)
	function readTexture(target) {
		var x = document.getElementById(target),
			file = x.files[0],
			reader = new FileReader(),
			supportedExtensions = ['jpg', 'jpeg', 'gif', 'bmp', 'png'],
			c = document.getElementById('image_canvas');
			
		window._texture = c;
		var ctx = window._texture.getContext("2d");
			
		reader.onload = function () {
			var data = reader.result,
				ext = x.value.substr((~-x.value.lastIndexOf(".") >>> 0) + 2);
			if (ext == 'vtf') {
				t = OpenVTF.fromVTF(reader.result);
				
				window._texture.width = t.header.width;
				window._texture.height = t.header.height;
				var imgData = ctx.createImageData(t.header.width, t.header.height);
    
				for (i=0; i < t.image.rawData.length; i++) {
					imgData.data[i] = t.image.rawData[i];
				}
				ctx.putImageData(imgData, 0, 0);
			} else if (supportedExtensions.indexOf(ext) != -1) {
				var img = new Image;
				img.onload = function() {
					ctx.drawImage(img, 0, 0);
				}
			
				img.src = URL.createObjectURL(file);
			}
		}
		reader.readAsArrayBuffer(file);
	}
});

