import { createContext, useContext } from 'react';
import { createFormat, type Format } from './format';
import type { Lang } from './state/prefs';

type Plural = Partial<Record<Intl.LDMLPluralRule, string>> & { other: string };

const counter = (locale: string, forms: Plural) => {
  const rules = new Intl.PluralRules(locale);
  return (n: number) => `${n} ${forms[rules.select(Math.abs(n))] ?? forms.other}`;
};

const en = (days: (n: number) => string) => ({
  title: 'Schengen Calendar',
  today: 'today',
  inSchengen: 'in Schengen',
  overstay: 'overstay',
  usedInWindow: (used: number, max: number) => `${used} of ${max} days used in the window`,
  entryAllows: (n: number) => `entering here allows ${days(n)}`,
  noDaysLeft: 'no days left',
  calendar: 'Calendar',
  keysHint: 'Arrows move, Space marks, Shift+arrows mark a range, PageUp/PageDown change month.',
  summary: 'Summary',
  usedOf: (max: number, window: number) => `of ${max} days used in the last ${window}`,
  leftToday: (n: number) => `${days(n)} left today`,
  canStay: (n: number, until: string) => `Can stay up to ${days(n)}, until ${until}`,
  enterToday: (n: number, until: string) => `Enter today: stay up to ${days(n)}, until ${until}`,
  earliestEntry: (date: string, n: number) => `Earliest entry ${date}, for up to ${days(n)}`,
  planned: (n: number) => `${days(n)} planned`,
  overstayOn: (n: number, first: string) => `Overstay on ${days(n)}, first ${first}`,
  undo: 'Undo',
  redo: 'Redo',
  dragHint:
    'Drag across days to mark or clear a trip. On touch: tap a day, swipe sideways along a week, or long-press and drag. Shift+click extends.',
  tools: 'Import / export',
  tripsInput: 'Trips, one per line',
  add: 'Add',
  clearAll: 'Clear all',
  confirmClear: 'Remove all marked days?',
  exportJson: 'Export JSON',
  exportIcs: 'Export .ics',
  importJson: 'Import JSON',
  shareLink: 'Share link',
  cantReadLines: (lines: string) => `Can't read line ${lines} (use YYYY-MM-DD YYYY-MM-DD)`,
  added: (n: number) => `Added ${days(n)}`,
  exported: (n: number) => `Exported ${days(n)}`,
  exportedCalendar: 'Exported calendar',
  notExport: (name: string) => `Can't read ${name}: not a Schengen export`,
  addedFrom: (n: number, name: string) => `Added ${days(n)} from ${name}`,
  linkCopied: 'Link copied',
  copyBelow: 'Copy the link below',
  confirmShared: (n: number) => `Add ${days(n)} from the shared link?`,
  plan: 'Plan a trip',
  enterOn: 'Enter on',
  pickRange: (a: string, b: string) => `Pick a date from ${a} to ${b}`,
  stayUpTo: (n: number, leave: string) => `Stay up to ${days(n)}, leave by ${leave}`,
  noDaysOnDate: 'No days left on that date',
  earliestFor: 'Earliest entry for',
  daysUnit: 'days',
  tripLength: 'Trip length in days',
  enterRange: (max: number) => `Enter 1 to ${max} days`,
  notPossibleBefore: (d: string) => `Not possible before ${d}`,
  firstLeave: (a: string, b: string) => `${a}, leave by ${b}`,
  trips: (n: number) => `Trips (${n})`,
  entry: 'Entry',
  exit: 'Exit',
  save: 'Save',
  cancel: 'Cancel',
  edit: 'Edit',
  delete: 'Delete',
  editTrip: (d: string) => `Edit trip from ${d}`,
  deleteTrip: (d: string) => `Delete trip from ${d}`,
  prefs: 'Settings',
  language: 'Language',
  theme: 'Theme',
  themeAuto: 'Auto',
  themeLight: 'Light',
  themeDark: 'Dark',
  weekStart: 'Week starts on',
  monday: 'Mon',
  sunday: 'Sun',
});

export type Messages = ReturnType<typeof en>;

const uk = (days: (n: number) => string): Messages => ({
  title: 'Шенгенський календар',
  today: 'сьогодні',
  inSchengen: 'у Шенгені',
  overstay: 'перевищення',
  usedInWindow: (used, max) => `використано ${used} з ${max} днів у вікні`,
  entryAllows: (n) => `в'їзд цього дня дає ${days(n)}`,
  noDaysLeft: 'днів не залишилось',
  calendar: 'Календар',
  keysHint:
    'Стрілки переміщують, Пробіл позначає, Shift+стрілки позначають діапазон, PageUp/PageDown змінюють місяць.',
  summary: 'Підсумок',
  usedOf: (max, window) => `з ${max} днів використано за останні ${window}`,
  leftToday: (n) => `Сьогодні залишилось: ${days(n)}`,
  canStay: (n, until) => `Можна перебувати ${days(n)}, до ${until}`,
  enterToday: (n, until) => `В'їзд сьогодні: можна ${days(n)}, до ${until}`,
  earliestEntry: (date, n) => `Найближчий в'їзд ${date}, на ${days(n)}`,
  planned: (n) => `Заплановано: ${days(n)}`,
  overstayOn: (n, first) => `Перевищення: ${days(n)}, перший день ${first}`,
  undo: 'Скасувати',
  redo: 'Повторити',
  dragHint:
    'Проведіть по днях, щоб позначити або зняти поїздку. На сенсорному екрані: торкніться дня, проведіть уздовж тижня вбік або довго натисніть і тягніть. Shift+клік розширює.',
  tools: 'Імпорт / експорт',
  tripsInput: 'Поїздки, по одній на рядок',
  add: 'Додати',
  clearAll: 'Очистити все',
  confirmClear: 'Видалити всі позначені дні?',
  exportJson: 'Експорт JSON',
  exportIcs: 'Експорт .ics',
  importJson: 'Імпорт JSON',
  shareLink: 'Поділитися посиланням',
  cantReadLines: (lines) => `Не вдається прочитати рядок ${lines} (формат РРРР-ММ-ДД РРРР-ММ-ДД)`,
  added: (n) => `Додано ${days(n)}`,
  exported: (n) => `Експортовано ${days(n)}`,
  exportedCalendar: 'Календар експортовано',
  notExport: (name) => `Не вдається прочитати ${name}: це не експорт календаря`,
  addedFrom: (n, name) => `Додано ${days(n)} з ${name}`,
  linkCopied: 'Посилання скопійовано',
  copyBelow: 'Скопіюйте посилання нижче',
  confirmShared: (n) => `Додати ${days(n)} з посилання?`,
  plan: 'Спланувати поїздку',
  enterOn: "В'їзд",
  pickRange: (a, b) => `Оберіть дату з ${a} по ${b}`,
  stayUpTo: (n, leave) => `Можна перебувати ${days(n)}, виїзд до ${leave}`,
  noDaysOnDate: 'На цю дату днів не залишилось',
  earliestFor: "Найближчий в'їзд на",
  daysUnit: 'днів',
  tripLength: 'Тривалість поїздки в днях',
  enterRange: (max) => `Введіть від 1 до ${max} днів`,
  notPossibleBefore: (d) => `Неможливо до ${d}`,
  firstLeave: (a, b) => `${a}, виїзд до ${b}`,
  trips: (n) => `Поїздки (${n})`,
  entry: "В'їзд",
  exit: 'Виїзд',
  save: 'Зберегти',
  cancel: 'Скасувати',
  edit: 'Змінити',
  delete: 'Видалити',
  editTrip: (d) => `Змінити поїздку з ${d}`,
  deleteTrip: (d) => `Видалити поїздку з ${d}`,
  prefs: 'Налаштування',
  language: 'Мова',
  theme: 'Тема',
  themeAuto: 'Авто',
  themeLight: 'Світла',
  themeDark: 'Темна',
  weekStart: 'Тиждень починається з',
  monday: 'Пн',
  sunday: 'Нд',
});

export const LOCALES: Record<Lang, string> = { uk: 'uk-UA', en: 'en-GB' };

export type I18n = { lang: Lang; t: Messages; fmt: Format; days: (n: number) => string };

const build = (lang: Lang): I18n => {
  const locale = LOCALES[lang];
  const days =
    lang === 'uk'
      ? counter(locale, { one: 'день', few: 'дні', many: 'днів', other: 'дня' })
      : counter(locale, { one: 'day', other: 'days' });
  return { lang, t: (lang === 'uk' ? uk : en)(days), fmt: createFormat(locale), days };
};

export const I18N: Record<Lang, I18n> = { uk: build('uk'), en: build('en') };

export const I18nContext = createContext<I18n>(I18N.en);

export const useI18n = () => useContext(I18nContext);
