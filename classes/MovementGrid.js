import { PathManager } from "/modules/lib-find-the-path/scripts/pathManager.js";
import { PointFactory, Neighbors, AngleTypes } from "/modules/lib-find-the-path/scripts/point.js";
import { MinkowskiParameter } from "/modules/lib-find-the-path/scripts/point.js";
import { FTPUtility } from "/modules/lib-find-the-path/scripts/utility.js"
export default class MovementGrid {
	constructor(token) {
		this.id = game.userId;
		this.user = game.user;
		this.name = `EnhancedMovement.${game.userId}`;
		this.borderColor = game.user.color;
		this.fillColor = game.user.color;
		this.token = token;
		this.pf = game.FindThePath.Chebyshev.PointFactory;
		this.PM = new PathManager (MinkowskiParameter.Chebyshev);
       	this.visible = false;
       	this.points = [];
		canvas.grid.addHighlightLayer(this.name);

	}
	async highlightGrid(dash=false) {

		this.clear();
	    const center = this.token.center;
		let speed = this.token.remainingSpeed;
		const spaces = speed / canvas.dimensions.distance;
		const gridPos = canvas.grid.grid.getGridPositionFromPixels(center.x,center.y) // [row,col]
		
		const oRow = gridPos[0];
		const oCol = gridPos[1];
		
		let origin =  this.pf.fromToken(this.token);
		const multiple = (dash) ? 2:1;
	
		this.points = await PathManager.pointsWithinRange(origin,spaces*multiple);
		let move = this.points;
		
		for (let i =0;i<move.length;i++){
			//let color = colorStringToHex(this.user.data.color);
			let color = (move[i].cost > spaces) ? colorStringToHex('#00ff00'):colorStringToHex(this.user.data.color);
			canvas.grid.highlightPosition(this.name, {x: move[i].px, y: move[i].py,color:color});
		}
		this.visible = true;
	}
	clear(){
		canvas.grid.highlightLayers[this.name].clear();
		this.visible = false;
	}
	
	static didCollide(A,B){
		let ray = new Ray(A,B);
		return canvas.walls.checkCollision(ray);
	}
}
