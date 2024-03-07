import fetch from 'node-fetch';
import {
    Address,
    ContractWrapper,
    setupInteractive,
    SystemWrapper,
} from '@dharitrinetwork/moajs/out';
import { TestWallet } from '@dharitrinetwork/moajs/out/testutils';
import { GasPayerDto } from 'model/gasPayerDto';
import { AddressDto } from 'model/addressDto';
import { ApiConfigService } from './apiConfigService';
import { StorageService } from './storage.service';

export async function makeWallet(
    gasPayerDto: GasPayerDto,
    moaSys: SystemWrapper,
): Promise<TestWallet> {
    const wallet = new TestWallet(
        new Address(gasPayerDto.gasPayer),
        gasPayerDto.gasPayerPrivate,
        null,
        null,
    );
    await wallet.sync(moaSys.getProvider());
    return wallet;
}

export async function prepareContract(
    addressDto: AddressDto,
    moaSys: SystemWrapper,
    contract: ContractWrapper,
): Promise<void> {
    const wallet = await makeWallet(addressDto, moaSys);
    contract.address(addressDto.address).sender(wallet);
}

export async function loadContracts(config: ApiConfigService) {
    const { moaSys } = await setupInteractive(config.networkProvider);
    const jobContract = await moaSys.loadWrapper('../job');
    const factoryContract = await moaSys.loadWrapper('../job-factory');
    const humanToken = await moaSys.recallToken(config.humanTokenIdentifier);
    return { moaSys, jobContract, factoryContract, humanToken };
}

export async function getJsonFromUrl(url: string): Promise<any> {
    return await fetch(url).then((res) => res.json());
}

export async function uploadFromUrl(
    sourceUrl: string,
    pubKey: string,
    storage: StorageService,
): Promise<{ hash: string; url: string; json: any }> {
    const json = await getJsonFromUrl(sourceUrl);
    const jsonString = JSON.stringify(json);
    const { hash, key: url } = await storage.upload(jsonString, pubKey);
    return { hash, url, json };
}
