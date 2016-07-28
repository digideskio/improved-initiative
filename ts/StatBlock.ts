module ImprovedInitiative {
    export interface AbilityScores {
        Str: number;
        Dex: number;
        Con: number;
        Cha: number;
        Int: number;
        Wis: number;
    }

    export interface NameAndModifier {
        Name: string;
        Modifier: number;
    }

    export interface ValueAndNotes {
        Value: number;
        Notes: string;
    }

    export interface NameAndContent {
        Name: string;
        Content: string;
        Usage?: string;
    }

    export interface IHaveTrackerStats {
        Id?: number;
        Player?: string;
        Type?: string;
        Name: string;
        HP: ValueAndNotes;
        AC: ValueAndNotes;
        InitiativeModifier?: number;
        Abilities: AbilityScores;
    }

    export interface IStatBlock {
        Name: string;
        Type: string;
        HP: ValueAndNotes;
        AC: ValueAndNotes;
        Speed: string[];
        Abilities: AbilityScores;
        InitiativeModifier?: number;
        DamageVulnerabilities: string[];
        DamageResistances: string[];
        DamageImmunities: string[];
        ConditionImmunities: string[];
        Saves: NameAndModifier[];
        Skills: NameAndModifier[];
        Senses: string[];
        Languages: string[];
        Challenge: string;
        Traits: NameAndContent[];
        Actions: NameAndContent[];
        Reactions: NameAndContent[];
        LegendaryActions: NameAndContent[];
        Player: string;
    }

    export class StatBlock {
        static Empty = (mutator?: (s: IStatBlock) => void): IStatBlock => {
            var statBlock = {
                Name: '', Type: '',
                HP: { Value: 1, Notes: '1d1+0' }, AC: { Value: 10, Notes: '' },
                Speed: [],
                Abilities: { Str: 10, Dex: 10, Con: 10, Cha: 10, Int: 10, Wis: 10 },
                DamageVulnerabilities: [], DamageResistances: [], DamageImmunities: [], ConditionImmunities: [],
                Saves: [], Skills: [], Senses: [], Languages: [],
                Challenge: '',
                Traits: [],
                Actions: [],
                Reactions: [],
                LegendaryActions: [],
                Player: ''
            };
            if (mutator) { mutator(statBlock) };
            return statBlock;
        }

        static AbilityNames = ["Str", "Dex", "Con", "Cha", "Int", "Wis"]
    }

    export var SimplifyStatBlock: (statblock: IStatBlock) => IStatBlock = (statBlock) => {
        return {
            Abilities: statBlock.Abilities,
            AC: statBlock.AC,
            Actions: [],
            Reactions: [],
            Challenge: statBlock.Challenge,
            ConditionImmunities: [],
            DamageImmunities: [],
            DamageResistances: [],
            DamageVulnerabilities: [],
            HP: statBlock.HP,
            InitiativeModifier: statBlock.InitiativeModifier,
            Languages: [],
            LegendaryActions: [],
            Saves: [],
            Senses: [],
            Skills: [],
            Speed: statBlock.Speed,
            Name: statBlock.Name,
            Player: statBlock.Player,
            Traits: [],
            Type: statBlock.Type
        };
    }
}
