function main(stage){
    require( ['client/views/Camera', 'client/views/World', 'client/views/Hud', 'client/helpers/UIScaleHelper', 'client/managers/SoundManager'], function( Camera, World, Hud, UIScaleHelper, SoundManager ){
		// Load Splash Screen		
		var splashLoader = new sp.Loader();
		var splashScreen;
		splashLoader.contentLoaderInfo.addEventListener( sp.Event.COMPLETE, function(event){
			var SplashScreen = event.target.applicationDomain.getDefinition("SplashScreen");
			splashScreen = new SplashScreen();
			UIScaleHelper.resizeThing( splashScreen, new sp.Point(1024,768), new sp.Point(stage.stageWidth,stage.stageHeight) );
			stage.addChild( splashScreen );
			
			sp.bridge.send('doneloading', null, null, null);
			
			event.target.removeEventListener( event.type, arguments.callee );
			
			startMainLoading(stage);
		});
		splashLoader.load( new sp.URLRequest("/content/Art/splash.swf") );
	
		function startMainLoading(stage){
			var artAssetLibrary, uiAssetLibrary, userData, bgMusic, chopSound;
			function checkIfLoadingComplete(){
				if( artAssetLibrary && uiAssetLibrary && userData && bgMusic && chopSound ){					
					var world = new World( artAssetLibrary, uiAssetLibrary, userData );
					var hud = new Hud( world, stage, uiAssetLibrary );
					
					stage.removeChild( splashScreen );

					stage.addChild( world.view );
					stage.addChild( hud.view );
					UIScaleHelper.resizeThing( hud.view, new sp.Point(1024,768), new sp.Point(stage.stageWidth,stage.stageHeight) );
				}
			}
		
			// Load Art Assets
			var artAssetLoader = new sp.Loader();
			artAssetLoader.contentLoaderInfo.addEventListener( sp.Event.COMPLETE, function(event){
				artAssetLibrary = event.target.applicationDomain;
			
				event.target.removeEventListener( event.type, arguments.callee );
			
				checkIfLoadingComplete();
			});
			artAssetLoader.load( new sp.URLRequest("/content/Art/gameassets.swf") );
		
			// Load UI Assets
			var uiAssetLoader = new sp.Loader();
			uiAssetLoader.contentLoaderInfo.addEventListener( sp.Event.COMPLETE, function(event){
				uiAssetLibrary = event.target.applicationDomain;
			
				event.target.removeEventListener( event.type, arguments.callee );
			
				checkIfLoadingComplete();
			});
			uiAssetLoader.load( new sp.URLRequest("/content/Art/Lincoln_Story_UI.swf") );
		
			// Load User Data
			var userDataLoader = new sp.URLLoader();
			userDataLoader.addEventListener( sp.Event.COMPLETE, function(event){
				userData = JSON.parse(event.target.data);
			
				event.target.removeEventListener( event.type, arguments.callee );
			
				checkIfLoadingComplete();
			});
			userDataLoader.load( new sp.URLRequest("/server/user_data.json") );
		
			// Load Sound
			var backgroundMusic = new sp.Sound( new sp.URLRequest("/content/Sound/Music/LS.mp3") );
			backgroundMusic.addEventListener( sp.Event.COMPLETE, function(event){
				bgMusic = backgroundMusic;
				
				SoundManager.addResource( "bgMusic", bgMusic );
				
				event.target.removeEventListener( event.type, arguments.callee );
			
				checkIfLoadingComplete();
			});
			
			// Load Sound Effects
			var chopSoundEffect = new sp.Sound( new sp.URLRequest("/content/Sound/SFX/Chop.wav") );
			chopSoundEffect.addEventListener( sp.Event.COMPLETE, function(event){
				chopSound = chopSoundEffect;
				
				SoundManager.addResource( "chop", chopSound );
				
				event.target.removeEventListener( event.type, arguments.callee );
				
				checkIfLoadingComplete();
			});
		}
    });
}