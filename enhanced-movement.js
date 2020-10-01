import SpeedHUD from './classes/SpeedHUD.js';
import EnhancedMovement from './classes/EnhancedMovement.js';
//import MovementGrid from './classes/MovementGrid.js';
import { PathManager } from "/modules/lib-find-the-path/scripts/pathManager.js";
import { MinkowskiParameter,PointFactory } from "/modules/lib-find-the-path/scripts/point.js";
import { Overwrite } from './js/Overwrite.js';
let speed;
let combat;
let cToken;
let stopMovement = false;
let gmAltPress = false;
Overwrite.init();

let pathManager = new PathManager (MinkowskiParameter.Chebyshev);
Hooks.on('init',()=>{
	//CONFIG.debug.hooks = true;
	//CONFIG.debug.mouseInteraction = true;
	//console.log(new PathManager)
	// game.settings.register('EnhancedMovement', 'enableGrid', {
	// 	name: "Grid Movement Preview",
	// 	hint: "Displays all points character can move within their speed during combat.",
	// 	scope: "client",
	// 	config: true,
	// 	default: true,
	// 	type: Boolean
 //      //onChange: x => window.location.reload()
 //    });
	// game.settings.register('EnhancedMovement', 'preventMove', {
	// 	name: "Prevent Movement",
	// 	hint: "Restricts movement during combat to only the current token. Will still fire warning.",
	// 	scope: "world",
	// 	config: true,
	// 	default: true,
	// 	type: Boolean
 //      //onChange: x => window.location.reload()
 //    });
 //    game.settings.register('EnhancedMovement', 'disableNonGridMove', {
	// 	name: "Disable Non Grid Movement",
	// 	hint: "During combat, restricts player movement to grid.",
	// 	scope: "world",
	// 	config: true,
	// 	default: true,
	// 	type: Boolean
 //      //onChange: x => window.location.reload()
	// })
	game.settings.register('EnhancedMovement', 'speedLimit', {
		name: "EnhancedMovement.speedLimit-s",
		hint: "EnhancedMovement.speedLimit-l",
		scope: "world",
		config: true,
		default: true,
		type: Boolean
      //onChange: x => window.location.reload()
    });

});


Hooks.on('ready',()=>{
	//canvas.grid.addHighlightLayer(`EnhancedMovement.${game.userId}`);
	canvas.tokens.placeables.forEach((token)=>{
		if(typeof token.actor != 'undefined'){
			//token.movementGrid = new MovementGrid(token);
			token.EnhancedMovement = new EnhancedMovement(token);
		}
	})

	canvas.hud.speedHUD.updateHUD({},true)
	//Allows GM to override movement restrictions.
	 if (game.user.isGM){
		$(window).on('keydown',(e)=>{
			switch(e.which){
				case 18:
					gmAltPress = true;
					break;
				default:
					break;
			}
			
		})
		$(window).on('keyup',(e)=>{
			switch(e.which){
				case 18:
					gmAltPress = false;
					break;
				default:
					break;
			}
			
		})
	}
	$('body').on('click','#dash-btn',function(e){
		if($(this).hasClass('active')){
			if(canvas.tokens.controlled[0].EnhancedMovement.totalSpeed < canvas.tokens.controlled[0].EnhancedMovement.maxSpeed){
				$(this).removeClass('active')
				canvas.tokens.controlled[0].EnhancedMovement.unDash();
			}

		}else{
			$(this).addClass('active');
			canvas.tokens.controlled[0].EnhancedMovement.dash();
		}
	})
	//Create SPEEDUI
	//game.user.speedHUD = new SpeedHUD().render(true);
	canvas.hud.speedHUD.render(true);
})
//COMBAT HOOKS
Hooks.on('createCombat',(combat,data,userID)=>{

})

Hooks.on('updateCombat',(combat,data,diff,userID)=>{
	
	
	//console.log(combat.previous.round,combat.previous.turn,combat.current.round,combat.current.turn,data,diff,userID)
	let token = (typeof combat.combatant != 'undefined') ? canvas.tokens.get(combat.combatant.tokenId):null;
	
	if(diff.diff && game.user.isGM){
		if((data.hasOwnProperty('turn') || data.hasOwnProperty('round')) && combat.combatant !=null){
			//New Turn
			
			token.setFlag('EnhancedMovement','nDiagonal',0)
			
			if(data.hasOwnProperty('round')){
				//new round

				let nonCombatTokens = canvas.tokens.placeables.filter((token)=>{
					let index = game.combat.combatants.findIndex((combatant)=>{
						return token.id == combatant.tokenId;
					})
					if(index == -1) return true;
					else return false;
					
				})
				nonCombatTokens.forEach((token)=>{
					token.EnhancedMovement.reset();
				})
				
			}
			game.combat.combatants.forEach((c)=>{
				if(c.tokenId != game.combat.combatant.tokenId)
					canvas.tokens.get(c.tokenId).EnhancedMovement.endTurn();
			})
			
			token.EnhancedMovement.reset();
			// token.setFlag('EnhancedMovement','remainingSpeed',token.maxSpeed).then(()=>{
			// 	//if(token._controlled) token.movementGrid.highlightGrid();
			// });
			if(token.id == canvas.hud.speedHUD.token.id){
				canvas.hud.speedHUD.updateTracker()
			}else{
				canvas.hud.speedHUD.updateTracker();
			}
		}
		
		if(data.round == 1 && combat.previous.round !== 2 && game.user.isGM){
			//Combat Started
			if(token !== null){
				canvas.hud.speedHUD.token = token;
				canvas.hud.speedHUD.updateHUD({},true);
				canvas.hud.speedHUD.updateTracker()
			}
			canvas.tokens.placeables.forEach((token)=>{
				token.EnhancedMovement.reset()
				token.refresh();
			});
			
		}
	}
})

Hooks.on('deleteCombat',async (combat)=>{
	if(game.user.isGM){
		// combat.combatants.map((combatant)=>{
		// 	let token = canvas.tokens.get(combatant.tokenId);
		// 	token.EnhancedMovement.reset();
		// 	canvas.hud.speedHUD.updateTracker()
			
			
		// });
		canvas.tokens.placeables.forEach((token)=>{
			token.EnhancedMovement.reset();
			token.refresh();
			if(canvas.hud.speedHUD.token != false)
				canvas.hud.speedHUD.updateTracker()
			//token.movementGrid.clear();
		})
	}
})

Hooks.on('createCombatant',(combat,combatant,data,)=>{
	if(canvas.hud.speedHUD.token.id == combatant.tokenId){
		canvas.hud.speedHUD.updateTracker();
	}
})
//TOKEN HOOKS
Hooks.on('controlToken',(token,controlled)=>{

	//If user selects multiple tokens, this will be last one selected
	cToken = (controlled) ? token:null;
	
	if(controlled){
		canvas.hud.speedHUD.token = token;
		canvas.hud.speedHUD.updateHUD({},true);
		
	}else{
		canvas.hud.speedHUD.token = false;
		
		setTimeout(()=>{
			
			if(canvas.hud.speedHUD.token){
				canvas.hud.speedHUD.updateHUD({},true);
			}else{
				canvas.hud.speedHUD.close();
			}
		},200)
	}
	
})
let nDiagonal = 0;
Hooks.on('preUpdateToken', (scene,tokenData,updates,diff)=>{
	//if(game)
	let token = canvas.tokens.get(tokenData._id)
	if(game.combat !== null && (typeof updates.y != 'undefined' || typeof updates.x != 'undefined')){
		
		let nDiagonal = token.getFlag('EnhancedMovement','nDiagonal') || 0;
		const prev = {x:token.x,y:token.y}
		const next = {x:updates.x ?? token.x,y:updates.y ?? token.y}
		
	
		let [nextX,nextY] = canvas.grid.grid.getGridPositionFromPixels(next.x,next.y);
		let [prevX,prevY] = canvas.grid.grid.getGridPositionFromPixels(prev.x,prev.y);
		const dy =  (next.y-prev.y) / canvas.dimensions.size;
		const dx = (next.x-prev.x) / canvas.dimensions.size;
		const ny = Math.abs(dy);
		const nx = Math.abs(dx);
		let nd = Math.min(nx, ny);
	    let ns = Math.abs(ny - nx);
	  
		let distance = 0;
	  
	 	let path = calcStraightLine ([prevX,prevY],[nextX,nextY]);
	 	path.forEach((point)=>{
	 			let terrainInfo = checkForTerrain(point[0],point[1])
	 			if(terrainInfo){
	 				if(terrainInfo.type == 'ground' && token.EnhancedMovement.movementMode == 'walk')
	 					distance += terrainInfo.multiple * canvas.scene.data.gridDistance - canvas.scene.data.gridDistance;
	 			}
	 	})
	 	
	    nDiagonal += nd;
	    token.data.flags.EnhancedMovement.nDiagonal = nDiagonal;
	    token.setFlag('EnhancedMovement','nDiagonal',nDiagonal);
	    
		if(canvas.grid.diagonalRule == '555'){
			 distance += (ns + nd) * canvas.scene.data.gridDistance;
		}else if(canvas.grid.diagonalRule =='5105'){
		
		    let nd10 = Math.floor(nDiagonal / 2) - Math.floor((nDiagonal - nd) / 2);
  			let spaces = (nd10 * 2) + (nd - nd10) + ns;
		    distance += spaces * canvas.dimensions.distance;
		}
		if(gmAltPress) distance = 0;
		
		let speed = token.EnhancedMovement.remainingSpeed;
				
		let modSpeed = speed - distance;
		if(modSpeed < 0 && !gmAltPress){
			/// need to broadcast this.

			ui.notifications.warn("Creature has exceeded their movement speed this turn.", {permanent: false});
			return false;
		}else{
			token.EnhancedMovement.totalSpeed += distance;
			token.setFlag('EnhancedMovement','totalSpeed', token.EnhancedMovement.totalSpeed)
			token.EnhancedMovement.remainingSpeed = (modSpeed < 0) ? 0:modSpeed;
			token.setFlag('EnhancedMovement','remainingSpeed', modSpeed);
			canvas.hud.speedHUD.updateHUD({},true)
		}
	
		if( game.combat.started && game.combat.combatant.tokenId == tokenData._id){
		}else if(!gmAltPress && game.combat.started  && game.combat.combatants.findIndex((i)=>{return i.tokenId == token.id}) !== -1){
			ui.notifications.warn("It is not your move.", {permanent: false});
			//return false;
		}
	}
})
let interval = null;
Hooks.on('updateToken',(scene,tokenData,updates,diff)=>{
	let token = canvas.tokens.get(tokenData._id)
	if(updates.hasOwnProperty('flags')){
		if(updates.flags.hasOwnProperty('EnhancedMovement')){
			if(updates.flags.EnhancedMovement.hasOwnProperty('remainingSpeed')){
				token.EnhancedMovement.remainingSpeed = updates.flags.EnhancedMovement.remainingSpeed;
				token.refresh();

				if(canvas.hud.speedHUD.token.id == token.id){
					canvas.hud.speedHUD.updateHUD({},true);
				}
			}
		}
	}
	//Combat has started

		
	if(updates.hasOwnProperty('x') || updates.hasOwnProperty('y')){
		//token.movementGrid.clear();
		if(interval == null) {
			interval = setInterval(()=>{
				
				if(token._movement == null){
					clearInterval(interval);
					interval = null;
					Hooks.call('moveToken',token)
				}
			},100)
		}
	}
	
})
Hooks.on('moveToken',(token)=>{
	if(game.user.isGM) {
		if(game.combat !== null && game.combat.started){
			//if(game.combat.combatant.tokenId == token.id) token.movementGrid.highlightGrid();
		}
		token.previousLocation.push({x:token.x,y:token.y});
	}
})

Hooks.on('createToken',(scene,tokenData)=>{
	if(game.user.isGM){
		let token = canvas.tokens.get(tokenData._id);
		token.EnhancedMovement = new EnhancedMovement(token);
		token.setFlag('EnhancedMovement','remainingSpeed',token.EnhancedMovement.maxSpeed);
	}
})
//ACTOR HOOKS
Hooks.on('updateActor',async (actor,data,diff,userID)=>{
	if(typeof data.data.attributes.speed.value != 'undefined') {
		let newSpeed = data.data.attributes.speed.value;
		let tokens = getTokensFromActor(actor);
		if(tokens.length > 0){
			tokens.forEach((token)=>{
				let diff = token.EnhancedMovement.remainingSpeed - token.EnhancedMovement.maxSpeed;

				token.EnhancedMovement.remainingSpeed = newSpeed - diff;
				canvas.hud.speedHUD.updateHUD({},true)
				token.setFlag('EnhancedMovement','remainingSpeed', newSpeed-diff);
				token.refresh();
				
				//if(token.movementGrid.visible == true) token.movementGrid.highlightGrid();
			})
		}
	}
	if(typeof data.data.attributes.speed.special != 'undefined'){
		 let special = data.data.attributes.speed.special;
		
		let tokens = getTokensFromActor(actor);
		if(tokens.length > 0){
			tokens.forEach((token)=>{
				token.EnhancedMovement.getMovementTypes();
				if(canvas.hud.speedHUD.token.id == token.id)
					canvas.hud.speedHUD.updateHUD({},true)
			})
		}
	}
})
function getTokensFromActor(actor){
	return canvas.tokens.placeables.filter(t => t.actor.id === actor.id);
}

Hooks.on('renderTokenHUD',(tokenHUD,element,data)=>{
	let token = canvas.tokens.get(data._id)
	let isDashing = (token.EnhancedMovement.isDashing) ? 'active':''
	element.find('.elevation').append(`<div id="dash-btn" class="control-icon fas fa-running ${isDashing}"></div>`)
})

function checkForTerrain(x,y){
	
	if(typeof canvas.terrain.costGrid[x] == 'undefined') return false
	if(typeof canvas.terrain.costGrid[x][y] == 'undefined') return false
	return canvas.terrain.costGrid[x][y];
}
async function getPath(originPt,destPt,range,token){
	originPt = PointFactory.segmentFromPoint(originPt)
	destPt = PointFactory.segmentFromPoint(destPt)
	const path = await PathManager.pathToSegment (originPt,destPt,range);
	// const path = await pathManager.pathFromData({
	// 	"origin": originPt,
	// 	"dest": destPt,
	// 	"token": token, // Gets the width and height of the token that is being moved
	// 	"movement": range
	// })
	console.log (path.path);
}
function calcStraightLine (startCoordinates, endCoordinates) {
    var coordinatesArray = new Array();
    // Translate coordinates
    var x1 = startCoordinates[0];
    var y1 = startCoordinates[1];
    var x2 = endCoordinates[0];
    var y2 = endCoordinates[1];
    // Define differences and error check
    var dx = Math.abs(x2 - x1);
    var dy = Math.abs(y2 - y1);
    var sx = (x1 < x2) ? 1 : -1;
    var sy = (y1 < y2) ? 1 : -1;
    var err = dx - dy;
    // Set first coordinates
    //coordinatesArray.push([x1, y1]);
    // Main loop
    while (!((x1 == x2) && (y1 == y2))) {
        var e2 = err << 1;
        if (e2 > -dy) {
            err -= dy;
            x1 += sx;
        }
        if (e2 < dx) {
            err += dx;
            y1 += sy;
        }
        // Set coordinates
         coordinatesArray.push([x1, y1]);
    }
    // Return the result
    return coordinatesArray;
}