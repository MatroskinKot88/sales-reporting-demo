'use strict';

const first = 'Первая отгрузка';
const expansion = 'Расширение ассортимента';
const plansByManager = [
  { manager: 'Анна Волкова', first: 3, expansion: 2 },
  { manager: 'Илья Орлов', first: 2, expansion: 2 },
];
const sample = [
  { manager: 'Анна Волкова', client: 'Компания Север', category: first, result: 'Поставили стартовую партию.' },
  { manager: 'Илья Орлов', client: 'Дом Линия', category: expansion, result: 'Добавили две позиции в заказ.' },
  { manager: 'Анна Волкова', client: 'Мастерская Вектор', category: 'Обычное действие', result: 'Передали коммерческое предложение.' },
];
let records = [...sample];
const form = document.querySelector('#activity');
const plans = document.querySelector('#plans');
const initialPlans = plans.value;
const feedback = document.querySelector('#feedback');

function counts(rows) {
  return {
    first: rows.filter(row => row.category === first).length,
    expansion: rows.filter(row => row.category === expansion).length,
  };
}

function element(tag, text) {
  const node = document.createElement(tag);
  node.textContent = text;
  return node;
}

function metric(fact, plan) {
  const cell = element('td', '');
  const percent = Math.round(fact / plan * 100);
  const bar = document.createElement('progress');
  bar.max = plan;
  bar.value = fact;
  bar.setAttribute('aria-label', 'Выполнение плана');
  cell.append(element('span', fact + ' из ' + plan + ' · ' + percent + '%'), bar);
  return cell;
}

function render() {
  const journal = document.querySelector('#journal');
  const kpi = document.querySelector('#kpi');
  const summary = document.querySelector('#summary');
  journal.replaceChildren();
  kpi.replaceChildren();
  for (const record of records.slice().reverse()) {
    const row = document.createElement('tr');
    const registry = [first, expansion].includes(record.category) ? 'Да' : '—';
    row.append(...[record.manager, record.client, record.category, record.result, registry].map(value => element('td', value)));
    journal.append(row);
  }
  const totals = plansByManager.reduce((sum, plan) => ({
    manager: sum.manager,
    first: sum.first + plan.first,
    expansion: sum.expansion + plan.expansion,
  }), { manager: 'Весь отдел', first: 0, expansion: 0 });
  for (const [index, plan] of [totals, ...plansByManager].entries()) {
    const actual = counts(index === 0 ? records : records.filter(record => record.manager === plan.manager));
    const row = document.createElement('tr');
    row.append(element('th', plan.manager), metric(actual.first, plan.first), metric(actual.expansion, plan.expansion));
    kpi.append(row);
  }
  const actual = counts(records);
  const highlights = document.createElement('ul');
  for (const record of records.filter(record => [first, expansion].includes(record.category)).slice(-4).reverse()) {
    highlights.append(element('li', record.client + ' · ' + record.manager + ' · ' + record.category + '. ' + record.result));
  }
  summary.replaceChildren(
    element('h3', 'Сводка за 2–6 ноября 2026'),
    element('p', 'Действий команды — ' + records.length + '. Первые отгрузки — ' + actual.first + ' из ' + totals.first + '. Расширения — ' + actual.expansion + ' из ' + totals.expansion + '.'),
    highlights,
    element('h3', 'Следующая неделя'),
    element('p', plans.value.trim() || 'Планы ещё не заполнены.'),
  );
}

form.addEventListener('submit', event => {
  event.preventDefault();
  const record = Object.fromEntries(new FormData(form));
  record.client = record.client.trim();
  record.result = record.result.trim();
  if (!record.client || !record.result) {
    feedback.textContent = 'Заполните клиента и результат.';
    return;
  }
  records.push(record);
  feedback.textContent = 'Запись добавлена в журнал.';
  render();
});
plans.addEventListener('input', render);
document.querySelector('#reset').addEventListener('click', () => {
  records = [...sample];
  form.reset();
  plans.value = initialPlans;
  feedback.textContent = 'Исходный пример восстановлен.';
  render();
});
document.querySelector('#print').addEventListener('click', () => window.print());
render();
