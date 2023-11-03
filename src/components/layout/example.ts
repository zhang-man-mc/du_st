
import { store } from './singleton';

export function updateVariable() {
  store.variable = 'World';
}

export function getVariable() {
  return store.variable;
}
