export interface ILoginRequest {
	email: string;
	password: string;
}

export interface ILoginResponse {
}

export interface IRegisterRequest {
	email: string;
	password: string;
	name: string;
	phone: string;
	avatar?: string;
	birthday?: string;
	gender: string;
}

export interface IRegisterForm extends IRegisterRequest {
	confirmPassword: string;
};

export interface IRegisterResponse {
}

export interface IRefreshTokenRequest {
}

export interface IRefreshTokenResponse {
}

export interface ILogoutRequest {
}

export interface ILogoutResponse {
}
