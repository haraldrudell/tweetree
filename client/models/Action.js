define( function(){
	return sp.Class.create('Action', {
		constructor: function Action(actor, actionQueue){
			this._actor = actor;
			this._actionQueue = actionQueue;
		},
		properties: {
			"_actor": null,
			"_actionQueue": null,
			"_timeSpent": 0,
			"_duration": null
		},
		methods: {
			burnTime: function burnTime(dt){
				if( this._timeSpent === 0 ){
					this.actionStarted();
				}
				var timeBurned = this.burnTimeInternal(dt);
				this._timeSpent += timeBurned;
				if( this.isFinished() ){
					this.actionCompleted();
				}
				return (dt - timeBurned);
			},
			isFinished: function isFinished(){
				return this._timeSpent >= this._duration;
			},
			burnTimeInternal: function burnTimeInternal(dt){
				// Returns the amount of time it spent doing this action
			},
			actionStarted: function actionStarted(){
				// Override if necessary
			},
			actionCompleted: function actionCompleted(){
				this._actionQueue.completeAction( this );
			},
			matches: function matches( query ){
				for( var key in query ){
					if( this[key] != query[key] )
						return false;
				}
				return true;
			}
		}
	});
});