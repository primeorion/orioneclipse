/* Defines the Admin Dahboard entity */
export interface IAdminDashboard {
    totalUsers: number,
    existingUsers: number,
    newUsers: number,
    totalRoles: number,
    existingRoles: number,
    newRoles: number,
    totalTeams: number,
    existingTeams: number,
    newTeams: number,
    totalCustodians: number,
    activeCustodians: number,
    declinedCustodians: number,
    PreferenceTotal: number,
    PreferenceEditedToday: number,
    PreferenceEditedInWeek: number,
    visits: number,
    todayVisits: number,
    monthlyVisits: number,
    percentageHigher: number
}
