import { BaseRssProvider } from '../base-rss';
import { SOURCE_CONFIGS } from '@/config/constants';

export class TheRegisterProvider extends BaseRssProvider {
    constructor() {
        super(SOURCE_CONFIGS.THE_REGISTER);
    }
}
