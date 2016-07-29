from glob import glob
from json import dump
from os.path import basename
from xml.etree.ElementTree import iterparse

def make_monster():
	return {
	'Name': '',
	'Source': '',
	'Type': '',
	'HP': {'Value': None, 'Notes': ''},
	'AC': {'Value': None, 'Notes': ''},
	'Speed': [],
	'Abilities': {'Str': None, 'Dex': None, 'Con': None, 'Int': None, 'Wis': None, 'Cha': None},
	'DamageVulnerabilities': [],
	'DamageResistances': [],
	'DamageImmunities': [],
	'ConditionImmunities': [],
	'Saves': [],
	'Skills': [],
	'Senses': [],
	'Languages': [],
	'Challenge': '',
	'Traits': [],
	'Actions': [],
	'Reactions': [],
	'LegendaryActions': []
}

size_convert = {
	'T': 'Tiny',
	'S': 'Small',
	'M': 'Medium',
	'L': 'Large',
	'H': 'Huge',
	'G': 'Gargantuan'
}


def parse_value_notes(data):
	arr = data.split(maxsplit=1)
	return {'Value': int(arr[0]), 'Notes': arr[1] if len(arr) == 2 else ''}


def parse_name_modifier(data):
	if not data:
		return []
	return [{'Name': y[0], 'Modifier': int(y[1])} for y in [x.rsplit(maxsplit=1) for x in data.split(', ')]]


def parse_array(data, complex = False):
	if not data:
		return []
	if complex and ';' in data:
		return data.split('; ')
	return data.split(', ')

SIZE = 0
TYPE = 1
ALIGNMENT = 2


def parse_monsters(file, out):
	m = None
	parent_tag = ''
	monster_type = ['', '', '']
	monster_passive_perception = 0
	monster_entity_name = ''
	monster_entity_text = []

	for event, elem in iterparse(file, ('start', 'end')):
		tag = elem.tag
		value = elem.text if elem.text is not None else ''

		if event == 'start':
			if tag == 'monster':
				parent_tag = tag
				m = make_monster()
			elif tag == 'trait' or tag == 'action' or tag == 'reaction' or tag == 'legendary':
				parent_tag = tag
				monster_entity_text = []
		else:
			if tag == 'monster':
				m['Type'] = monster_type[SIZE] + ' ' + monster_type[TYPE] + ', ' + monster_type[ALIGNMENT]
				m['Senses'].append('passive Perception {0}'.format(monster_passive_perception))
				out.append(m)
			elif tag == 'name':
				if parent_tag == 'monster':
					m['Name'] = value
				else:
					monster_entity_name = value
			elif tag == 'size':
				monster_type[SIZE] = size_convert[value]
			elif tag == 'type':
				monster_type[TYPE], m['Source'] = value.rsplit(', ', 1)
			elif tag == 'alignment':
				monster_type[ALIGNMENT] = value
			elif tag == 'ac':
				m['AC'] = parse_value_notes(value)
			elif tag == 'hp':
				m['HP'] = parse_value_notes(value)
			elif tag == 'speed':
				m['Speed'] = parse_array(value)
			elif tag == 'str':
				m['Abilities']['Str'] = int(value)
			elif tag == 'dex':
				m['Abilities']['Dex'] = int(value)
			elif tag == 'con':
				m['Abilities']['Con'] = int(value)
			elif tag == 'int':
				m['Abilities']['Int'] = int(value)
			elif tag == 'wis':
				m['Abilities']['Wis'] = int(value)
			elif tag == 'cha':
				m['Abilities']['Cha'] = int(value)
			elif tag == 'save':
				m['Saves'] = parse_name_modifier(value)
			elif tag == 'skill':
				m['Skills'] = parse_name_modifier(value)
			elif tag == 'resist':
				m['DamageResistances'] = parse_array(value, True)
			elif tag == 'vulnerable':
				m['DamageVulnerabilities'] = parse_array(value)
			elif tag == 'immune':
				m['DamageImmunities'] = parse_array(value, True)
			elif tag == 'conditionImmune':
				m['ConditionImmunities'] = parse_array(value)
			elif tag == 'senses':
				m['Senses'] = parse_array(value)
			elif tag == 'passive':
				monster_passive_perception = int(value)
			elif tag == 'languages':
				m['Languages'] = parse_array(value)
			elif tag == 'cr':
				m['Challenge'] = value
			elif tag == 'trait':
				parent_tag = 'monster'
				m['Traits'].append({'Name': monster_entity_name, 'Content': '<br />'.join(monster_entity_text), 'Usage': ''})
			elif tag == 'action':
				parent_tag = 'monster'
				m['Actions'].append({'Name': monster_entity_name, 'Content': '<br />'.join(monster_entity_text), 'Usage': ''})
			elif tag == 'reaction':
				parent_tag = 'monster'
				m['Reactions'].append({'Name': monster_entity_name, 'Content': '<br />'.join(monster_entity_text), 'Usage': ''})
			elif tag == 'legendary':
				parent_tag = 'monster'
				m['LegendaryActions'].append({'Name': monster_entity_name, 'Content': '<br />'.join(monster_entity_text), 'Usage': ''})
			elif tag == 'text':
				monster_entity_text.append(value)

			elem.clear()

monsters = []

for file in glob('/home/aton4/bbyholm/Documents/DnDAppFiles/Bestiary/*.xml'):
	if basename(file) != 'Player Bestiary.xml':
		parse_monsters(file, monsters)

with open('monsters.json', 'w') as f:
	dump(monsters, f, indent='\t')