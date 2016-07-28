module ImprovedInitiative {
    export interface ICreature {
        Id: number;
        Encounter: Encounter;
        Alias: KnockoutObservable<string>;
        IndexLabel: number;
        MaxHP: number;
        CurrentHP: KnockoutObservable<number>;
        TemporaryHP: KnockoutObservable<number>;
        AC: number;
        AbilityModifiers: AbilityScores;
        Tags: KnockoutObservableArray<string>;
        InitiativeModifier: number;
        Initiative: KnockoutObservable<number>;
        Hidden: KnockoutObservable<boolean>;
        StatBlock: KnockoutObservable<IStatBlock>;
        RollInitiative: (userPollQueue: UserPollQueue) => void;
        ViewModel: CombatantViewModel;
        IsPlayerCharacter: boolean;
    }

    export class Creature implements ICreature {
        static nextId = 0;

        constructor(creatureJson, public Encounter: Encounter, savedCreature?: ISavedCreature) {
            var statBlock: IStatBlock = jQuery.extend(StatBlock.Empty(), creatureJson);

            if (savedCreature) {
                statBlock.HP.Value = savedCreature.MaxHP || savedCreature.Statblock.HP.Value;
                this.Id = savedCreature.Id || Creature.nextId++;
            } else {
                statBlock.HP.Value = this.getMaxHP(statBlock.HP);
                this.Id = Creature.nextId++;
            }

            this.StatBlock(statBlock);

            this.processStatBlock(statBlock);

            this.StatBlock.subscribe((newStatBlock) => {
                this.processStatBlock(newStatBlock, statBlock);
                statBlock = newStatBlock;
            });

            this.CurrentHP = ko.observable(this.MaxHP);

            if (savedCreature) {
                this.processSavedCreature(savedCreature);
            }
        }

        Id = 0;
        Alias = ko.observable(null);
        TemporaryHP = ko.observable(0);
        Tags = ko.observableArray<string>();
        Initiative = ko.observable(0);
        StatBlock = ko.observable<IStatBlock>();
        Hidden = ko.observable(false);

        IndexLabel: number;
        MaxHP: number;
        CurrentHP: KnockoutObservable<number>;
        PlayerDisplayHP: KnockoutComputed<string>;
        AC: number;
        AbilityModifiers: AbilityScores;
        NewTag: KnockoutObservable<string>;
        InitiativeModifier: number;
        ViewModel: any;
        IsPlayerCharacter = false;

        private processStatBlock(newStatBlock: IStatBlock, oldStatBlock?: IStatBlock) {
            this.setIndexLabel(oldStatBlock && oldStatBlock.Name);
            this.IsPlayerCharacter = newStatBlock.Player == "player";
            this.AC = newStatBlock.AC.Value;
            this.MaxHP = newStatBlock.HP.Value;
            this.AbilityModifiers = this.calculateModifiers();
            this.InitiativeModifier = newStatBlock.InitiativeModifier || this.AbilityModifiers.Dex || 0;
        }

        private processSavedCreature(savedCreature: ISavedCreature) {
            this.IndexLabel = savedCreature.IndexLabel;
            this.CurrentHP(savedCreature.CurrentHP);
            this.TemporaryHP(savedCreature.TemporaryHP);
            this.Initiative(savedCreature.Initiative);
            this.Alias(savedCreature.Alias);
            this.Tags(savedCreature.Tags);
            this.Hidden(savedCreature.Hidden);
        }

        private getMaxHP(HP: ValueAndNotes) {
            if (Store.Load(Store.User, "RollMonsterHp")) {
                try {
                    return this.Encounter.Rules.RollHpExpression(HP.Notes).Total;
                } catch (e) {
                    return HP.Value;
                }
            }
            return HP.Value;
        }

        private setIndexLabel(oldName?: string) {
            var name = this.StatBlock().Name,
                counts = this.Encounter.CreatureCountsByName;
            if (name == oldName) {
                return;
            }
            if (oldName) {
                counts[oldName](counts[oldName]() - 1);
            }
            if (!counts[name]) {
                counts[name] = ko.observable(1);
            } else {
                counts[name](counts[name]() + 1);
            }
            this.IndexLabel = counts[name]();
        }

        private calculateModifiers = () => {
            var modifiers = StatBlock.Empty().Abilities;
            for (var attribute in this.StatBlock().Abilities) {
                modifiers[attribute] = this.Encounter.Rules.Modifier(this.StatBlock().Abilities[attribute]);
            }
            return modifiers;
        }

        RollInitiative = (userPollQueue: UserPollQueue) => {
            var roll = this.Encounter.Rules.Check(this.InitiativeModifier);
            this.Initiative(roll);
            return roll;
        }
    }
}
