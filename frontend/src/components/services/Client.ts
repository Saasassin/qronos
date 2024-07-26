import { ScriptWithVersion } from "../../types/qronos";

const BASE_URI = import.meta.env.QRONOS_API_URL || "http://?????????????"; // TODO: Fill in the correct URL for default

export const saveOrUpdateScript = async (
  script_with_version: ScriptWithVersion
) => {
  const post_body = {
    script: {
      id: script_with_version.script.id,
      script_name: script_with_version.script.script_name,
      script_type: script_with_version.script.script_type,
    },
    script_version: {
      code_body: script_with_version.script_version.code_body,
    },
  };

  let target_uri = `${BASE_URI}/scripts`;
  if (script_with_version.script.id) {
    target_uri = `${BASE_URI}/scripts/${script_with_version.script.id}`;
  }

  const response = await fetch(target_uri, {
    method: script_with_version.script.id ? "PUT" : "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(post_body),
  });

  return response;
};

export const fetchScripts = async (
  limit: number = 25,
  skip: number = 0,
  sortby: string,
  sortDirection: string = "DESC"
) => {
  const response = await fetch(
    `${BASE_URI}/scripts?limit=${limit}&skip=${skip}&sort=${sortby}&order=${sortDirection}`
  );
  const data = await response.json();
  return data;
};

export const fetchScript = async (id: string) => {
  const response = await fetch(`${BASE_URI}/scripts/${id}`);
  const data = await response.json();
  return data;
};

export const deleteScript = async (id: string) => {
  const response = await fetch(`${BASE_URI}/scripts/${id}`, {
    method: "DELETE",
  });
  return response;
};
