define(  ['client/views/WorldConstants'], function(WorldConstants) {
			
    return sp.Class.create('InteractiveWorldObject', sp.EventDispatcher, {
        constructor: function InteractiveWorldObject(artAssetLibrary, uiAssetLibrary, data, world){
			sp.EventDispatcher.call(this);
			
            this._worldCoords = new sp.Point(data.x, data.y);
			this._world = world;
			
			this._view = new sp.Sprite();
			
			this.recalculateLocalCoords();
			
			this._view.addEventListener( sp.MouseEvent.MOUSE_DOWN, this.onObjectClicked );
			this._view.addEventListener( sp.TouchEvent.TOUCH_BEGIN, this.onObjectClicked );
			
			this._view.addEventListener( sp.MouseEvent.MOUSE_UP, this.onObjectReleased, true );
			this._view.addEventListener( sp.TouchEvent.TOUCH_END, this.onObjectReleased, true );
			
			// Do Popup Stuff
			this.createPopup( uiAssetLibrary );
			this.setupPopup();
        },
        properties: {
			"_view": null,
			"_worldCoords": null,
			"_world": null,
			"_popup": null
        },
        methods: {
			view: {
				get: function get_view(){
					return this._view;
				}
			},
			popupClass: {
				get: function get_popupClass(){
					return "ItemPopup";
				}
			},
			popup: {
				get: function get_popup(){
					return this._popup;
				}
			},
			interactionPoint: {
				get: function get_interactionPoint(){
					return this._worldCoords.clone();
				}
			},
			createPopup: function createPopup(uiAssetLibrary){
				var popupClass = uiAssetLibrary.getDefinition( this.popupClass );
				this._popup = new popupClass();
			},
			setupPopup: function setupPopup(){
				// Abstract Function... override...
			},
			preparePopup: function preparePopup(){
				// Abstract Function... override...
			},
			tearDownPopup: function tearDownPopup(){
				// Abstract Function... override...
			},
			setAsSelected: function setAsSelected(){
				this._world.currentlySelectedObject = this;
				var newLabel = this._mc.currentLabel;
				if( !/_selected$/.test( this._mc.currentLabel ) )
					newLabel += "_selected";
				
				this._mc.gotoAndStop(newLabel);
			},
			deSelect: function deSelect(){
				this.hidePopup();
				this._mc.gotoAndStop( this._mc.currentLabel.replace("_selected","") );
			},
			showPopup: function showPopup(){
				this.preparePopup();
				this._world._foreground.addChild( this.popup );
			},
			hidePopup: function hidePopup(){
				if( this.popup.parent )
					this.popup.parent.removeChild( this.popup );
				this.tearDownPopup();
			},
			worldCoords: {
				get: function get_worldCoords(){
					return this._worldCoords;
				}
			},
			recalculateLocalCoords: function recalculateLocalCoords(){
				this._view.x = WorldConstants.TILE_WIDTH*(this._worldCoords.y - this._worldCoords.x)/2;
				this._view.y = WorldConstants.TILE_HEIGHT*(this._worldCoords.x + this._worldCoords.y)/2;
			},
			moveBy: function moveBy( vector ){
				this._worldCoords.x += vector.x;
				this._worldCoords.y += vector.y;
				
				var oldYValue = this._view.y;
				this.recalculateLocalCoords();
				this._world.updateSortableObject( this, oldYValue );
			},
			onObjectClicked: function onObjectClicked( event ){
				// Clicked the object
				console.log("Abstract Class clicked");
			},
			onObjectReleased: function onObjectReleased( event ){
				// Released the object
			},
			width: {
				get: function width(){
					return 0;
				}
			},
			height: {
				get: function height(){
					return 0;
				}
			}
        }
    });
});