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
 userDetails: IUser[],
 modelDetails: any[],
 advertisementMessage: string,
 isDeleted: number,
 createdOn: Date,
 createdBy: string,
 editedOn: Date,
 editedBy: string
}