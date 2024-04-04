export interface WebshareResponse {
  count: number;
  next: string | null;
  previous: string | null;
  result: IWebshareProxy[] | [];
}
export interface IWebshareProxyPort {
  http: number;
  socks5: number;
}
export enum IWebshareCountryCode {
  "US",
  "NE",
  "IS",
  "UK",
}
export interface IWebshareProxy {
  username: string;
  password: string;
  proxy_address: string;
  ports: IWebshareProxyPort;
  valid: boolean;
  last_verification: Date;
  country_code: IWebshareCountryCode;
  country_code_confidence: number;
  city_name: string;
}
