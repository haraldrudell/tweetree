define( ['client/managers/SoundManager'], function(SoundManager){
	
	return sp.Class.create('Hud', {
		constructor: function Hud( world, stage, uiAssetLibrary ){
			this._world = world;
			world.player.addEventListener( "xpUpdated", this.onXpChanged );
			world.player.addEventListener( "levelUp", this.onLevelUp );
			world.player.addEventListener( "coinsUpdated", this.onCoinsChanged );
			world.player.addEventListener( "woodUpdated", this.onWoodChanged );
			
			this._stage = stage;
			
			var HudMC = uiAssetLibrary.getDefinition("Hud");
			this._view = new HudMC();
			this._slider = this._view.rightCenter;
			this._slider.zoomSliderHandle.addEventListener( sp.MouseEvent.MOUSE_DOWN, this.onSliderTouchBegin );
			this._slider.zoomSliderHandle.addEventListener( sp.TouchEvent.TOUCH_BEGIN, this.onSliderTouchBegin );
			
			this._settingsMenu = this._view.rightTop;
			this.makeToggleButton( this._settingsMenu.optionsSFX, function(state){
				SoundManager.toggleSoundEffects();
			} );
			this.makeToggleButton( this._settingsMenu.optionsMusic, function(state){
				SoundManager.toggleBackgroundMusic();
			} );
			this._playerStats = this._view.leftTop;
			
			this._playerStats.progressBar.gotoAndStop( 1 + this._world.player.levelUpPercent );
			this._playerStats.progressBar.level_Number.text = this._world.player.level;
			this._playerStats.coins.label.text = this._world.player.coins;
			this._playerStats.wood.label.text = this._world.player.wood;
		},
		properties: {
			"_view": null,
			"_uiAssetLibrary": null,
			"_currentPopup": null,
			"_slider": null,
			"_stage": null,
			"_startY": 0,
			"_muteButton": null,
			"_playerStats": null,
			"_world": null
		},
		prebound: {
			onMusicButtonTouchBegin: function onMusicButtonTouchBegin( event ){
				this._stage.addEventListener( sp.MouseEvent.MOUSE_UP, this.onMusicButtonTouchEnd );
				this._stage.addEventListener( sp.TouchEvent.TOUCH_END, this.onMusicButtonTouchEnd );
			},
			onMusicButtonTouchEnd: function onMusicButtonTouchEnd( event ){				
				this._stage.removeEventListener( sp.MouseEvent.MOUSE_UP, this.onMusicButtonTouchEnd, true );
				this._stage.removeEventListener( sp.TouchEvent.TOUCH_END, this.onMusicButtonTouchEnd, true );
				
				SoundManager.toggleBackgroundMusic();
			},
			onSliderTouchBegin: function onSliderTouchBegin( event ){
				this._touchBeginLocation = new sp.Point(event.stageX, event.stageY);
				this._startY = this._slider.zoomSliderHandle.y;
				
				this._stage.addEventListener( sp.MouseEvent.MOUSE_MOVE, this.onSliderTouchMove, true );
				this._stage.addEventListener( sp.TouchEvent.TOUCH_MOVE, this.onSliderTouchMove, true );
				
				this._stage.addEventListener( sp.MouseEvent.MOUSE_UP, this.onSliderTouchEnd );
				this._stage.addEventListener( sp.TouchEvent.TOUCH_END, this.onSliderTouchEnd );
			},
			onSliderTouchMove: function onSliderTouchMove( event ){
				var deltaY = (event.stageY - this._touchBeginLocation.y);
				var slideValue = Math.max( Math.min( this._startY + deltaY, 80 ), -80 );
				
				var zoom = Math.pow( 2, -slideValue / 80 );
				this._world.camera.zoom = zoom;
				
				this._slider.zoomSliderHandle.y = slideValue;
			},
			onSliderTouchEnd: function onSliderTouchEnd( event ){
				this._stage.removeEventListener( sp.MouseEvent.MOUSE_MOVE, this.onSliderTouchMove, true );
				this._stage.removeEventListener( sp.TouchEvent.TOUCH_MOVE, this.onSliderTouchMove, true );
				
				this._stage.removeEventListener( sp.MouseEvent.MOUSE_UP, this.onSliderTouchEnd, true );
				this._stage.removeEventListener( sp.TouchEvent.TOUCH_END, this.onSliderTouchEnd, true );
			},
						onCoinsChanged: function onCoinsChanged(event){
				this._playerStats.coins.label.text = event.target.coins;
			},
			onXpChanged: function onXpChanged(event){
				this._playerStats.progressBar.gotoAndStop( 1 + event.target.levelUpPercent );
			},
			onWoodChanged: function onWoodChanged(event){
				this._playerStats.wood.label.text = event.target.wood;
			},
			onLevelUp: function onLevelUp(event){
				this._playerStats.progressBar.level_Number.text = event.target.level;
				this._playerStats.progressBar.gotoAndStop( 1 + event.target.levelUpPercent );
			}
		},
		methods: {
			view: {
				get: function get_view(){
					return this._view;
				}
			},
			currentPopup: {
				get: function get_currentPopup(){
					return this._currentPopup;
				},
				set: function set_currentPopup(value){
					if( this._currentPopup ){
						this._view.removeChild( this._currentPopup );
					}
					this._currentPopup = value;
					this._view.addChild( value );
				}
			},
			showCropSelectionDialog: function showCropSelectionDialog( field ){
				var CropChooser = this._uiAssetLibrary.getDefinition("CropChooser");
				var cropSelector = new CropChooser();
				this.currentPopup = cropSelector;
				var coords = this._view.globalToLocal( field.view.localToGlobal( new sp.Point(0,0) ) );
				cropSelector.x = coords.x;
				cropSelector.y = coords.y;
				
				var listenerFunction = function(event){
					var cropName = /^button_(.*)$/.exec(event.currentTarget.name)[1];
					field.plantCrop( cropName );
				};
					
				['button_Sunflower', 'button_Tomato', 'button_Corn', 'button_Carrot', 'button_Wheat'].forEach( function(key){
					var button = cropSelector[key];
					button.gotoAndStop("up");
					
					button.addEventListener( sp.MouseEvent.CLICK, listenerFunction );
					button.addEventListener( sp.TouchEvent.TOUCH_BEGIN, listenerFunction );
				}, this );
			},
			makeToggleButton: function makeToggleButton(button, callback){
				var state = true;
				function stateToString(){
					return state ? "on" : "off";
				}
				button.gotoAndStop(stateToString() + "_up");
				
				function onButtonInteractionBegin(event){
					event.currentTarget.gotoAndStop(stateToString() + "_down");
				}
				button.addEventListener( sp.MouseEvent.MOUSE_DOWN, onButtonInteractionBegin );
				button.addEventListener( sp.TouchEvent.TOUCH_BEGIN, onButtonInteractionBegin );
				
				function onButtonInteractionEnd(event){
					state = !state;
					event.currentTarget.gotoAndStop(stateToString() + "_up");
					callback( state );
				}
				button.addEventListener( sp.MouseEvent.MOUSE_UP, onButtonInteractionEnd );
				button.addEventListener( sp.TouchEvent.TOUCH_END, onButtonInteractionEnd );
			},
			makeButton: function makeButton(button, callback){
				button.gotoAndStop("up");
				button.addEventListener( sp.MouseEvent.MOUSE_DOWN, function(event){
					event.currentTarget.gotoAndStop("down");
				});
				button.addEventListener( sp.MouseEvent.MOUSE_UP, function(event){
					event.currentTarget.gotoAndStop("up");
				});
			}
		}
	});
});
