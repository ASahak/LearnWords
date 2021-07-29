enum Globals {
  lang = 'en',
  MaxListCount = 20,
  HeaderHeight = 60,
  ListItemHeight = 30,
  FiltersHeight = 115,
}

enum FilterBy {
  '*' = 'All words',
  'increase-date' = 'Increase Date',
  'decrease-date' = 'Decrease Date',
  'a-z' = 'A-Z',
  'z-a' = 'Z-A',
  'learned' = 'Learned',
  'not-learned' = 'Not Learned',
  'group-by' = 'Group by...',
}

enum Languages {
  'en' = 'English',
  'uk' = 'Ukrainian',
  'fr' = 'France',
  'de' = 'German',
  'ru' = 'Russian',
  'es' = 'Spanish',
  'cn' = 'Chinese',
  'it' = 'Italian',
}

export { FilterBy, Globals, Languages };
