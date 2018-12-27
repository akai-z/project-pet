define([
    'exports',
    'core/global',
    'core/stage',
    'core/audio',
    'core/map',
    'core/battle'
    ], function(exports, global, stage, audio, map, battle) {
    'use strict';

    // TODO: This module needs a serious overhaul later!

    // WARNING: There is a circular dependency with battle module.
    // We must get rid of it later.

    var menuPath = 'assets/art/menu/';

    var defaultFont = {
        "size_family": '22px Arial',
        "color": '#fff'
    };

    var battleMainMenusItems = {
        left: [],
        right: []
    };

    var currentLeftMenu = 'npc';

    var battleLeftMenus = {};

    var battleLeftMenusOptions = {
        'npc': {
            'selected': 0,
            'options': []
        },
        'commands': {
            'selected': 0,
            'options': []
        },
        'abilities': {
            'selected': 0,
            'options': []
        }
    };

    var battleLeftMenuStartPoint = 470;

    var battleMenusLengths = {
        'pc': 0,
        'npc': 0,
        'commands': 0,
        'abilities': 0
    };


    function getText(text, sizeFamily, color) {
        if (typeof sizeFamily == 'undefined') {
            sizeFamily = defaultFont.size_family;
        }
        if (typeof color == 'undefined') {
            color = defaultFont.color;
        }

        return new createjs.Text(text, sizeFamily, color);
    }

    function addBattleMenu() {
        var teams = battle.getTeams();

        var leftBattleMenu  = drawLeftBattleMenu(teams[1]);
        var rightBattleMenu = drawRightBattleMenu(teams[0]);

        stage.getStage().addChild(leftBattleMenu, rightBattleMenu);

        document.onkeydown = handleBattleMenuKeys;
    }

    function handleBattleMenuKeys(e) {
        if (battle.getTurn().team == 1) {
            return false;
        }

        e = e || window.event;

        switch (e.keyCode) {
            case 38:
                handleBattleMenuMovement('up');

                break;

            case 40:
                handleBattleMenuMovement('down');

                break;

            case 90:
                if (currentLeftMenu == 'abilities'
                    || (currentLeftMenu == 'commands'
                    && battleLeftMenusOptions.commands.selected == 0)) {
                    executeCommand();
                } else {
                    drawNextBattleMenu();
                }

                break;

            case 88:
                removeBattleSubMenu();

                break;
        }
    }

    function saveBattleLeftMenusItems(property, value) {
        if (typeof battleLeftMenus[currentLeftMenu] == 'undefined') {
            battleLeftMenus[currentLeftMenu] = {};
        }

        battleLeftMenus[currentLeftMenu][property] = value;
    }

    function npcMenuArrow(status) {
        if (status) {
            var arrow = setMenuArrow(120, 470);
            battleMainMenusItems.left.push(arrow);
        } else {
            stage.getStage().removeChild(battleLeftMenus['npc'].arrow);
        }
    }

    function setMenuArrow(x, y) {
        var arrow = new createjs.Bitmap(menuPath + 'menu_arrow.png');

        arrow.x = x;
        arrow.y = y;

        saveBattleLeftMenusItems('arrow', arrow);

        stage.getStage().addChild(arrow);
    }

    function drawLeftBattleMenu(npc, skipMenu) {
        if (!skipMenu) {
            var menu = new createjs.Bitmap(menuPath + 'battle_left.png');

            menu.y = 460;
            menu.x = 70;

            stage.getStage().addChild(menu);
        }

        $.each(npc, function(i, item) {
            var _npc = getText(item.name);
            if (i == 0) {
                _npc.y = 470;
                _npc.x = 150;
            } else if (i == 1) {
                _npc.y = 500;
                _npc.x = 150;
            } else if (i == 2) {
                _npc.y = 530;
                _npc.x = 150;
            } else if (i == 3) {
                _npc.y = 560;
                _npc.x = 150;
            }

            battleMenusLengths.npc = _npc.y;
            battleMainMenusItems.left.push(_npc);
            battleLeftMenusOptions[currentLeftMenu].options.push(item);

            stage.getStage().addChild(_npc);
        });

        if (battle.getTurn().team == 0 && !skipMenu) {
            setMenuArrow(120, 470);
        }
    }

    function drawRightBattleMenu(pc, skipMenu) {
        if (!skipMenu) {
            var menu = new createjs.Bitmap(menuPath + 'battle_right.png');

            menu.y = 460;
            menu.x = 310;

            stage.getStage().addChild(menu);
        }

        var character = '';
        var hp = '';
        //var mp = '';

        $.each(pc, function(i, item) {
            character = getText(item.name);
            hp = getText(item.stats.hp);
            //mp = getText(item.stats.hp);

            if (i == 0) {
                character.y = 470;
                character.x = 340;

                hp.x = 480;
                hp.y = 470;

                //mp.x = 540;
                //mp.y = 470;
            } else if (i == 1) {
                character.y = 500;
                character.x = 340;

                hp.x = 480;
                hp.y = 500;

                //mp.x = 540;
                //mp.y = 500;
            } else if (i == 2) {
                character.y = 530;
                character.x = 340;

                hp.x = 480;
                hp.y = 530;

                //mp.x = 540;
                //mp.y = 530;
            } else if (i == 3) {
                character.y = 560;
                character.x = 340;

                hp.x = 480;
                hp.y = 560;

                //mp.x = 540;
                //mp.y = 560;
            }

            battleMenusLengths.pc = character.y;
            battleMainMenusItems.right.push([character, hp/*, mp*/]);

            stage.getStage().addChild(character, hp/*, mp*/);
        });
    }

    function handleBattleMenuMovement(direction) {
        var arrow = battleLeftMenus[currentLeftMenu].arrow;

        if (direction == 'up') {
            if ((arrow.y - 30) > battleLeftMenuStartPoint) {
                arrow.y -= 30;
                battleLeftMenusOptions[currentLeftMenu].selected--;
            } else {
                if ((arrow.y - 30) == battleLeftMenuStartPoint) {
                    battleLeftMenusOptions[currentLeftMenu].selected--;
                }

                arrow.y = battleLeftMenuStartPoint;
            }
        } else if (direction == 'down') {
            if ((arrow.y + 30) < battleMenusLengths[currentLeftMenu]) {
                arrow.y += 30;
                battleLeftMenusOptions[currentLeftMenu].selected++;
            } else {
                if ((arrow.y + 30) == battleMenusLengths[currentLeftMenu]) {
                    battleLeftMenusOptions[currentLeftMenu].selected++;
                }

                arrow.y = battleMenusLengths[currentLeftMenu];
            }
        }
    }

    function drawNextBattleMenu() {
        var selectedCharacter = battle.getSelectedCharacter();

        switch (currentLeftMenu) {
            case 'npc':
                currentLeftMenu = 'commands';
                drawBattleCommandsMenu(selectedCharacter);

                break;

            case 'commands':
                currentLeftMenu = 'abilities';
                drawBattleAbilitiesMenu(selectedCharacter);

                break;
        }
    }

    function removeBattleSubMenu() {
        if (currentLeftMenu != 'npc') {
            $.each(battleLeftMenus[currentLeftMenu], function(i, component) {
                stage.getStage().removeChild(component);
            });
        }

        switch (currentLeftMenu) {
            case 'commands':
                currentLeftMenu = 'npc';

                break;

            case 'abilities':
                currentLeftMenu = 'commands';

                break;
        }
    }

    function drawBattleCommandsMenu(character) {
        var menu = new createjs.Bitmap(menuPath + 'battle_commands.png');

        menu.y = 460;
        menu.x = 90;

        var attack = getText('Attack');

        attack.y = 470;
        attack.x = 160;

        battleMenusLengths.commands = attack.y;
        battleLeftMenusOptions[currentLeftMenu].options.push('attack');

        stage.getStage().addChild(menu, attack);

        saveBattleLeftMenusItems('menu', menu);
        saveBattleLeftMenusItems('attack', attack);

        // TODO: Disabled due to some glitches caused by it.
        // switch (character.type) {
        //     case 'physical':
        //         var skills = getText('Skills');

        //         skills.y = 500;
        //         skills.x = 160;

        //         battleMenusLengths.commands = skills.y;
        //         battleLeftMenusOptions[currentLeftMenu].options.push('skills');

        //         stage.getStage().addChild(skills);
        //         saveBattleLeftMenusItems('skills', skills);

        //         break;

        //     case 'magic':
        //         var magic  = getText('Magic');

        //         magic.y = 500;
        //         magic.x = 160;

        //         battleMenusLengths.commands = magic.y;
        //         battleLeftMenusOptions[currentLeftMenu].options.push('magic');

        //         stage.getStage().addChild(magic);
        //         saveBattleLeftMenusItems('magic', magic);

        //         break;
        // }

        setMenuArrow(120, 470);
    }

    function drawBattleAbilitiesMenu(character) {
        var menu = new createjs.Bitmap(menuPath + 'battle_commands.png');

        menu.y = 460;
        menu.x = 90;

        var abilityType = character.type == 'physical'
            ? 'skills' : 'magic';

        var abilityItemPosition = {
            y: 160,
            x: 470
        };

        stage.getStage().addChild(menu);
        saveBattleLeftMenusItems('menu', menu);

        $.each(character.abilities[abilityType], function(i, ability) {
            var abilityText = getText(i);

            abilityText.y = abilityItemPosition.y;
            abilityText.x = abilityItemPosition.x + 33;

            stage.getStage().addChild(abilityText);
            saveBattleLeftMenusItems(i, abilityText);

            battleLeftMenusOptions[currentLeftMenu].options.push(i);
        });

        setMenuArrow(120, 470);
    }

    function update(menu) {
        var teams = battle.getTeams();

        switch (menu) {
            case 'left':
                $.each(battleMainMenusItems.left, function(i, item) {
                    stage.getStage().removeChild(item);
                });

                drawLeftBattleMenu(teams[1], true);

                break;

            case 'right':
                $.each(battleMainMenusItems.right, function(i, item) {
                    stage.getStage().removeChild(item[0], item[1], item[2]);
                });

                drawRightBattleMenu(teams[0], true);

                break;
        }
    }

    function executeCommand() {
        var target = battleLeftMenusOptions['npc'].selected;

        if (currentLeftMenu == 'commands') {
            battle.executeCommand(
                { 'attack': 'attack' },
                target
            );
        }
        if (currentLeftMenu == 'abilities') {
            var command = battleLeftMenusOptions[currentLeftMenu].options[
                battleLeftMenusOptions[currentLeftMenu].selected
            ];

            battle.executeCommand(
                { command: command },
                target
            );
        }

        removeBattleSubMenu();
        //stage.getStage().removeChild(battleLeftMenus['npc'].arrow);
    }

    function removeBattleMenuKeysHandler() {
        document.onkeydown = null;
    }

    exports.addBattleMenu = addBattleMenu;
    exports.npcMenuArrow = npcMenuArrow;
    exports.update = update;
    exports.removeBattleMenuKeysHandler = removeBattleMenuKeysHandler;

    return {
        addBattleMenu: addBattleMenu,
        npcMenuArrow: npcMenuArrow,
        update: update,
        removeBattleMenuKeysHandler: removeBattleMenuKeysHandler
    }
});
