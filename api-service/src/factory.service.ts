import {
    Address,
    ContractWrapper,
    SystemWrapper,
} from '@dharitrinetwork/moajs/out';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { FactoryGetBody } from 'model/factoryGetBody';
import { GasPayerDto } from 'model/gasPayerDto';
import { AddressDto } from 'model/addressDto';
import { JobListResponse } from 'model/jobListResponse';
import { StringDataResponse } from 'model/stringDataResponse';
import { loadContracts, makeWallet, prepareContract } from './common';
import { ApiConfigService } from './apiConfigService';

@Injectable()
export class FactoryService implements OnModuleInit {
    moaSys: SystemWrapper;
    factoryContract: ContractWrapper;

    constructor(private config: ApiConfigService) {}

    async onModuleInit() {
        const { moaSys, factoryContract } = await loadContracts(this.config);
        this.moaSys = moaSys;
        this.factoryContract = factoryContract;
    }

    private async prepareFactory(addressDto: AddressDto): Promise<void> {
        await prepareContract(addressDto, this.moaSys, this.factoryContract);
    }

    async getFactory(factoryGetBody: FactoryGetBody): Promise<JobListResponse> {
        await this.prepareFactory(factoryGetBody);
        const jobs: Address[] = await this.factoryContract
            .gas(this.config.gasFactoryJobs)
            .call.jobs();
        return { jobs: jobs.map((address: Address) => address.bech32()) };
    }

    async newFactory(gasPayerDto: GasPayerDto): Promise<StringDataResponse> {
        const wallet = await makeWallet(gasPayerDto, this.moaSys);
        await this.factoryContract
            .sender(wallet)
            .gas(this.config.gasFactoryDeploy)
            .call.deploy(
                this.config.humanTokenIdentifier,
                this.config.jobTemplateAddress,
            );
        return { data: this.factoryContract.getAddress().bech32() };
    }
}
