var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {

        // Self-correction for legacy harvesters without a sourceId
        if (creep.memory.sourceId === undefined) {
            console.log('Harvester ' + creep.name + ' has no sourceId, assigning one.');
            var sources = creep.room.find(FIND_SOURCES);
            // A simple way to distribute un-assigned harvesters
            var index = (creep.name.charCodeAt(creep.name.length - 1)) % sources.length;
            creep.memory.sourceId = sources[index].id;
        }

        if(creep.memory.harvesting && creep.store.getFreeCapacity() == 0) {
            creep.memory.harvesting = false;
            creep.say('🔄 deliver');
        }
        if(!creep.memory.harvesting && creep.store.getUsedCapacity() == 0) {
            creep.memory.harvesting = true;
            creep.say('⚡ harvest');
        }

        if(creep.memory.harvesting) {
            var source = Game.getObjectById(creep.memory.sourceId);
            if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
        else {
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                            structure.structureType == STRUCTURE_SPAWN ||
                            structure.structureType == STRUCTURE_TOWER) &&
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
            });
            if(targets.length > 0) {
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            } else {
                // If there are no targets, upgrade the controller
                if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }
    }
};

module.exports = roleHarvester;
