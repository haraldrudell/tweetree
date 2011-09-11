define( ['client/views/InteractiveWorldObject', 'client/models/ActionQueue', 'client/models/WalkAction', 'client/models/PlantTreeAction', 'client/models/ChopAction', 'client/models/WaterAction', 'client/models/PlantAction', 'client/models/PlowAction', 'client/models/HarvestAction', 'client/models/ClearAction', 'client/models/RouteToAction'], function(InteractiveWorldObject, ActionQueue, WalkAction, PlantTreeAction, ChopAction, WaterAction, PlantAction, PlowAction, HarvestAction, ClearAction, RouteToAction) {
    
	// Each level, to get to the next you need to earn the following amount more XP:
	// 10*x + 3*x*Math.sin(4*x/Math.PI)
	// So the XP totals to reach each level are just the sum of previous level amounts:
	// 
	var LEVEL_THRESHOLDS = [
  0,
  12.868166971982888,
  36.23178376501817,
  60.58577115560118,
  89.44433086254459,
  140.68808749353036,
  218.27541051562147,
  298.5656191080815,
  362.01171151407095,
  427.8613805481037,
  532.8192753070866,
  675.5342258398481,
  810.5117492612992,
  911.3628680329901,
  1015.4822751760528,
  1176.5734712475596,
  1384.5169828497058,
  1571.8166609460463,
  1708.6209377301939,
  1852.5501573564386,
  2072.109042386978,
  2345.0715686927815,
  2582.234225921656,
  2753.7963835969895,
  2939.3174242610066,
  3219.560929933529,
  3557.02305692151,
  3841.528554990482,
  4046.9284205345475,
  4276.042864450562,
  4619.039002280779
];
	
	return sp.Class.create('Player', InteractiveWorldObject, {
        constructor: function Player(artAssetLibrary, uiAssetLibrary, data, world){
            InteractiveWorldObject.call(this, artAssetLibrary, uiAssetLibrary, data, world);
			
			var Lincoln = artAssetLibrary.getDefinition("Lincoln");
			this._movieClip = new Lincoln();
			this._level = data.level;
			this._xp = data.xp;
			this._coins = data.coins;
			this._wood = data.wood;
			
			this._view.addChild( this._movieClip );
			
			this._actionQueue = new ActionQueue();
        },
		properties: {
			"_actionQueue": null,
			"_movieClip": null,
			"_level": 1,
			"_xp": 0
		},
        methods: {
			view: {
				get: function get_view(){
					return this._view;
				}
			},
			popupClass: {
				get: function get_popupClass(){
					return "objectPopup";
				}
			},
			speed: {
				get: function get_speed(){
					return 0.005;
				}
			},
			level: {
				get: function get_level(){
					return this._level;
				}
			},
			coins: {
				get: function get_coins(){
					return this._coins;
				}
			},
			wood: {
				get: function get_wood(){
					return this._wood;
				}
			},
			levelUpPercent: {
				get: function get_levelUpPercent(){
					return Math.round(100*(this._xp - this.lastThreshold)/(this.nextThreshold - this.lastThreshold));
				}
			},
			addCoins: function addCoins( amount ){
				this._coins += amount;
				this.dispatchEvent( new sp.Event("coinsUpdated") );
			},
			addXP: function addXP( amount ){
				this._xp += amount;
				this.dispatchEvent( new sp.Event("xpUpdated") );
				while( this._xp > this.nextThreshold ){
					this._level += 1;
					this.dispatchEvent( new sp.Event("levelUp") );
				}
			},
			addWood: function addWood( amount ){
				this._wood += amount;
				this.dispatchEvent( new sp.Event("woodUpdated") );
			},
			lastThreshold: {
				get: function get_lastThreshold(){
					return LEVEL_THRESHOLDS[this._level-1];
				}
			},
			nextThreshold: {
				get: function get_nextThreshold(){
					return LEVEL_THRESHOLDS[this._level];
				}
			},
			isWalking: function isWalking(){
				return (this._actionQueue.currentAction instanceof WalkAction);
			},
			intendsToPlant: function intendsToPlant( field ){
				var action = this._actionQueue.containsAction( PlantAction, {field: field} );
				if( action )
					return action.crop;
				return null;
			},
			intendsToClear: function intendsToClear( field ){
				return this._actionQueue.containsAction( ClearAction, {field: field} );
			},
			intendsToPlow: function intendsToPlow( field ){
				return this._actionQueue.containsAction( PlowAction, {field: field} );
			},
			intendsToHarvest: function intendsToHarvest( field ){
				return this._actionQueue.containsAction( HarvestAction, {field: field} );
			},
			nextWaypoint: function nextWaypoint(){
				if( this.isWalking() ){
					return this._actionQueue.currentAction.waypoint;
				}
				return this.worldCoords;
			},
			onObjectClicked: function onObjectClicked( event ){
				// Clicked the object
			},
			onObjectReleased: function onObjectReleased( event ){
				// Released the object
			},
			burnTime: function burnTime( dt ){
				while( dt > 0 ){
					var curAction = this._actionQueue.currentAction;
					if( !curAction ){
						this.setAnimation( {anim:"idle"} );
						return;
					}
					dt = curAction.burnTime( dt );
				}
			},
			clearTrailingWalkActions: function clearTrailingWalkActions(){
				this._actionQueue.clearTrailingWalkActions();
			},
			walkTo: function walkTo( destination ){
        this._actionQueue.addAction( new RouteToAction(this, this._actionQueue, destination, this._world));
			},
			chopTree: function chopTree( tree ){
				this._actionQueue.addAction( new ChopAction(this, this._actionQueue, tree) );
			},
			plowField: function plowField( field ){
				this._actionQueue.addAction( new PlowAction(this, this._actionQueue, field) );
			},
			harvestField: function harvestField( field ){
				this._actionQueue.addAction( new HarvestAction(this, this._actionQueue, field) );
			},
			clearField: function clearField( field ){
				this._actionQueue.addAction( new ClearAction(this, this._actionQueue, field) );
			},
			waterField: function waterField( field ){
				this._actionQueue.addAction( new WaterAction(this, this._actionQueue, field) );
			},
			plantCrop: function plantCrop( field, crop ){
				this._actionQueue.addAction( new PlantAction(this, this._actionQueue, field, crop) );
				this.waterField( field );
			},
			walkRoute: function walkRoute( route ){
        if( route ) {
  				route.forEach( function(waypoint){
	  				this._actionQueue.addAction( new WalkAction(this, this._actionQueue, waypoint) );
		  		}, this);
        }
			},
			cancelAllQueuedTasks: function cancelAllQueuedTasks(){
				this._actionQueue.cancelAllQueuedTasks();
			},
      plantTree: function plantTree(addtreemethod) {
        this._actionQueue.addAction(new PlantTreeAction(this, this._actionQueue, addtreemethod));
      },
			setAnimation: function setAnimation( animData ){
				if( this._movieClip.currentLabel != animData.anim )
					this._movieClip.gotoAndPlay( animData.anim );
				
				if( animData.scaleX && this._movieClip.scaleX != animData.scaleX )
					this._movieClip.scaleX = animData.scaleX;
			}
        }
    });
});