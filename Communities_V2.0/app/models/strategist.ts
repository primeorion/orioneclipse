import { IUser } from '../models/user';
import { IStrategistStatus } from '../models/strategist.status';

export interface IStrategist{
 id: number,
 name: string,
 status: number,
 statusLabel: string,
 salesContact: string,
 salesPhone: string,
 legalAgreement: string,
 salesEmail: string,
 supportEmail: string,
 supportContact: string,
 supportPhone: string,
 strategyCommentary: string,
 users: IUser[],
 modelDetails: any[],
 advertisementMessage: string,
 isDeleted: number,
 createdOn: Date,
 createdBy: string,
 editedOn: Date,
 editedBy: string,
 smallLogo: string,
 largeLogo: string,
 isSubscribed : number,
 subscribedOn : string,
 eclipseDatabaseId: number;
 eclipseDatabaseName:string;
}

export interface IStrategistCommentary{
    id: number,
    strategyCommentary: string
}

export interface IStrategistSalesDetail{
 id: number,
 salesContact: string,
 salesPhone: string,
 salesEmail: string
}

export interface IStrategistSupportDetail{
 id: number,
 supportContact: string,
 supportPhone: string,
 supportEmail: string
}

export interface IStrategistAdvertisement{
 id: number,
 advertisementMessage: string
}

export interface IStrategistAgreement{
 id: number,
 legalAgreement: string
}

export interface IStrategistDownload{
 id: number,
 type: number,
 displayName: string,
 documentName: string,
 path: string,
 description: string
}