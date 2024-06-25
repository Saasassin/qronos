import * as t from "io-ts";

export const User = t.type({
  id: t.number,
  username: t.string,
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
 * code_id will be used a an FK.
 */
export const Code = t.type({
    code_id: t.string,
    content: t.string,
    version: t.number,
    user: User,
    created_at: t.string,
    updated_at: t.string,
    });

export type Code = t.TypeOf<typeof Code>;

export const Script = t.type({
    id: t.number,
    name: t.string,
    description: t.string,
    code: Code, // most recent code. DB should just have a code_id that FKs to the Code table.
    type: t.string,
    created_at: t.string,
    updated_at: t.string,
    });

export type Script = t.TypeOf<typeof Script>;

export const Job = t.type({
    id: t.number,
    script: Script,
    status: t.string,
    created_at: t.string,
    updated_at: t.string,
    });

export type Job = t.TypeOf<typeof Job>;