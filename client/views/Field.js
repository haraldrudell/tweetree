define( ['client/views/InteractiveWorldObject', 'client/views/WorldConstants'], function(InteractiveWorldObject, WorldConstants) {
	var TIME_TO_GROW	= 60000;
	var TIME_TO_COLLECT = 60000;
    return sp.Class.create('Field', InteractiveWorldObject, {
        constructor: function Field(artAssetLibrary, uiAssetLibrary, data, world){
			InteractiveWorldObject.call(this, artAssetLibrary, uiAssetLibrary, data, world);

			
			
			this._planted = data.planted || 0;
			this._crop = data.crop || "";
			this._plowed = data.plowed;
			
			var FieldMC = artAssetLibrary.getDefinition("Field");
			this._mc = new FieldMC();
			if( this.isFallow() ){
				this._mc.gotoAndStop("fallow");
			}else if( this.isPlowed() ){
				this._mc.gotoAndStop("plowed");
			}else if( this.isGrowing() ){
				this._mc.gotoAndStop("seeds");
				this.onGrowingTimerTick();
			}else if( this.isMature() ){
				this._mc.gotoAndStop( this._crop );
			}else if( this.isWithered() ){
				this._mc.gotoAndStop( this._crop + "_withered" );
			}else{
				throw new Error("Unknown field state");
			}
			
			this._view.addChild( this._mc );
        },
		properties: {
			"_planted": 0,
			"_mc": null,
			"_crop": null,
			"_plowed": false,
			"_cropChooserPopup": null,
			"_normalPopup": null,
			"_timer": null
		},
		prebound: {
			onObjectClicked: function onObjectClicked( event ){
			},
			onObjectReleased: function onObjectReleased( event ){
				this.setAsSelected();
				
				this.showPopup();
			},
			onPopupActionButtonClicked: function onPopupActionButtonClicked(event){
				this.popup.popupButton.gotoAndStop("up");
				
				if( this.isFallow() ){
					this._world.player.clearTrailingWalkActions();
					this._world.player.walkTo( this.interactionPoint );
					this._world.player.plowField( this );
				}else if( this.isMature() ){
					this._world.player.clearTrailingWalkActions();
					this._world.player.walkTo( this.interactionPoint );
					this._world.player.harvestField( this );
				}else if( this.isWithered() ){
					this._world.player.clearTrailingWalkActions();
					this._world.player.walkTo( this.interactionPoint );
					this._world.player.clearField( this );
				}
				this.preparePopup();
			},
			onGrowingTimerTick: function onGrowingTimerTick(event){
				var percentGrown = (1+this.percentGrown);
				if( percentGrown < 100 ){
					this._normalPopup.progressBar.gotoAndStop( percentGrown );
				}else{
					this._timer.removeEventListener( sp.TimerEvent.TIMER, this.onGrowingTimerTick );
					this.becomeMature();
				}
			},
			onWitheringTimerTick: function onWitheringTimerTick(event){
				this._timer.removeEventListener( sp.TimerEvent.TIMER, this.onWitheringTimerTick );
				this.becomeWithered();
			}
		},
        methods: {
			view: {
				get: function get_view(){
					return this._view;
				}
			},
			interactionPoint: {
				get: function get_interactionPoint(){
					return this._worldCoords.add( new sp.Point(-1,1) );
				}
			},
			crop: {
				get: function get_crop(){
					return this._crop;
				}
			},
			initGrowingTimer: function initGrowingTimer(){
				if( !this._timer ){
					this._timer = new sp.Timer(1000);
				}else{
					this._timer.stop();
				}
				this._timer.delay = TIME_TO_GROW / 100;
				var self = this;
				this._timer.addEventListener( sp.TimerEvent.TIMER, this.onGrowingTimerTick );
				this._timer.start();
			},
			initWitheringTimer: function initWitheringTimer(){
				if( !this._timer ){
					this._timer = new sp.Timer(1000);
				}else{
					this._timer.stop();
				}
				this._timer.delay = TIME_TO_GROW + TIME_TO_COLLECT - this.millisecondsSincePlanted();
				var self = this;
				this._timer.addEventListener( sp.TimerEvent.TIMER, this.onWitheringTimerTick );
				this._timer.start();
			},
			createPopup: function(uiAssetLibrary){
				var normalPopupClass = uiAssetLibrary.getDefinition( "ItemPopup" );
				var cropChooserPopupClass = uiAssetLibrary.getDefinition( "CropChooser" );
				
				this._cropChooserPopup = new cropChooserPopupClass();
				this._normalPopup = new normalPopupClass();
			},
			percentGrown: {
				get: function get_percentGrown(){
					return Math.round( 100*(this.millisecondsSincePlanted() / TIME_TO_GROW) );
				}
			},
			setupPopup: function setupPopup(){
				// Normal Popup
				this._normalPopup.x = this._view.x;
				this._normalPopup.y = this._view.y;
				
				var button = this._normalPopup.popupButton;
				
				var onMouseDown = function onMouseDown(event){
					button.gotoAndStop("down");
				};
				
				button.addEventListener( sp.MouseEvent.MOUSE_DOWN, onMouseDown );
				button.addEventListener( sp.TouchEvent.TOUCH_BEGIN, onMouseDown );
				
				button.addEventListener( sp.MouseEvent.MOUSE_UP, this.onPopupActionButtonClicked );
				button.addEventListener( sp.TouchEvent.TOUCH_END, this.onPopupActionButtonClicked );
				
				button.gotoAndStop("up");
				
				
				// Crop Chooser Popup
				this._cropChooserPopup.x = this._view.x;
				this._cropChooserPopup.y = this._view.y;
				
				var self = this;
				['tomatoes', 'corn', 'wheat', 'sunflower', 'carrots'].forEach( function(crop){
					var buttonName = crop.concat("Button");
					var cropButton = this._cropChooserPopup[ buttonName ];
					
					cropButton.gotoAndStop("up");
					
					var buttonDownListener = function buttonDownListener(event){
						cropButton.gotoAndStop("down");
					};
					
					var buttonUpListener = function buttonUpListener(event){
						cropButton.gotoAndStop("up");
						self.goPlantCrop( crop );
					};
					
					cropButton.addEventListener( sp.MouseEvent.MOUSE_DOWN, buttonDownListener );
					cropButton.addEventListener( sp.TouchEvent.TOUCH_BEGIN, buttonDownListener );
					
					cropButton.addEventListener( sp.MouseEvent.MOUSE_UP, buttonUpListener );
					cropButton.addEventListener( sp.TouchEvent.TOUCH_END, buttonUpListener );
					
					
				}, this );
			},
			preparePopup: function preparePopup(){
				if( this.isFallow() ){
					if( this._world.player.intendsToPlow(this) ){
						this.applyConfig( this._normalPopup, {
							itemName: "PLOWING",
							progressBar: {
								progressText: "PLOWING",
								frame: 1
							},
							popupButton: false
						});
					}else{
						this.applyConfig( this._normalPopup, {
							itemName: "FALLOW FIELD",
							progressBar: false,
							popupButton: {
								actionText: "PLOW"
							}
						});
					}
					this._popup = this._normalPopup;					
				}else if( this.isPlowed() ){
					var intendedCrop = this._world.player.intendsToPlant( this );
					if( intendedCrop ){
						this.applyConfig( this._normalPopup, {
							itemName: intendedCrop.toUpperCase(),
							progressBar: {
								progressText: "PLANTING...",
								frame: 1
							},
							popupButton: false
						});
						this._popup = this._normalPopup;
					}else{
						this._popup = this._cropChooserPopup;
					}
				}else if( this.isGrowing() ){
					this.applyConfig( this._normalPopup, {
						itemName: this.crop.toUpperCase(),
						progressBar: {
							progressText: "GROWING...",
							frame: (1+this.percentGrown)
						},
						popupButton: false
					});
					this._popup = this._normalPopup;
				}else if( this.isMature() ){
					if( this._world.player.intendsToHarvest( this ) ){
						this.applyConfig( this._normalPopup, {
							itemName: this.crop.toUpperCase(),
							progressBar: {
								progressText: "HARVESTING...",
								frame: 1
							},
							popupButton: false
						});
					}else{
						this.applyConfig( this._normalPopup, {
							itemName: this.crop.toUpperCase(),
							progressBar: false,
							popupButton: {
								actionText: "HARVEST"
							}
						});
					}
					this._popup = this._normalPopup;
				}else if( this.isWithered() ){
					if( this._world.player.intendsToClear( this ) ){
						this.applyConfig( this._normalPopup, {
							itemName: "CLEARING",
							progressBar: {
								progressText: "CLEARING...",
								frame: 1
							},
							popupButton: false
						});
					}else{
						this.applyConfig( this._normalPopup, {
							itemName: "WITHERED",
							progressBar: false,
							popupButton: {
								actionText: "CLEAR"
							}
						});
					}
					this._popup = this._normalPopup;
				}else{
					throw new Error("Unknown field state");
				}
			},
			tearDownPopup: function tearDownPopup(){
				// Abstract Function... override...
			},
			goPlantCrop: function goPlantCrop( crop ){
				this.hidePopup();
				
				this._world.player.cancelAllQueuedTasks();
				var route = this._world.findRoute( this._world.player.nextWaypoint(), this._worldCoords.add( new sp.Point(-1, 1) ) );
				this._world.player.walkRoute( route );
				this._world.player.plantCrop( this, crop );
				this.showPopup();
			},
			applyConfig: function applyConfig( element, config ){
				for( var key in config ){
					if( key == 'frame' ){
						element.gotoAndStop(config[key]);
						continue;
					}
					var child = element[key];
					if( config[key] === false ){
						child.visible = false;
					}else{
						child.visible = true;
						if( typeof config[key] == 'string' ){
							child.text = config[key];
						}else{
							applyConfig( child, config[key] );
						}
					}
				}
			},
			showNormalPopup: function showNormalPopup( config ){
				this.applyConfig( this._normalPopup, config );
				this._popup = this._normalPopup;
				this.showPopup();
			},
			becomePlanted: function becomePlanted( crop ){
				this.hidePopup();
				
				this._crop = crop;
				this._plowed = false;
				this._planted = (new Date()).valueOf();
				this._mc.gotoAndStop("seeds");
				this.initGrowingTimer();
			},
			becomeFallow: function becomeFallow(){
				this.hidePopup();
				
				this._crop = null;
				this._plowed = false;
				this._mc.gotoAndStop("fallow");
			},
			beHarvested: function beHarvested(){
				this._timer.removeEventListener( sp.TimerEvent.TIMER, this.onWitheringTimerTick );
				this.becomeFallow();
			},
			updateProgressAmount: function updateProgressAmount( percent ){
				this.popup.progressBar.gotoAndStop( 1 + Math.round(percent) );
			},
			becomePlowed: function becomePlowed(){
				this.hidePopup();
				
				this._plowed = true;
				this._mc.gotoAndStop("plowed");
			},
			becomeMature: function becomeMature(){
				this.hidePopup();
				
				this._mc.gotoAndStop( this.crop );
				
				this.initWitheringTimer();
			},
			becomeWithered: function becomeWithered(){
				this.hidePopup();
				
				this._mc.gotoAndStop( this.crop + "_withered" );
				if( this._world.player.intendsToHarvest(this) ){
					this._world.player.cancelAllQueuedTasks();
				}
			},
			
			recalculateLocalCoords: function recalculateLocalCoords(){
				this._view.x = WorldConstants.TILE_WIDTH*(this._worldCoords.y - this._worldCoords.x)/2;
				this._view.y = WorldConstants.TILE_HEIGHT*(this._worldCoords.x + this._worldCoords.y - 1)/2;
			},
			
			millisecondsSincePlanted: function timeSincePlanted(){
				return (new Date().valueOf() - this._planted);
			},
			isFallow: function isFallow(){
				return !this._crop && !this._plowed;
			},
			isPlowed: function isPlowed(){
				return !this._crop && this._plowed;
			},
			isGrowing: function isGrowing(){
				return (this.millisecondsSincePlanted() < TIME_TO_GROW);
			},
			isMature: function isMature(){
				return (this.millisecondsSincePlanted() >= TIME_TO_GROW) && !this.isWithered();
			},
			isWithered: function isWithered(){
				return (this.millisecondsSincePlanted() >= (TIME_TO_GROW + TIME_TO_COLLECT));
			},
			width: {
				get: function width(){
					return 2;
				}
			},
			height: {
				get: function height(){
					return 2;
				}
			}
        }
    });
});
