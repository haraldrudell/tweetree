define( ['client/models/Action'], function(Action){
	var CLEAR_TIME = 4100;
	return sp.Class.create('ClearAction', Action, {
		constructor: function ClearAction( actor, actionQueue, field ){
			Action.call( this, actor, actionQueue );
			this._field = field;
			this._duration = CLEAR_TIME;
		},
		properties: {
			"_field": null
		},
		methods: {
			field: {
				get: function get_field(){
					return this._field;
				}
			},
			actionStarted: function actionStarted(){
				
			},
			actionCompleted: function actionCompleted(){
				Action.prototype.actionCompleted.call(this);
				this._field.becomeFallow();
				this._actor.addXP(5);
				this._actor.addCoins(3);
			},
			burnTimeInternal: function burnTimeInternal(dt){
				this._field.updateProgressAmount( 100*(this._timeSpent / this._duration) );
				
				this._actor.setAnimation( {anim:"plow", scaleX:1} );				
				return Math.min( this._duration - this._timeSpent, dt );
			}
		}
	});
});