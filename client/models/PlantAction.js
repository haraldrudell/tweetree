define( ['client/models/Action'], function(Action){
	var PLANT_TIME = 4100;
	return sp.Class.create('PlantAction', Action, {
		constructor: function PlantAction( actor, actionQueue, field, crop ){
			Action.call( this, actor, actionQueue );
			this._field = field;
			this._crop = crop;
			this._duration = PLANT_TIME;
		},
		properties: {
			"_field": null,
			"_crop": null
		},
		methods: {
			field: {
				get: function get_field(){
					return this._field;
				}
			},
			crop: {
				get: function get_crop(){
					return this._crop;
				}
			},
			actionCompleted: function actionCompleted(){
				Action.prototype.actionCompleted.call(this);
				this._field.becomePlanted(this._crop);
			},
			burnTimeInternal: function burnTimeInternal(dt){
				this._field.updateProgressAmount( 100*(this._timeSpent / this._duration) );
				
				this._actor.setAnimation( {anim:"seed", scaleX:1} );
				return Math.min( this._duration - this._timeSpent, dt );
			}
		}
	});
});