define( ['client/models/Action'], function(Action){
	var PLANT_TIME = 4100;
  var TREE = "oak"
	return sp.Class.create('PlantTreeAction', Action, {
		constructor: function PlantTreeAction( actor, actionQueue, waypoint){
      
			Action.call( this, actor, actionQueue );
			this._waypoint = waypoint;
			this._duration = PLANT_TIME;
      this._tree = TREE
		},
		properties: {
			"_waypoint": null,
			"_crop": null,
      "_tree": null
		},
		methods: {
			actionCompleted: function actionCompleted(){
				Action.prototype.actionCompleted.call(this);
			},
			burnTimeInternal: function burnTimeInternal(dt){
				this._field.updateProgressAmount( 100*(this._timeSpent / this._duration) );
				
				this._actor.setAnimation( {anim:"seed", scaleX:1} );
				return Math.min( this._duration - this._timeSpent, dt );
			}
		}
	});
});