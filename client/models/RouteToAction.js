define( ['client/models/Action', 'client/models/WalkAction'], function(Action, WalkAction){
	return sp.Class.create('RouteToAction', Action, {
		constructor: function RouteToAction( actor, actionQueue, destination, world ){
			Action.call( this, actor, actionQueue );
			this._destination = destination;
			this._world = world;
		},
		properties: {
			"_destination": null,
			"_world": null
		},
		methods: {
			isFinished: function isFinished(){
				return true;
			},
			actionStarted: function actionStarted(){
				var route = this._world.findRoute( this._actor.nextWaypoint(), this._destination );
				var walkActions = route.map( function(waypoint){
					return new WalkAction(this._actor, this._actionQueue, waypoint);
				}, this);
				this._actionQueue.spliceActions( this, walkActions );
			
			},
			burnTimeInternal: function burnTimeInternal(dt){
				return 0;
			}
		}
	});
});