define( ['client/managers/SoundManager', 'client/views/InteractiveWorldObject'], function(SoundManager, InteractiveWorldObject) {
    return sp.Class.create('Tree', InteractiveWorldObject, {
        constructor: function Tree(artAssetLibrary, uiAssetLibrary, data, world){
			this._chops = data.chops;
			this._variety = data.variety;
			this._stage = data.stage;
			
            InteractiveWorldObject.call(this, artAssetLibrary, uiAssetLibrary, data, world);
			
			var TreeClass = artAssetLibrary.getDefinition(data.variety + "Tree" + data.stage);
			this._mc = new TreeClass();
			this._mc.gotoAndStop("chop");
			this._mc.stump.gotoAndStop( 1 + data.chops );
			this._view.addChild( this._mc );
        },
		properties: {
			"_chops": 0,
			"_variety": null,
			"_stage": null,
			"_mc": null
		},
		prebound: {
			onObjectClicked: function onObjectClicked( event ){
			},
			onObjectReleased: function onObjectReleased( event ){
				this.setAsSelected();
				
				this.showPopup();
			},
			onChopButtonTouchBegin: function onChopButtonTouchBegin(event){
				this._popup.popupButton.gotoAndStop("down");
			},
			onChopButtonClicked: function onChopButtonClicked(event){
				this._popup.popupButton.gotoAndStop("up");
				this._world.player.walkTo(this.interactionPoint);
				this._world.player.chopTree(this);
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
			goChopTree: function goChopTree(){
				this._world.player.cancelAllQueuedTasks();
				var route = this._world.findRoute( this._world.player.nextWaypoint(), this._worldCoords.add( new sp.Point(-1, 1) ) );
				this._world.player.walkRoute( route );
				this._world.player.chopTree( this );
				this.hidePopup();
			},
			width: {
				get: function width(){
					return 1;
				}
			},
			height: {
				get: function height(){
					return 1;
				}
			},
			addChop: function addChop(){
				this._chops += 1;
				this._mc.stump.gotoAndStop( 1 + this._chops );
				this._popup.itemRemaining.text = this._chops.toString(10) + " / 5";
				if( this.isStump ){
					this._mc.gotoAndPlay("fall");
					
					var clip = this._mc;
					this._mc.addEventListener( sp.Event.ENTER_FRAME, function(event){
						if(clip.currentLabel != "fall"){
							clip.stop();
							event.currentTarget.removeEventListener( event.type, arguments.callee );
						}
					});
				}
			},
			isStump: {
				get: function get_isStump(){
					return this._chops >= 5;
				}
			},
			setupPopup: function setupPopup(){
				this._popup.x = this._view.x;
				this._popup.y = this._view.y - 100;
				this._popup.popupButton.addEventListener( sp.MouseEvent.MOUSE_DOWN, this.onChopButtonTouchBegin );
				this._popup.popupButton.addEventListener( sp.TouchEvent.TOUCH_BEGIN, this.onChopButtonTouchBegin );
				
				this._popup.popupButton.addEventListener( sp.MouseEvent.MOUSE_UP, this.onChopButtonClicked );
				this._popup.popupButton.addEventListener( sp.TouchEvent.TOUCH_END, this.onChopButtonClicked );
				this._popup.progressBar.visible = false;
				this._popup.popupButton.actionText.text = "CHOP";
				this._popup.popupButton.gotoAndStop("up");
				this._popup.itemName.text = this._variety + " TREE";
				this._popup.itemRemaining.text = this._chops.toString(10) + " / 5";
			}
        }
    });
});
