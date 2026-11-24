export type Option<V = string, M = Record<string, string>> = {
  value: V;
  label: string;
  meta?: M;
};
