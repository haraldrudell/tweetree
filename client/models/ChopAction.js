define( ['client/managers/SoundManager', 'client/models/Action'], function(SoundManager, Action){
	return sp.Class.create('ChopAction', Action, {
		constructor: function ChopAction( actor, actionQueue, tree ){
			Action.call( this, actor, actionQueue );
			this._tree = tree;
			this._duration = 1000;
		},
		properties: {
			"_tree": null
		},
		methods: {
			tree: {
				get: function get_tree(){
					return this._tree;
				}
			},
			actionStarted: function actionStarted(){
				SoundManager.playSoundEffect('chop');
			},
			actionCompleted: function actionCompleted(){
				Action.prototype.actionCompleted.call(this);
				this._tree.addChop();
				this._actor.addWood(2);
			},
			burnTimeInternal: function burnTimeInternal(dt){
				this._actor.setAnimation( {anim:"chop", scaleX:1} );				
				return Math.min( this._duration - this._timeSpent, dt );
			}
		}
	});
});