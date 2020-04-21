const { CardFactory } = require('botbuilder-core');
var Dropdown = require('./adaptive.json')
var symptoms = require('./symptos.json')
var medical = require('./medical.json')
// var Carausolcard= require('./Responses/CarausolCard.json')
var Cards = {
    "states": Dropdown,
    "symptoms":symptoms,
    "medical":medical
}

module.exports=Cards