/* Defines the login entity */
export interface ILogin {
    isAuthenticated: boolean,
    access_token: string,
    eclipse_access_token: string,
    orion_access_token: string,
    expires_in: number
}