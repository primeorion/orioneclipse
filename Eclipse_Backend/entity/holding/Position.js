module.exports = {
	tableName: 'position',
	columns: {
		id: 'position.id',
        accountId: 'position.accountId',
		securityId: 'position.securityId',
		orionFirmId: 'position.orionFirmId',
		externalId: 'position.externalId',
		price: 'position.price',
		priceDate: 'position.priceDate',
		marketValue: 'position.marketValue',
		quantity: 'position.quantity',
		positionYtdRealizedStgl: 'position.positionYtdRealizedStgl',
		positionYtdRealizedLtgl: 'position.positionYtdRealizedLtgl',
		createdDate: 'position.createdDate',
		createdBy: 'position.createdBy',
		editedDate: 'position.editedDate',
		editedBy: 'position.editedBy',
		isDeleted: 'position.isDeleted'

	},
	positionAcc: {
		alias: 'positionAcc',
		accountId: 'positionAcc.accountId'

	},
	positionSec: {
		alias: 'positionSec',
		securityId: 'positionSec.securityId',
		isDeleted: 'positionSec.isDeleted',
		id: 'positionSec.id'

	},
}