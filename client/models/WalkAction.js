define( ['client/models/Action'], function(Action){
	return sp.Class.create('WalkAction', Action, {
		constructor: function WalkAction( actor, actionQueue, waypoint ){
			Action.call( this, actor, actionQueue );
			this._waypoint = waypoint;
		},
		properties: {
			"_waypoint": null,
			"_finished": false
		},
		methods: {
			waypoint: {
				get: function get_waypoint(){
					return this._waypoint;
				}
			},
			animationForVector: function animationForVector(vector){
				// Down and Left
				if( vector.x > 0 && vector.y === 0 )
					return {anim:"walk_toward", scaleX:1};
				
				// Down and right
				if( vector.x === 0 && vector.y >= 0 )
					return {anim:"walk_toward", scaleX:-1};
					
				// Up and Right
				if( vector.x < 0 && vector.y === 0 )
					return {anim:"walk_away", scaleX:1};
				
				// Up and Left
				if( vector.x === 0 && vector.y < 0 )
					return {anim:"walk_away", scaleX:-1};
				
				// Directly Down
				if( vector.x > 0 && vector.y > 0 )
					return {anim:"walk_toward", scaleX:1};
					
				// Directly Left
				if( vector.x > 0 && vector.y < 0 )
					return {anim:"walk_toward", scaleX: 1};
				
				// Directly Right
				if( vector.x < 0 && vector.y > 0 )
					return {anim:"walk_toward", scaleX: -1};
				
				// Directly Up
				if( vector.x < 0 && vector.y < 0 )
					return {anim:"walk_away", scaleX:1};
					
				return {anim:"chop", scaleX:1};
			},
			isFinished: function isFinished(){
				return this._finished;
			},
			burnTimeInternal: function burnTimeInternal(dt){
				var tangent = this._waypoint.subtract( this._actor.worldCoords );
				var distanceRemaining = (tangent.length - dt*this._actor.speed);
				if( distanceRemaining > 0 ){
					tangent.normalize( dt*this._actor.speed );
					this._actor.moveBy( tangent );
					this._actor.setAnimation( this.animationForVector(tangent) );
					return dt;
				}else{
					this._actor.moveBy( tangent );
					this._finished = true;
					var timeRemaining = -distanceRemaining / ( this._actor.speed );
					return (dt -timeRemaining);
				}
			}
		}
	});
});