var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');

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

    // Get current creep counts
    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
    var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');

    // Spawning logic using memory configuration
    if(harvesters.length < Memory.roleConfig.harvester) {
        // Find all sources in the room
        var sources = Game.spawns['Spawn1'].room.find(FIND_SOURCES);
        // Find a source that isn't being harvested yet
        for (var i = 0; i < sources.length; i++) {
            var source = sources[i];
            // Check if a harvester is already assigned to this source
            var harvesters_assigned = _.filter(Game.creeps, (creep) =>
                creep.memory.role == 'harvester' && creep.memory.sourceId == source.id);

            if (harvesters_assigned.length == 0) {
                // This source is free, let's assign it
                var newName = 'Harvester' + Game.time;
                Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,MOVE], newName, {
                    memory: {
                        role: 'harvester',
                        sourceId: source.id
                    }
                });
                break; // Exit the loop once we've started spawning
            }
        }
    }
    else if(upgraders.length < Memory.roleConfig.upgrader) {
        var newName = 'Upgrader' + Game.time;
        Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,MOVE], newName,
            {memory: {role: 'upgrader'}});
    }
    else if(builders.length < Memory.roleConfig.builder && Game.spawns['Spawn1'].room.find(FIND_CONSTRUCTION_SITES).length > 0) {
        var newName = 'Builder' + Game.time;
        Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,MOVE], newName,
            {memory: {role: 'builder'}});
    }

    // Spawning visualization
    if(Game.spawns['Spawn1'].spawning) {
        var spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
        Game.spawns['Spawn1'].room.visual.text(
            '🛠️' + spawningCreep.memory.role,
            Game.spawns['Spawn1'].pos.x + 1,
            Game.spawns['Spawn1'].pos.y,
            {align: 'left', opacity: 0.8});
    }

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
