define([
    'core/battle'
    ], function(battle) {
    'use strict';

    function getAction() {
        var teams = battle.getTeams();

        return {
            action: selectAttack(),
            target: selectTarget(teams[0])
        };
    }

    function selectAttack() {
        var attack = { attack: 'attack' };
        var selectedCharacter = battle.getSelectedCharacter();

        var abilities = selectedCharacter.abilities;
        var abilitiesLength = 0;

        $.each(abilities, function(i) {
            abilitiesLength++;
        });

        var possibleCommands = abilitiesLength + 1;
        var selectedCommand  = Math.floor(
            (Math.random() * possibleCommands) + 1
        );

        //if (selectedCommand != 1) {
            //attack = selectAbility(abilities, selectedCommand);
        //}

        return attack;
    }

    function getAbilityType(abilities, selectedCommand) {
        var abilityType = null;
        var counter = 2;

        $.each(abilities, function(i, ability) {
            if (counter == selectedCommand) {
                abilityType = ability;
                return false;
            }

            counter++;
        });

        return abilityType;
    }

    function selectAbility(abilities, selectedCommand) {
        var abilityType = getAbilityType(abilities, selectedCommand);
        var abilityTypeLength = 0;
        var counter = 2;
        var result  = {};

        $.each(abilityType, function(i) {
            abilityTypeLength++;
        });

        var possibleAbilities = abilityType.length;
        var selectedAbility   = Math.floor(
            (Math.random() * possibleAbilities) + 1
        );

        $.each(possibleAbilities, function(i, ability) {
            if (counter == selectedAbility) {
                selectedAbility = ability;
                return false;
            }

            counter++;
        });

        result[abilityType] = selectedAbility;

        return result;
    }

    function selectTarget(targets) {
        return Math.floor((Math.random() * targets.length) + 0);
    }

    return {
        getAction: getAction
    };
});
