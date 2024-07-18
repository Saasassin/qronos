import * as t from "io-ts";

export const User = t.type({
  id: t.number,
  username: t.string,
  oassword: t.string,
  email: t.string,
  created_at: t.string,
  updated_at: t.string,
});

export type User = t.TypeOf<typeof User>;

export const SystemSettings = t.type({
  id: t.number,
  name: t.string,
  value: t.string,
  created_at: t.string,
  updated_at: t.string,
});

export type SystemSettings = t.TypeOf<typeof SystemSettings>;

export const SystemStatus = t.type({
  id: t.number,
  name: t.string,
  value: t.string,
  created_at: t.string,
  updated_at: t.string,
});

export type SystemStatus = t.TypeOf<typeof SystemStatus>;

/**
 * This is the literal code content and version information.
 * id will be used a an FK to the Script table.
 */
export const ScriptVersion = t.type({
  id: t.union([t.string, t.undefined]),
  code_body: t.union([t.string, t.undefined]),
  created_at: t.union([t.string, t.undefined]),
});

export type ScriptVersion = t.TypeOf<typeof ScriptVersion>;
export type ScriptVersions = ScriptVersion[];

export const Script = t.type({
  id: t.union([t.string, t.undefined]),
  script_name: t.string,
  //script_version: ScriptVersion, // most recent code. DB should just have a code_id that FKs to the Code table.
  script_type: t.string,
  created_at: t.union([t.string, t.undefined]),
  updated_at: t.union([t.string, t.undefined]),
});
export type Script = t.TypeOf<typeof Script>;

export const Scripts = t.array(Script);
export type Scripts = t.TypeOf<typeof Scripts>;

export const ScriptWithVersion = t.type({
  script: Script,
  script_version: ScriptVersion,
});

export type ScriptWithVersion = t.TypeOf<typeof ScriptWithVersion>;

export const Job = t.type({
  id: t.number,
  script: Script,
  status: t.string,
  created_at: t.string,
  updated_at: t.string,
});

export type Job = t.TypeOf<typeof Job>;
