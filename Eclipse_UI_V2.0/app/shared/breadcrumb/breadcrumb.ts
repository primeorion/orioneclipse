import { Component, Input,Inject} from '@angular/core';
import { SessionHelper } from '../../core/session.helper';

@Component({
    selector: 'breadcrumb',
    templateUrl: './app/shared/breadcrumb/breadcrumb.html',
    // properties: ['pageName', 'isDashboard', 'firmId', 'firmName']
})
export class BreadcrumbComponent {
    @Input() pageName: string = 'Dashboard';
    isDashboard: boolean = false;
    firmId: number = 0;
    firmName: string = 'FIRM NAME';
    private communityPortalNavigation : string;

    constructor( @Inject('CommunityUrl') private _communityUrl: string) {
        let sessionHelper = new SessionHelper();
        let user = sessionHelper.getUser();
        this.firmId = user.firmId;
        this.firmName = user.firmName;
        let eclipseToken = sessionHelper.getAccessToken("accessTokenInfo");
        this.communityPortalNavigation = _communityUrl + "#/authorize/"+ eclipseToken.orion_access_token + "/subscription";
    }
}
