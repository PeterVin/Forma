export type JsonPrimitive = string | number | boolean | null;

export type JsonValue = JsonPrimitive | JsonObject | readonly JsonValue[];

export interface JsonObject {
  readonly [key: string]: JsonValue;
}

export interface EditorNode {
  readonly id: string;
  readonly type: string;
  readonly parentId?: string;
  readonly children: readonly string[];
  readonly props: JsonObject;
  readonly style: {
    readonly sx?: JsonObject;
  };
}

export interface PageDocument {
  readonly version: number;
  readonly id: string;
  readonly name: string;
  readonly rootNodeId: string;
  readonly nodes: Readonly<Record<string, EditorNode>>;
}
