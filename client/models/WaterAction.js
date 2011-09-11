define( ['client/models/Action'], function(Action){
	return sp.Class.create('WaterAction', Action, {
		constructor: function WaterAction( actor, actionQueue, field ){
			Action.call( this, actor, actionQueue );
			this._field = field;
			this._duration = 3500;
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
				// this._field.becomeWatered(); ???
			},
			burnTimeInternal: function burnTimeInternal(dt){		
				this._actor.setAnimation( {anim:"water", scaleX:1} );
				return Math.min( this._duration - this._timeSpent, dt );
			}
		}
	});
});