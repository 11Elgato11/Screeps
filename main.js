var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var autospawn = require('autospawn');

module.exports.loop = function () {

    // Initialize role configuration if it doesn't exist
    if (!Memory.roleConfig) {
        console.log('Initializing roleConfig in Memory');
        Memory.roleConfig = {
            harvester: 2,
            upgrader: 1,
            builder: 1
        };
    }

    // Clear memory of dead creeps
    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
        }
    }

    // Adopt any orphan or unrecognized creeps
    const KNOWN_ROLES = ['harvester', 'upgrader', 'builder'];
    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(!creep.memory.role || KNOWN_ROLES.indexOf(creep.memory.role) === -1) {
            console.log('Found unrecognized/orphan creep, re-assigning as upgrader: ' + name);
            creep.memory.role = 'upgrader';
        }
    }

    // Spawning logic
    autospawn.run();

    // Run creep roles
    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
        if(creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        }
    }
}
