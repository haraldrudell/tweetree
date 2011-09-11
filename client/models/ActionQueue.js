define( ['client/models/WalkAction'], function(WalkAction){
	return sp.Class.create('ActionQueue', {
		constructor: function ActionQueue(){
			this._queue = [];
		},
		properties: {
			"_queue": null
		},
		methods: {
			currentAction: {
				get: function get_currentAction(){
					return this._queue[0] || null;
				}
			},
			addAction: function addAction( action ){
				this._queue.push( action );
			},
			completeAction: function completeAction( action ){
				if( this.currentAction != action ){
					throw new Error( "that's not the current action" );
				}
				this._queue.shift();
			},
			cancelAllQueuedTasks: function cancelAllQueuedTasks(){
				if( this.currentAction ){
					this._queue = [this.currentAction];
				}else{
					this._queue = [];
				}
			},
			clearTrailingWalkActions: function clearTrailingWalkActions(){
				while( this._queue.length > 1 ){
					var tempAction = this._queue[ this._queue.length - 1 ];
					if( tempAction instanceof WalkAction ){
						this._queue.pop();
					}else{
						return;
					}
				}
			},
			spliceActions: function spliceActions( priorAction, actions ){
				var idx = this._queue.indexOf( priorAction );
				if( idx === -1 )
					throw new Error("That's not a queued action.");
				
				this._queue.splice.apply( this._queue, [idx+1, 0].concat(actions) );
			},
			containsAction: function containsAction( actionType, query ){
				for( var i = 0; i < this._queue.length; i++ ){
					if( this._queue[i] instanceof actionType ){
						if( this._queue[i].matches( query ) )
							return this._queue[i];
					}
				}
				return false;
			}
		}
	});
});