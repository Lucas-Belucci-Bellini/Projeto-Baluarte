export type GateType =
  | 'IN'
  | 'CLOCK'
  | 'OUT'
  | 'BUFFER'
  | 'NOT'
  | 'AND'
  | 'OR'
  | 'NAND'
  | 'NOR'
  | 'XOR'
  | 'XNOR'
  | 'AND3'
  | 'OR3'
  | 'NAND3'
  | 'NOR3'
  | 'XOR3'
  | 'XNOR3'
  | 'DFF'
  | 'TFF'
  | 'JKFF';

export type GateKind = 'source' | 'sink' | 'gate' | 'ff';

export interface GateDefinition {
  readonly ins: number;
  readonly outs: number;
  readonly label: string;
  readonly kind: GateKind;
  readonly inLabels?: readonly string[];
  readonly outLabels?: readonly string[];
}

export const GATES: Record<GateType, GateDefinition>;
export const PALETTE: readonly GateType[];

export interface LogicComponent {
  id: string;
  type: GateType;
  x: number;
  y: number;
  on: boolean;
  values?: boolean[];
  q?: boolean;
  prevClk?: boolean;
}

export interface LogicWire {
  id: string;
  from: string;
  fromPort: number;
  to: string;
  toPort: number;
}

export interface LogicCircuit {
  comps: LogicComponent[];
  wires: LogicWire[];
  seq: number;
}

export function createCircuit(): LogicCircuit;
export function addComponent(circuit: LogicCircuit, type: GateType, x: number, y: number): LogicComponent;
export function removeComponent(circuit: LogicCircuit, id: string): void;
export function addWire(
  circuit: LogicCircuit,
  fromId: string,
  fromPort: number,
  toId: string,
  toPort: number,
): LogicWire | null;
export function removeWire(circuit: LogicCircuit, id: string): void;
export function simulate(circuit: LogicCircuit): LogicCircuit;
export function inputValues(circuit: LogicCircuit, component: LogicComponent): boolean[];
export function serialize(circuit: LogicCircuit): string;
export function deserialize(value: unknown): LogicCircuit | null;
