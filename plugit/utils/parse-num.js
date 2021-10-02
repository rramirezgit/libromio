module.exports = (value, onFailValue = false) => {
	return (typeof value == 'string' || typeof value == 'number') && !isNaN(value)
		? parseFloat(value)
		: onFailValue
}
