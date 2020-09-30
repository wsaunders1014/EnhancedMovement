
export default class EnhancedMovement {
	constructor(token){
		
		this.totalSpeed = 0;
		
		this.token = token;
		this.actor = this.token.actor;
		this.isDashing =  this.token.getFlag('EnhancedMovement','isDashing') || false;
		this.movementMode = (typeof this.token.getFlag('EnhancedMovement','movementMode') != 'undefined') ? this.token.getFlag('EnhancedMovement','movementMode'):'walk';
		this.nDiagonals = this.token.getFlag('EnhancedMovement','nDiagonal') || 0;
		
		this._speeds = this.actor.data.data.attributes.speed;

		this.movementTypes = {
			walk:{
				maxSpeed:parseFloat(this._speeds.value)
			}
		}
		this.getMovementTypes();
		this.remainingSpeed = (typeof this.token.getFlag('EnhancedMovement','remainingSpeed') != 'undefined') ?  this.token.getFlag('EnhancedMovement','remainingSpeed'):this.maxSpeed;
	}
	get maxSpeed(){
		return this.movementTypes[this.movementMode].maxSpeed;
	}
	getMovementTypes(){
		console.log('test',this._speeds)
		if(this._speeds.special == "") {
			this.movementTypes = {
				walk:{
					maxSpeed:parseFloat(this._speeds.value)
				}
			}
		}else{

			let array = this._speeds.special.split(',');
			array.forEach((text)=>{
				text = text.trim();
				let breakit = text.split(' ');
				let type = breakit[0];
				let speed = parseFloat(breakit[1]);
				this.movementTypes[type.toLowerCase()]={
					maxSpeed:speed
				}
			})
		}
	}
	addMovementType(type,speed){
		type = type.toLowerCase();
		speed = parseFloat(speed);
		this.movementTypes[type.toLowerCase()]={
			maxSpeed:speed
		}
	}
	switchType(type){
		this.movementMode = type.toLowerCase();
		if(typeof game.combat != null){
			if( typeof game.combat.combatant !='undefined'){
				if(game.combat.combatant.tokenId != this.token.id)
					this.remainingSpeed = 0;
			}
		}else
			this.remainingSpeed = (this.maxSpeed * ((this.isDashing) ? 2:1)) - this.totalSpeed;
		this.token.refresh()
		this.token.setFlag('EnhancedMovement','movementMode',this.movementMode)
	}
	reset(){
		console.log('reset EnhancedMovement')
		this.totalSpeed = 0;
		this.remainingSpeed = this.maxSpeed;
		this.isDashing = false;
		this.token.setFlag('EnhancedMovement','remainingSpeed',this.maxSpeed)
		this.token.setFlag('EnhancedMovement','nDiagonal',0)
		this.token.setFlag('EnhancedMovement','isDashing', false)
		if(canvas.hud.speedHUD.token != false){
			canvas.hud.speedHUD.updateHUD({},true)
		}
		this.token.refresh();
	}
	endTurn(){
		this.totalSpeed = 0;
		this.remainingSpeed = 0;
		this.isDashing = false;
		this.token.refresh();
		this.token.setFlag('EnhancedMovement','remainingSpeed',0)
		this.token.setFlag('EnhancedMovement','isDashing', false)
	}
	dash(){
		this.isDashing = true;
		this.token.setFlag('EnhancedMovement','isDashing', true)
		this.remainingSpeed = this.remainingSpeed + this.maxSpeed;
		this.token.setFlag('EnhancedMovement','remainingSpeed',this.remainingSpeed);
		if(canvas.hud.speedHUD.token){
			canvas.hud.speedHUD.updateHUD({},true)
		}

	}
	unDash(){
		this.isDashing = false;
		this.token.setFlag('EnhancedMovement','isDashing', false)
		this.remainingSpeed = this.remainingSpeed - this.maxSpeed;
		this.token.setFlag('EnhancedMovement','remainingSpeed',this.remainingSpeed);
		if(canvas.hud.speedHUD.token){
			canvas.hud.speedHUD.updateHUD({},true)
		}
	}
}
