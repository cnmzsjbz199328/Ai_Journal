/**
 * Nature RSS Provider — zero-override pattern.
 */

import { BaseRssProvider } from '../base-rss';
import { SOURCE_CONFIGS } from '@/config/constants';

export class NatureProvider extends BaseRssProvider {
    constructor() {
        super(SOURCE_CONFIGS.NATURE);
    }
}
