const KEY = "nutricionconfortu:selectedProfileId";

export function getSelectedProfileId(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setSelectedProfileId(id: string): void {
  try {
    localStorage.setItem(KEY, id);
  } catch {
    // localStorage no disponible (modo privado, etc.): no persiste entre visitas, pero no rompe la app.
  }
}
