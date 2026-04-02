import { validatorService } from '../lib/validator-service';
import { ASIMOV_NETWORK } from '../lib/networks';

async function verify() {
    console.log('--- Verification of Validator Discovery ---');
    try {
        const stats = await validatorService.getNetworkStats(ASIMOV_NETWORK);
        console.log(`Discovered Count: ${stats.validators.length}`);
        console.log(`Active Count: ${stats.epochInfo.activeValidators}`);

        console.log('\nTop 5 Validators:');
        stats.validators.slice(0, 5).forEach(v => {
            console.log(`- ${v.address}: Active=${v.isActive}, Stake=${v.stake}`);
        });

        const missingSuspects = [
            "0x33609373e3394ab1d96c07013057215c8629b9d7",
            "0x31c6e0559fa7bad96ebf428bc5a8683726dfde69",
            "0xd9e0663a7eec7eeeda310c69f946838f9031571d"
        ];

        console.log('\nChecking Suspect Addresses:');
        missingSuspects.forEach(addr => {
            const found = stats.validators.find(v => v.address.toLowerCase() === addr.toLowerCase());
            if (found) {
                console.log(`- ${addr}: FOUND (Active=${found.isActive})`);
            } else {
                console.log(`- ${addr}: NOT FOUND`);
            }
        });

    } catch (e: any) {
        console.error('Verification failed:', e.message);
    }
}

verify().catch(console.error);
