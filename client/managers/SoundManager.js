define( function(){
	var SoundManager = sp.Class.create( 'SoundManager', {
		statics: {
			resources: {},
			openChannels: [],
			backgroundMusic: null,
			backgroundMusicChannel: null,
			backgroundMusicPausePosition: 0,
			addResource: function addResource(key, sound){
				SoundManager.resources[key] = sound;
			},
			playSoundEffect: function playSoundEffect(key){
				var soundChannel = SoundManager.resources[key].play();
				if( SoundManager.openChannels.length >= 32 )
					throw new Error("Cannot have more than 32 open Sound Channels at once");
				
				SoundManager.openChannels.push( soundChannel );
				soundChannel.addEventListener( sp.Event.SOUND_COMPLETE, function(event){
					var idx = SoundManager.openChannels.indexOf( soundChannel );
					SoundManager.openChannels.splice( idx, 1 );
					event.currentTarget.removeEventListener( event.type, arguments.callee );
				});
				return soundChannel;
			},
			startBackgroundMusic: function startBackgroundMusic(key){
				if( SoundManager.backgroundMusicChannel ){
					var currentlyPlayingBackgroundMusic = SoundManager.backgroundMusicChannel;
					currentlyPlayingBackgroundMusic.stop();
				}
				SoundManager.backgroundMusic = SoundManager.resources[key];
				var soundChannel = SoundManager.backgroundMusic.play(0, 999);
				SoundManager.backgroundMusicChannel = soundChannel;
				return soundChannel;
			},
			pauseBackgroundMusic: function pauseBackgroundMusic(){
				SoundManager.backgroundMusicPausePosition = SoundManager.backgroundMusicChannel.position;
				SoundManager.backgroundMusicChannel.stop();
				SoundManager.backgroundMusicChannel = null;
			},
			resumeBackgroundMusic: function resumeBackgroundMusic(){
				if( SoundManager.backgroundMusicChannel )
					throw new Error("background music is not paused, cannot call resume.");
				var soundChannel = SoundManager.backgroundMusic.play(SoundManager.backgroundMusicPausePosition, 999);
				SoundManager.backgroundMusicChannel = soundChannel;
				return soundChannel;
			},
			musicIsMuted: function musicIsMuted(){
				return (SoundManager.backgroundMusicChannel === null);
			},
			toggleBackgroundMusic: function toggleBackgroundMusic(){
				SoundManager.musicIsMuted() ? SoundManager.resumeBackgroundMusic() : SoundManager.pauseBackgroundMusic();
			},
			toggleSoundEffects: function toggleSoundEffects(){
				// Implement
			}
		}
	});
	return SoundManager;
});