import { BaseRssProvider } from '../base-rss';
import { SOURCE_CONFIGS } from '@/config/constants';

export class PhysOrgProvider extends BaseRssProvider {
    constructor() {
        super(SOURCE_CONFIGS.PHYS_ORG);
    }
}
