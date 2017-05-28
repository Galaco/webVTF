Renderer = function(el) {
	this.container = el;
	this.camera;
	this.scene;
	this.sceneCube;
	this.renderer;
	this.light;
	this.textureLoader = new THREE.TextureLoader;
	this.canvasWidth = document.getElementById('renderer').offsetWidth;
	this.canvasHeight = document.getElementById('renderer').offsetHeight;
	this.pointLight;
	this.skybox;
	this.cubemapTexture;
	this.ambientLight;

	this.obj;
	this.plane;
	this.targetRotation = 0;
	
	this.baseTexture;

	this.init = function () {		
		//Camera
		this.camera = new THREE.PerspectiveCamera( 75, this.canvasWidth / this.canvasHeight, 1, 5000 );
		this.camera.position.y = 100;
		this.camera.position.z = 200;
		
		//Create our scenes
		this.scene = new THREE.Scene();
		this.sceneCube = new THREE.Scene();
		
		this.renderFloor();
		this.renderSky();
		this.renderLights();
		
		// Create our material tester object
		this.obj = new RenderObject();
		//this.obj.setCubeMap(this.cubemapTexture);
		this.scene.add( this.obj.mesh );
		
		
		//Create actual THREE renderer
		this.renderer = new THREE.WebGLRenderer({});
		this.renderer.setClearColor( 0x787878 );
		this.renderer.setPixelRatio( this.canvasWidth / this.canvasHeight );
		this.renderer.setSize( this.canvasWidth, this.canvasHeight );	
		this.renderer.autoClear = false;
		this.container.appendChild( this.renderer.domElement );
		
		//Just some external event handling (e.g. window resize)
		window.addEventListener( 'resize', $.proxy(function(e){
			this.canvasWidth = document.getElementById('renderer').offsetWidth;
			this.canvasHeight = document.getElementById('renderer').offsetHeight;	
			this.camera.aspect = this.canvasWidth / this.canvasHeight;
			this.camera.updateProjectionMatrix();
			
			this.renderer.setSize( this.canvasWidth, this.canvasHeight );
		}, this), false );
	}

	this.animate = function() {
		this.obj.update();
		
		requestAnimationFrame( $.proxy(this.animate, this) );
		this.renderFrame();
	}

	this.renderFrame = function() {
		this.renderer.render(this.sceneCube, this.camera);
		this.renderer.render( this.scene, this.camera );		
	}
	
	this.toggleAnimation = function() {
		this.obj.frozen = !this.obj.frozen;
	}
	
	this.renderFloor = function() {	
		var grid = new THREE.GridHelper( 800, 64 );
		grid.setColors( 0xffffff, 0xffffff );
		this.scene.add( grid );
	}
	
	this.renderSky = function() {
		//3kybox (for cubemaps)
		// urls of the images, one per half axis
		var urls = [
		  '/assets/img/sky/skybox_ft.jpg',	//-Z
		  '/assets/img/sky/skybox_bk.jpg',	//+Z
		  '/assets/img/sky/skybox_up.jpg',	//+Y
		  '/assets/img/sky/skybox_dn.jpg',	//-Y
		  '/assets/img/sky/skybox_rt.jpg',	//+X
		  '/assets/img/sky/skybox_lf.jpg'	//-X
		];
		this.cubemapTexture = new THREE.CubeTextureLoader().load(urls);
		this.cubemapTexture.format = THREE.RGBFormat;
		
		var shader = THREE.ShaderLib[ "cube" ];
        shader.uniforms[ "tCube" ].value = this.cubemapTexture;
		
        var material = new THREE.ShaderMaterial( {
          fragmentShader: shader.fragmentShader,
          vertexShader: shader.vertexShader,
          uniforms: shader.uniforms,
          depthWrite: false,
		  side: THREE.BackSide
        });
		
        this.skybox = new THREE.Mesh( new THREE.CubeGeometry( 600, 600, 600 ), material );
        this.skybox.flipSided = true;
        this.sceneCube.add(this.skybox);
	}
	
	this.renderLights = function() {
        this.ambientLight = new THREE.AmbientLight( 0xffffff );
        this.scene.add(this.ambientLight);
        this.pointLight = new THREE.PointLight( 0xffffff, 2 );
        this.scene.add( this.pointLight );
		
		var sphere = new THREE.SphereGeometry( 100, 16, 8 );
		var mesh = new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xffaa00 } ) );
		mesh.scale.set( 0.05, 0.05, 0.05 );
		this.pointLight.add(mesh);
	}
}






//Our MechaSourceEngine material emulation object.
RenderObject = function(){
	//Just static (post-init) data
	this.geometry;
	this.mesh;
	this.material;
	this.frozen = true;
	
	/**
	 *	Shader params. If the shader changes, rebuild from these
	 */
	//Textures
	this.diffuseMap = -1;
	this.bumpMap = -1;
	this.specularMap = -1;
	this.phongMap = -1;
	this.cubeMap;
	
	this.opacity = 1;
	this.translucent = 0;
	
	
	
	//Initialise object
	this.init = function() {
		this.geometry = new THREE.BoxGeometry( 100, 100, 100 );
		this.material = new THREE.MeshBasicMaterial( 
			{ color: 0xffffff, overdraw: 0.5 } );
		this.mesh = new THREE.Mesh( this.geometry, this.material );
		this.mesh.position.y = 100;
		this.mesh.dynamic = true;
	}
	this.init();
	
	this.update = function() {
		if (!this.frozen) {
			this.mesh.rotation.x += .02;
			this.mesh.rotation.y += .01;
		}
	}
	
	//This is where we build our full renderable
	this.setMaterial = function(material) {
	}
	
	
	/**
	 * Functions below here will usually only be called by functions above here.
	 * Imagine private functions that have specific use cases for publicity.
	 *
	 */
	 
	 //Set material (based on shader)
	 this.setShader = function(shaderName) {
		if (shaderName == 'unlitgeneric') {
			this.material = new THREE.MeshBasicMaterial();
			this.mesh.material = this.material;
		} else if (shaderName == 'vertexlitgeneric' || shaderName == 'lightmappedgeneric') {
			this.material = new THREE.MeshLambertMaterial();
			this.mesh.material = this.material;
		} else {
			alert('VMTEasy does not support the specified shader: ' + shaderName);
		}
	 }
	
	//Set texture data.
	//Set baseTexture
	this.setDiffuseMap = function() {
		this.mesh.material.map = this._loadTexture(this.diffuseMap);
		this.diffuseMap = this.mesh.material.map;
		this._markForUpdate(this.diffuseMap);
	}
	//Set Bump Map
	this.setBumpMap = function() {
		this.mesh.material.bumpMap = this._loadTexture(this.bumpMap);
		this.bumpMap = this.mesh.material.bumpMap;
		this._markForUpdate(this.bumpMap);
	}
	//Set Specular Map
	this.setSpecularMap = function() {
		this.mesh.material.specularMap = this._loadTexture(this.normalMap);
		this.specularMap = this.mesh.material.specularMap;
		this._markForUpdate(this.specularMap);
	}
	//Set phongmap
	this.setPhongMap = function() {
		this.mesh.material.phongMap = this._loadTexture(this.phongMap);
		this.phongMap = this.mesh.material.phongMap;
		this._markForUpdate(this.phongMap);
	}
	
	this.setOpacity = function(opacity) {
		if (opacity < 1) {
			this.mesh.material.transparent = true;
		} else {
			this.mesh.material.transparent = false;
			
		}
		this.opacity == opacity;
		this.mesh.material.opacity = opacity;
		this._markForUpdate(this.diffuseMap);
	}
	
	this.setTranslucent = function(translucent) {
		if (translucent == '1') {
			this.mesh.material.transparent = true;
			this.translucent = true;
		}
		this._markForUpdate(this.diffuseMap);
	}
	
	this.setCubeMap = function(tex) {
		if (tex) {
			this.cubemapTexture = tex;
			this.mesh.material.envMap = this.cubemapTexture;
		} else {
			this.cubemapTexture = null;
			this.mesh.material.envMap = null;
		}
		
		this.mesh.material.needsUpdate = true;
	}
	
	
	
	
	
	
	/**
	 * HELPER Functions
	 * Below here are functions largely created to help reduce duplication, 
	 * or provide generic functionality
	 */
	this._loadTexture = function() {
		//Updated stored texture
		return new THREE.Texture(document.getElementById('image_canvas'));
	}
	
	this._markForUpdate = function(target) {
		target.needsUpdate = true;
		this.mesh.material.needsUpdate = true;
	}
}