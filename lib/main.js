'use babel';

import Provider from './provider';

export default {
    getProvider() {
        // return a single provider, or an array of providers to use together
        return [Provider];
    }
};
