Date.prototype.getWeek = function() {
    var onejan = new Date(this.getFullYear(), 0, 1);
    return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
};


Date.prototype.addDays = function(days) {
    this.setDate(this.getDate() + parseInt(days));
    return this;
};

Date.prototype.addMinutes = function(min){
    this.setTime(this.getTime() + min*60000);
    return this;

};

Date.prototype.isLearnFinished = function(time) {
    var today = new Date();
    var first = this;
    if(first.addDays(time) <= today){
        return true;
    }else{
        return false;
    }
};

Array.prototype.unique = function()
{
	var n = {},r=[];
	for(var i = 0; i < this.length; i++) 
	{
		if (!n[this[i]]) 
		{
			n[this[i]] = true; 
			r.push(this[i]); 
		}
	}
	return r;
};
