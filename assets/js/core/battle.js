define([
    'exports',
    'core/global',
    'core/stage',
    'core/audio',
    'core/character',
    'core/sprite',
    'core/menu',
    'core/ai',
    'core/map'
    ], function(exports, global, stage, audio, character, sprite, menu, ai, map) {
    'use strict';

    // WARNING: There is a circular dependency with menu module.
    // We must get rid of it.

    var battleImgPath = 'assets/art/battle/';

    var teamInfo = [
        [], []
    ];

    var turn = {
        team: -1,
        members: [0, 0]
    };

    // TODO: This must never be hardcoded.
    // So, it should be done properly later.
    var viewSize = [441, 800];

    // TODO: This is so bad/evil and must never be hardcoded.
    // The positions must be relative.
    // But, just for the tech demo and because of lack of time,
    // they are temporarily hardcoded.
    var membersViewPostions = [
        [
            { x: 660, y: 176 },
            { x: 680, y: 234 },
            { x: 700, y: 292 },
            { x: 720, y: 350 }
        ],
        [
            { x: 70, y: 100 },
            { x: 10, y: 250 },
            { x: 240, y: 100 },
            { x: 180, y: 250 }
        ]
    ];

    var selectedCharacter = {
        pc: null,
        npc: null
    };

    var selectedCharacter = {};

    var target = {
        index: 0,
        character: {}
    };

    var battleStatus = false;

    function setBattle(_battle) {
        var battle = getBattle(_battle);
        battleStatus = true;

        setBackground(battle.image);
        setTeams();
        setTeamFirstTurn();
        putCharactersOnTheField();
        menu.addBattleMenu();

        if (typeof battle.bgm_id != 'undefined') {
            audio.stop();
            audio.play('bgm', battle.bgm_id);
        }
    }

    function getBattle(id) {
        var battleData = global.getData('db', 'battlefields');

        if (typeof id == 'undefined') {
            return battleData;
        }

        var battle    = {};
        var query     = 'SELECT * FROM ? WHERE id = ?';
        var queryData = [battleData, id];

        alasql(
            query,
            queryData,
            function(_battle) {
                battle = _battle[0];
            }
        );

        return battle;
    }

    function getNumberOfEnemies() {
        // return Math.floor((Math.random() * 4) + 1);
        return 1; // Random number of enemies is disabled due to a bug related to it.
    }

    function getEnemies(isBoss, includeSprites) {
        var enemiesCount = getNumberOfEnemies();
        var enemies      = character.getEnemyNpc(isBoss, includeSprites);
        var selectedEnemies = [];

        var random = 0;

        while (selectedEnemies.length < enemiesCount) {
            random = Math.floor(Math.random() * enemies.length);
            selectedEnemies.push(enemies[random]);
        }

        return selectedEnemies;
    }

    function getTeams() {
        return teamInfo;
    }

    function setTeams(isBoss) {
        teamInfo = [
            character.getPlayableCharacters(true),
            getEnemies(isBoss, true)
        ];
    }

    function setBackground(background) {
        var image = new createjs.Bitmap(battleImgPath + background);

        image.scaleX = 3.4;
        image.scaleY = 3.13;

        stage.removeChildren();
        stage.addChild(image);
    }

    function putCharactersOnTheField() {
        putPcOnTheField();
        putNpcOnTheField();
    }

    function putPcOnTheField() {
        $.each(teamInfo[0], function(i, member) {
            var _sprite = sprite.createSprite(
                member,
                'characters',
                membersViewPostions[0][i],
                '',
                character.pcSpriteSheetFrames,
                character.pcSpriteSheetAnimations
            );

            teamInfo[0][i].sprite_object = _sprite;

            // sprite.play(_sprite, 'still_frame_left');
            _sprite.gotoAndPlay('still_frame_left');
        });
    }

    function putNpcOnTheField() {
        $.each(teamInfo[1], function(i, member) {
            var stillFrame = character.getStillFrame(member);

            var _sprite = sprite.createSprite(
                member,
                'characters',
                membersViewPostions[1][i],
                '',
                [stillFrame]
            );

            teamInfo[1][i].sprite_object = _sprite;
        });
    }

    function goToMap() {
        stage.removeChildren();

        sprite.initKeys();
        sprite.initMovementLimits();

        map.setMap('map');
        map.setMap('edges');

        var mainCharacter = character.getMainPlayableCharacter(true);

        var _sprite = sprite.createSprite(
            mainCharacter,
            'characters',
            {
                "x": 250,
                "y": 250
            },
            {
                "x": 3,
                "y": 3
            },
            character.pcSpriteSheetFrames,
            character.pcSpriteSheetAnimations
        );

        sprite.play(_sprite, 'walk_down');
    }

    function goToGameOver() {
        stage.removeChildren();
    }

    function executeCommand(command, target) {
        setSelectedTarget(target);

        var damage = getDamage(command);
        var commandType = '';
        var action = '';

        $.each(command, function(type, _action) {
            commandType = type;
            action = _action;
        });

        setCommandEffect(commandType, damage);

        removeDeadMembers();

        var teamStatus = checkTeamStatus();

        if (teamStatus == 0) {
            battleStatus = false;
            menu.removeBattleMenuKeysHandler();

            if (turn.team == 0) {
                // goToGameOver();
                goToMap(); // There is a bug related to game over part, and is set to return to map as a workaround.
            } else {
                goToMap();
            }

            return;
        } else {
            if (turn.team == 0) {
                menu.update('left');
                //menu.npcMenuArrow(false);
            } else {
                menu.update('right');
                //menu.npcMenuArrow(true);
            }

            setNextTurn();
        }
    }

    function getDamage(commandType, action) {
        var damage = 1;
        var commandType = 'attack';

        switch (commandType) {
            case 'attack':
                damage = calculatePhysicalAttack();
                break;
            case 'skill':
                damage = calculatePhysicalAttack(action);
                break;
            case 'magic':
                damage = calculateMagicAttack(action);
                break;
        }

        return damage;
    }

    function setCommandEffect(type, statEffect) {
        var targetTeam = turn.team > 0
            ? turn.team - 1
            : turn.team + 1;

        switch (type) {
            case 'attack':
                target.character.stats.hp -= statEffect;
                teamInfo[targetTeam][target.index] = target.character;

                break;
        }
    }

    function checkTeamStatus() {
        var targetTeam = turn.team > 0
            ? turn.team - 1
            : turn.team + 1;

        return teamInfo[targetTeam].length;
    }

    function removeDeadMembers() {
        var targetTeam = turn.team > 0
            ? turn.team - 1
            : turn.team + 1;

        var currentTeam = [];

        $.each(teamInfo[targetTeam], function(i, member) {
            if (member.stats.hp <= 0) {
                stage.getStage().removeChild(member.sprite_object);
                delete teamInfo[targetTeam][i];
            }
        });

        $.each(teamInfo[targetTeam], function(i, member) {
            if (typeof member != 'undefined') {
                currentTeam.push(teamInfo[targetTeam][i])
            }
        });

        teamInfo[targetTeam] = currentTeam;
    }

    function getTurn() {
        return {
            team: turn.team,
            member: turn.members[turn.team]
        };
    }

    function setTeamFirstTurn() {
        if (turn.team == -1) {
            turn.team = Math.floor(Math.random() * 2) + 0;

            setSelectedCharacter(
                teamInfo[turn.team][turn.members[turn.team]]
            );
        }

        if (turn.team == 1) {
            executeEnemyAction();
        }
    }

    function setNextTurn() {
        if ((turn.members[turn.team] + 1) < teamInfo[turn.team].length) {
            turn.members[turn.team]++;
        } else {
            turn.members[turn.team] = 0;
        }

        while (typeof teamInfo[turn.team][turn.members[turn.team]] == 'undefined') {
            if ((turn.members[turn.team] + 1) < teamInfo[turn.team].length) {
                turn.members[turn.team]++;
            } else {
                turn.members[turn.team] = 0;
            }
        }

        if (turn.team < 1) {
            turn.team++;
        } else {
            turn.team--;
        }

        setSelectedCharacter(
            teamInfo[turn.team][turn.members[turn.team]]
        );

        if (turn.team > 0) {
            executeEnemyAction();
        }
    }

    function getSelectedCharacter() {
        return selectedCharacter;
    }

    function setSelectedCharacter(character) {
        //var characterType = character.is_npc ? 'npc' : 'pc';
        selectedCharacter = character;
    }

    function getSelectedTarget() {
        return target;
    }

    function setSelectedTarget(targetNo) {
        var targetTeam = turn.team > 0
            ? turn.team - 1
            : turn.team + 1;

        target = {
            index: targetNo,
            character: teamInfo[targetTeam][targetNo]
        };
    }

    function calculatePhysicalAttack(_skill) {
        var character = selectedCharacter;

        var additional = typeof _skill != 'undefined'
            ? character.abilities.skill[_skill].damage
            : character.normal_attack.power;

        var damage = ((character.stats.ap * 11.125) - target.character.stats.dp)
                   + additional;

        return Math.floor(damage);
    }

    function calculateMagicAttack(ability) {
        var character = selectedCharacter;
        var damage = ((character.stats.mpow * 11.125) - target.character.stats.md)
                   + character.abilities.magic[ability].power;
                   //+ character.abilities[magicType][ability].power;

        return Math.floor(damage);
    }

    function executeEnemyAction() {
        var action = ai.decideAction();
        executeCommand(action.action, action.target);
    }

    function getBattleStatus() {
        return battleStatus;
    }

    function preload(queue) {
        $.each(getBattle(), function(i, background) {
            // Using loadManifest in this case would be better.
            // But unfortunately, you cannot specify a type in it.
            queue.loadFile({
                id:'battle_' + background.id,
                src: background.image,
                type: createjs.AbstractLoader.IMAGE
            }, false, battleImgPath);
        });

        return queue;
    }

    exports.setBattle = setBattle;
    exports.getTeams = getTeams;
    exports.getTurn  = getTurn;
    exports.executeCommand = executeCommand;
    exports.getSelectedCharacter = getSelectedCharacter;
    exports.getBattleStatus = getBattleStatus;

    return {
        setBattle: setBattle,
        getBattle: getBattle,
        getTeams: getTeams,
        getEnemies: getEnemies,
        setBackground: setBackground,
        getSelectedCharacter: getSelectedCharacter,
        getBattleStatus: getBattleStatus,
        preload: preload
    };
});
