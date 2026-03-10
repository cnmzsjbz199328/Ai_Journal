import { BaseRssProvider } from '../base-rss';
import { SOURCE_CONFIGS } from '@/config/constants';

export class QuantaProvider extends BaseRssProvider {
    constructor() {
        super(SOURCE_CONFIGS.QUANTA);
    }
}
