define( ['client/models/Action'], function(Action){
	var HARVEST_TIME = 4100;
	return sp.Class.create('HarvestAction', Action, {
		constructor: function HarvestAction( actor, actionQueue, field ){
			Action.call( this, actor, actionQueue );
			this._field = field;
			this._duration = HARVEST_TIME;
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
				this._field.beHarvested();
			},
			burnTimeInternal: function burnTimeInternal(dt){
				this._field.updateProgressAmount( 100*(this._timeSpent / this._duration) );
				
				this._actor.setAnimation( {anim:"plow", scaleX:1} );
				return Math.min( this._duration - this._timeSpent, dt );
			}
		}
	});
});