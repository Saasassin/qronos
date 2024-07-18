import { Script } from "../../types/qronos";

const BASE_URI = import.meta.env.QRONOS_API_URL || "http://?????????????"; // TODO: Fill in the correct URL for default

export const saveOrUpdateScript = async (script: Script) => {
  const post_body = {
    script: {
      id: script.id,
      script_name: script.script_name,
      script_type: script.script_type,
    },
    script_version: {
      code_body: script.script_version.code_body,
    },
  };

  let target_uri = `${BASE_URI}/scripts`;
  if (script.id) {
    target_uri = `${BASE_URI}/scripts/${script.id}`;
  }

  const response = await fetch(target_uri, {
    method: script.id ? "PUT" : "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(post_body),
  });

  return response;
};

export const fetchScripts = async (limit: number = 25, skip: number = 0) => {
  const response = await fetch(
    `${BASE_URI}/scripts?limit=${limit}&skip=${skip}`
  );
  const data = await response.json();
  return data;
};

export const fetchScript = async (id: string) => {
  const response = await fetch(`${BASE_URI}/scripts/${id}`);
  const data = await response.json();
  return data;
};
