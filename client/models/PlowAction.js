define( ['client/models/Action'], function(Action){
	var PLOW_TIME = 4100;
	return sp.Class.create('PlowAction', Action, {
		constructor: function PlowAction( actor, actionQueue, field ){
			Action.call( this, actor, actionQueue );
			this._field = field;
			this._duration = PLOW_TIME;
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
			actionCompleted: function actionCompleted(){
				Action.prototype.actionCompleted.call(this);
				this._field.becomePlowed();
			},
			burnTimeInternal: function burnTimeInternal(dt){
				this._field.updateProgressAmount( 100*(this._timeSpent / this._duration) );
				
				this._actor.setAnimation( {anim:"plow", scaleX:1} );
				return Math.min( this._duration - this._timeSpent, dt );
			}
		}
	});
});