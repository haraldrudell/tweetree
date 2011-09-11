define( function(){
	return sp.Class.create( 'Camera', {
		constructor: function Camera( view, zoomCenter ){
			this._zoomCenter = zoomCenter.clone();
			this._center = zoomCenter.clone();
			this._view = view;
			this.update();
		},
		properties: {
			"_center": null,
			"_zoom": 1,
			"_zoomCenter": null,
			"_view": null
		},
		methods:{
			zoom: {
				get: function get_zoom(){
					return this._zoom;
				},
				set: function set_zoom(value){
					this._zoom = value;
					this.update();
				}
			},
			view: {
				set: function set_view(value){
					this._view = value;
					this.update();
				}
			},
			center: {
				get: function get_center(){
					return this._center.clone();
				},
				set: function set_center(value){
					this._center = value.clone();
					this.update();
				}
			},
			update: function update(){
				if (!this._view) {
					return;
				}
				
				this._view.x = (this._center.x - this._zoomCenter.x) * this._zoom + this._zoomCenter.x;
				this._view.y = (this._center.y - this._zoomCenter.y) * this._zoom + this._zoomCenter.y;
				
				this._view.scaleX = this.zoom;
				this._view.scaleY = this.zoom;
			}
		}
	});
});