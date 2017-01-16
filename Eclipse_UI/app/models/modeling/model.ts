/**
 * This {Model} with the entities of actual model structure
 */

/** Detail structure of Model */

/**
 * 
 *          "id": 2,
		    "name": "Test Model 13",
		    "portfolioCount": 5,
		    "source": "Team",
		    "statusId": 1,
		    "status": "APPROVED",
		    "description": null,
		    "ownerUserId": 66,
		    "userLoginId": "prime@tgi.com",
		    "managementStyleId": 1,
		    "managementStyle": "Conservative",
		    "isCommunityModel": null,
		    "approvedByUserId": null,
		    "portfolioId": 11211238,
		    "portfolioName": "Demo Portfolio",
		    "isDeleted": 0,
		    "createdOn": "2016-09-05T07:30:37.000Z",
		    "createdBy": "prime@tgi.com",
		    "editedOn": "2016-09-05T07:30:37.000Z",
		    "editedBy": "prime@tgi.com"
 */
export interface IModel {
    id: number,
    name: string,
    communityModel: any,
    isCommunityModel: boolean,
    statusId: number,
    status: string,
    description: string,
    ownerUserId: number,
    scope: string,
    isDynamic: boolean,
    managementStyleId: number,
    managementStyle: any,
    isDeleted: boolean,
    createdDate: Date,
    createdBy: number,
    editedDate: Date,
    editedBy: number,
    //modelDetail: IModelDetails[]
}