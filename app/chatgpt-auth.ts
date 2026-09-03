export type ChatGPTUser = {
  displayName: string;
  email: string;
  fullName: string | null;
};

export async function getChatGPTUser(): Promise<ChatGPTUser | null> {
  return { displayName: "Luan Motos", email: "", fullName: "Luan Motos" };
}

export async function requireChatGPTUser(
  returnTo: string,
): Promise<ChatGPTUser> {
  void returnTo;
  return (await getChatGPTUser())!;
}

export function chatGPTSignInPath(returnTo: string): string {
  return safeRelativeReturnPath(returnTo);
}

export function chatGPTSignOutPath(returnTo = "/"): string {
  const safeReturnTo = safeRelativeReturnPath(returnTo);
  return safeReturnTo;
}

function safeRelativeReturnPath(value: string): string {
  if (!value.startsWith("/") || value.startsWith("//")) return "/";

  let url: URL;
  try {
    url = new URL(value, "https://app.local");
  } catch {
    return "/";
  }
  if (url.origin !== "https://app.local") return "/";
  return `${url.pathname}${url.search}${url.hash}`;
}
