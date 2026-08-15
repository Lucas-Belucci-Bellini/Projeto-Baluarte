export type LogicBinaryOperator =
  | 'and'
  | 'or'
  | 'xor'
  | 'implies'
  | 'iff'
  | 'nand'
  | 'nor'
  | 'xnor';

export interface LogicConstNode {
  type: 'const';
  value: boolean;
}

export interface LogicVariableNode {
  type: 'var';
  name: string;
}

export interface LogicNotNode {
  type: 'not';
  child: LogicNode;
}

export interface LogicBinaryNode {
  type: LogicBinaryOperator;
  left: LogicNode;
  right: LogicNode;
}

export type LogicNode = LogicConstNode | LogicVariableNode | LogicNotNode | LogicBinaryNode;

export interface LogicEnvironment {
  [variable: string]: boolean;
}

export interface CompiledLogic {
  ast: LogicNode | null;
  vars: string[];
  evaluate: (environment: LogicEnvironment) => boolean;
  error?: string;
  empty?: boolean;
}

export interface TruthTableRow {
  env: LogicEnvironment;
  result: boolean;
}

export function compile(expression: string): CompiledLogic;
export function buildTruthTable(compiled: CompiledLogic, variables: readonly string[]): TruthTableRow[];
export function astToString(node: LogicNode | null): string;
export function toSOP(rows: readonly TruthTableRow[], variables: readonly string[]): string;
export function toPOS(rows: readonly TruthTableRow[], variables: readonly string[]): string;
export function simplifySOP(rows: readonly TruthTableRow[], variables: readonly string[]): string;
export function grayCodeOrder(bits: number): number[];
