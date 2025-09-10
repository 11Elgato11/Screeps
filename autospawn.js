var autospawn = {
    /**
     * Creates a creep body based on the available energy and the role.
     * @param {number} energy - The available energy.
     * @param {string} role - The role of the creep.
     * @returns {string[]} - The creep body.
     */
    createCreepBody: function(energy, role) {
        var body = [];
        var segmentCost = BODYPART_COST[WORK] + BODYPART_COST[CARRY] + BODYPART_COST[MOVE]; // 200
        var numParts = Math.floor(energy / segmentCost);

        // Make sure we don't exceed the 50 parts limit
        numParts = Math.min(numParts, Math.floor(50 / 3));

        for (var i = 0; i < numParts; i++) {
            body.push(WORK);
        }
        for (var i = 0; i < numParts; i++) {
            body.push(CARRY);
        }
        for (var i = 0; i < numParts; i++) {
            body.push(MOVE);
        }

        // If we can't even afford a basic creep, spawn a basic one and let the spawner wait.
        if (body.length == 0) {
            return [WORK, CARRY, MOVE];
        }

        return body;
    },

    run: function() {
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
                    var energy = Game.spawns['Spawn1'].room.energyCapacityAvailable;
                    var body = this.createCreepBody(energy, 'harvester');
                    Game.spawns['Spawn1'].spawnCreep(body, newName, {
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
            var energy = Game.spawns['Spawn1'].room.energyCapacityAvailable;
            var body = this.createCreepBody(energy, 'upgrader');
            Game.spawns['Spawn1'].spawnCreep(body, newName,
                {memory: {role: 'upgrader'}});
        }
        else if(builders.length < Memory.roleConfig.builder && Game.spawns['Spawn1'].room.find(FIND_CONSTRUCTION_SITES).length > 0) {
            var newName = 'Builder' + Game.time;
            var energy = Game.spawns['Spawn1'].room.energyCapacityAvailable;
            var body = this.createCreepBody(energy, 'builder');
            Game.spawns['Spawn1'].spawnCreep(body, newName,
                {memory: {role: 'builder'}});
        }

        // Spawning visualization
        if(Game.spawns['Spawn1'].spawning) {
            var spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
            var role = spawningCreep.memory.role;
            if (typeof role === 'string') {
                Game.spawns['Spawn1'].room.visual.text(
                    '🛠️' + role,
                    Game.spawns['Spawn1'].pos.x + 1,
                    Game.spawns['Spawn1'].pos.y,
                    {align: 'left', opacity: 0.8});
            }
        }
    }
};

module.exports = autospawn;
