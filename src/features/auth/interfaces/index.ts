export interface ILoginRequest {
	email: string;
	password: string;
}

export interface IUserInfo {
	id: string;
	email: string;
	name: string;
	role: string;
}

export interface ILoginResponse {
	access_token: string;
	refresh_token: string;
	user: IUserInfo;
}

export interface IRegisterRequest {
	email: string;
	password: string;
	name: string;
}

export interface IRegisterForm extends IRegisterRequest {
	confirmPassword: string;
}

export interface IRegisterResponse {
	access_token: string;
	refresh_token: string;
	user: IUserInfo;
}

export interface IRefreshTokenRequest {
	refresh_token: string;
}

export interface IRefreshTokenResponse {
	access_token: string;
}

export interface ILogoutRequest { }

export interface ILogoutResponse { }
