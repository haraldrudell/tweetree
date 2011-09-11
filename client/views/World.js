define( ['client/views/WorldConstants', 'client/views/Tree', 'client/views/Field', 'client/views/Player', 'client/helpers/PathFinder', 'client/managers/SoundManager', 'client/views/Camera'], function(WorldConstants, Tree, Field, Player, PathFinder, SoundManager, Camera) {
	
    return sp.Class.create('World', {
        constructor: function World(artAssetLibrary, uiAssetLibrary, userData){
			this._view = new sp.Sprite();
		
			
			var self = this;
			this._view.addEventListener( sp.Event.ADDED_TO_STAGE, function(event){
				var s = event.target.stage;
				var camera = new Camera( self._view, new sp.Point(s.stageWidth/2, s.stageHeight/2) );
				self._camera = camera;
				event.currentTarget.removeEventListener( event.type, arguments.callee );
			});
			
      this._hasTwitter = false;
			this._uiAssetLibrary = uiAssetLibrary;
			this._artAssetLibrary = artAssetLibrary;
			
			this._background = new sp.Sprite();
			this._sortableObjects = new sp.Sprite();
			this._foreground = new sp.Sprite();
			
			this._view.addChild( this._background );
			this._view.addChild( this._sortableObjects );
			this._view.addChild( this._foreground );
			
			var Ground = artAssetLibrary.getDefinition("Ground");
			var ground = new Ground();
			this._background.addChild( ground );
			
			this._trees = userData.trees.map( function(treeData){
				var tree = new Tree(artAssetLibrary, uiAssetLibrary, treeData, this);
				this.addSortableObject( tree.view );
				return tree;
			}, this);
			
			this._fields = userData.fields.map( function(fieldData){
				var field = new Field(artAssetLibrary, uiAssetLibrary, fieldData, this);
				this.addSortableObject( field.view );
				return field;
			}, this);
						
			this._player = new Player( artAssetLibrary, uiAssetLibrary, userData.player, this );
			this.addSortableObject( this._player.view );
			
			this._pathFinder = new PathFinder("8");
			
			this._view.addEventListener( sp.MouseEvent.MOUSE_DOWN, this.onWorldInteractionBegin );
			this._view.addEventListener( sp.TouchEvent.TOUCH_BEGIN, this.onWorldInteractionBegin );
			
			this._view.addEventListener( sp.Event.ENTER_FRAME, this.onEnterFrame );
			
			SoundManager.startBackgroundMusic( "bgMusic" );
        },
        properties: {
			"_camera": null,
			"_hud": null,
			"_uiAssetLibrary": null,
			
			"_view": null,
			"_background": null,
			"_sortableObjects": null,
			"_foreground": null,
			"_player": null,
			
			"_currentlySelectedObject": null,
			
			"_mouseDownLocation": null,
			"_mouseDownOffset": null,
			
			"_trees": null,
			"_fields": null,
			
			"_cachedOccupiedRegions": null,
			
			"_pathFinder": null,
			
			"_originalScale": 1.0,
			"_originalAverageRadius": 1,
			"_fingers": {},
			"_fingerDownLocations": {},
			
			"_lastTick": null
        },
		prebound: {
			onWorldInteractionBegin: function onWorldInteractionBegin( event ){
				this._view.addEventListener( sp.MouseEvent.MOUSE_MOVE, this.onWorldDragStarted );
				this._view.addEventListener( sp.TouchEvent.TOUCH_MOVE, this.onWorldDragStarted );
				
				this._view.addEventListener( sp.MouseEvent.MOUSE_UP, this.onWorldClicked );
				this._view.addEventListener( sp.TouchEvent.TOUCH_END, this.onWorldClicked );
				
				this._mouseDownLocation = new sp.Point( event.stageX, event.stageY );
				this._mouseDownOffset = this._camera.center;
			},
			onWorldDragStarted: function onWorldDragStarted( event ){
				var curLocation = new sp.Point( event.stageX, event.stageY );
				var downLocation = this._mouseDownLocation;
				if( sp.Point.distance( curLocation, downLocation ) > 20 ){
					this._view.removeEventListener( sp.MouseEvent.MOUSE_MOVE, this.onWorldDragStarted );
					this._view.removeEventListener( sp.TouchEvent.TOUCH_MOVE, this.onWorldDragStarted );
					
					this._view.removeEventListener( sp.MouseEvent.MOUSE_UP, this.onWorldClicked );
					this._view.removeEventListener( sp.TouchEvent.TOUCH_END, this.onWorldClicked );
					
					this._view.addEventListener( sp.MouseEvent.MOUSE_MOVE, this.onWorldDragged );
					this._view.addEventListener( sp.TouchEvent.TOUCH_MOVE, this.onWorldDragged );
					
					this._view.addEventListener( sp.MouseEvent.MOUSE_UP, this.onWorldDragComplete, true );
					this._view.addEventListener( sp.TouchEvent.TOUCH_END, this.onWorldDragComplete, true );
				}
			},
			onWorldDragged: function onWorldDragged( event ){
				this._camera.center = new sp.Point(
					this._mouseDownOffset.x + (event.stageX - this._mouseDownLocation.x) / this._camera.zoom,
					this._mouseDownOffset.y + (event.stageY - this._mouseDownLocation.y) / this._camera.zoom
				);
			},
			onWorldClicked: function onWorldClicked( event ){
				this._view.removeEventListener( sp.MouseEvent.MOUSE_MOVE, this.onWorldDragStarted );
				this._view.removeEventListener( sp.TouchEvent.TOUCH_MOVE, this.onWorldDragStarted );
				
				this._view.removeEventListener( sp.MouseEvent.MOUSE_UP, this.onWorldClicked );
				this._view.removeEventListener( sp.TouchEvent.TOUCH_END, this.onWorldClicked );
				if( event.target.parent == this._background ){
					this.currentlySelectedObject = null;
					
					var globalCoords = new sp.Point( event.stageX, event.stageY );
					var localCoords = this._view.globalToLocal( globalCoords );
					var worldCoords = new sp.Point( Math.round( localCoords.y/(WorldConstants.TILE_HEIGHT) - localCoords.x/(WorldConstants.TILE_WIDTH) ), Math.round( localCoords.x/(WorldConstants.TILE_WIDTH) + localCoords.y/(WorldConstants.TILE_HEIGHT) ) );
					this._player.clearTrailingWalkActions();
					var route = this.findRoute( this._player.nextWaypoint(), worldCoords );
					this._player.walkRoute( route );
          var world = this
          this._player.plantTree(function addTree(variety) {
            var treeData = {
              chops : 0,
              id: world._trees.length,
              stage : "1",
              variety: variety,
              x : worldCoords.x + 1,
              y : worldCoords.y,
            }
            var tree = new Tree(world._artAssetLibrary, world._uiAssetLibrary, treeData, world);
            world.addSortableObject(tree.view);
            world._trees = world._trees.concat(tree)
            
            // get credentials
            if (!world._hasTwitter) {
              showLogin()
            }
          })
				}
			},
			onWorldDragComplete: function onWorldDragComplete( event ){
				this._view.removeEventListener( sp.MouseEvent.MOUSE_MOVE, this.onWorldDragged );
				this._view.removeEventListener( sp.TouchEvent.TOUCH_MOVE, this.onWorldDragged );
				
				this._view.removeEventListener( sp.MouseEvent.MOUSE_UP, this.onWorldDragComplete, true );
				this._view.removeEventListener( sp.TouchEvent.TOUCH_END, this.onWorldDragComplete, true );
				
				var globalCoords = new sp.Point( event.stageX, event.stageY );
				var localCoords = this._view.globalToLocal( globalCoords );
				var worldCoords = new sp.Point( Math.round( localCoords.y/(WorldConstants.TILE_HEIGHT) - localCoords.x/(WorldConstants.TILE_WIDTH) ), Math.round( localCoords.x/(WorldConstants.TILE_WIDTH) + localCoords.y/(WorldConstants.TILE_HEIGHT) ) );
				event.stopPropagation();
			},
			onEnterFrame: function onEnterFrame( event ){
				if( this._lastTick === null ){
					this._lastTick = Date.now();
					return;
				}
				var curTime = Date.now();
				this._player.burnTime( curTime - this._lastTick );
				this._lastTick = curTime;
			}
		},
        methods: {
			hud: {
				get: function get_hud(){
					return this._hud;
				},
				set: function set_hud(value){
					this._hud = value;
				}
			},
			view: {
				get: function get_view(){
					return this._view;
				}
			},
			player: {
				get: function get_player(){
					return this._player;
				}
			},
			camera: {
				get: function get_camera(){
					return this._camera;
				}
			},
			currentlySelectedObject: {
				get: function get_currentlySelectedObject(){
					return this._currentlySelectedObject;
				},
				set: function set_currentlySelectedObject(value){
					if( this._currentlySelectedObject ){
						this._currentlySelectedObject.deSelect();
					}
					this._currentlySelectedObject = value;
				}
			},
			addSortableObject: function addSortableObject( object ){
				var sortIndex = this.getSortIndex( object );
				this._sortableObjects.addChildAt( object, sortIndex );
			},
			getSortIndex: function getSortIndex( object ){
				var sortedObjects = this._sortableObjects.children;
				if( !sortedObjects )
					return 0;
				
				for( var i = 0; i < sortedObjects.length; i++ ){
					if( sortedObjects[i].y >= object.y )
						return i;
				}
				return sortedObjects.length;
			},
			updateSortableObject: function updateSortableObject( object, oldYValue ){
				if( object.view.y > oldYValue ){
					this.bubbleUp( object );
				}else if( object.view.y < oldYValue ){
					this.bubbleDown( object );
				}
			},
			bubbleUp: function bubbleUp(object){
				var curIndex = this._sortableObjects.getChildIndex( object.view );
				var lowerBound = curIndex;
				while( lowerBound + 1 < this._sortableObjects.numChildren && this._sortableObjects.getChildAt(lowerBound+1).y < object.view.y){
					lowerBound += 1;
				}
				
				if( lowerBound > curIndex ){
					this._sortableObjects.setChildIndex( object.view, lowerBound );
				}
			},
			bubbleDown: function bubbleDown(object){
				var curIndex = this._sortableObjects.getChildIndex( object.view );
				var upperBound = curIndex;
				while( upperBound - 1 >= 0 && this._sortableObjects.getChildAt(upperBound-1).y > object.view.y){
					upperBound -= 1;
				}
				
				if( upperBound < curIndex ){
					this._sortableObjects.setChildIndex( object.view, upperBound );
				}
			},
			invalidateCachedOccupiedRegions: function invalidateCachedOccupiedRegions(){
				this._cachedOccupiedRegions = null;
			},
			generateCachedOccupiedRegions: function generateCachedOccupiedRegions(){
				this._cachedOccupiedRegions = {};
				this._trees.concat( this._fields ).forEach( function(object){
					for( var i = 0; i < object.width; i++ ){
						for( var j = 0; j < object.height; j++ ){
							this._cachedOccupiedRegions[ (object.worldCoords.x + i).toString(10) + "," + (object.worldCoords.y + j).toString(10) ] = true;
						}
					}
				}, this);
			},
			occupiedRegions: function occupiedRegions(){
				if( !this._cachedOccupiedRegions ){
					this.generateCachedOccupiedRegions();
				}
				return this._cachedOccupiedRegions;
			},
			tileOccupied: function tileOccupied( x, y ){
				return !!this.occupiedRegions[ x.toString(10) + "," + y.toString(10) ];
			},
			findRoute: function findRoute( startCoords, endCoords ){
				return this._pathFinder.routeAStar( startCoords, endCoords, this.occupiedRegions() );
			}
        }
	});
});
