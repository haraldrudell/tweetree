define( ['client/models/Action'], function(Action){
	var PLANT_TIME = 4100;
  var VARIETY = "Oak";
	return sp.Class.create('PlantTreeAction', Action, {
		constructor: function PlantTreeAction( actor, actionQueue, addtreemethod){
      
			Action.call( this, actor, actionQueue );
			this._addtreemethod = addtreemethod;
			this._duration = PLANT_TIME;
      this._variety = VARIETY
		},
		properties: {
			"_addtreemethod": null,
      "_variety": null
		},
		methods: {
      addtreemethod: {
				get: function get_addtreemethod(){
					return this._addtreemethod;
				}
      },
      variety: {
				get: function get_variety(){
					return this._variety;
				}
      },
			actionCompleted: function actionCompleted(){
        this._addtreemethod(this._variety)
				Action.prototype.actionCompleted.call(this);
			},
			burnTimeInternal: function burnTimeInternal(dt){
        try {
				//this._field.updateProgressAmount( 100*(this._timeSpent / this._duration) );
				
				this._actor.setAnimation( {anim:"seed", scaleX:1} );
        } catch (e) {
          var x = e
        }
				return Math.min( this._duration - this._timeSpent, dt );
			}
		}
	});
});