#![no_std]

use multiversx_sc::imports::*;

/// Project Factory contract for template deployment
#[multiversx_sc::contract]
pub trait ProjectFactoryContract {
    #[init]
    fn init(&self, admin: ManagedAddress<Self::Api>) {
        self.admin().set(&admin);
    }

    /// Deploy a new project contract from template
    #[payable("EGLD")]
    #[endpoint(deployProject)]
    fn deploy_project(
        &self,
        template_type: ManagedBuffer,
        init_args: ManagedVec<ManagedBuffer>,
    ) -> ManagedAddress<Self::Api> {
        let payment = self.call_value().egld_value();
        let deployment_fee = self.deployment_fee().get();
        
        require!(payment >= deployment_fee, "Insufficient deployment fee");
        
        // In a real implementation, this would deploy the actual contract
        // For now, return a mock address
        let mock_address = self.blockchain().get_sc_address();
        
        self.project_deployed_event(&self.blockchain().get_caller(), &template_type);
        
        mock_address
    }

    /// Register a new project template
    #[only_owner]
    #[endpoint(registerTemplate)]
    fn register_template(
        &self,
        template_name: ManagedBuffer,
        template_code: ManagedBuffer,
        template_metadata: ManagedBuffer,
    ) {
        self.templates(&template_name).set(&ProjectTemplate {
            name: template_name.clone(),
            code: template_code,
            metadata: template_metadata,
            active: true,
        });
        
        self.template_registered_event(&template_name);
    }

    /// Set deployment fee
    #[only_owner]
    #[endpoint(setDeploymentFee)]
    fn set_deployment_fee(&self, fee: BigUint) {
        self.deployment_fee().set(&fee);
    }

    // View functions
    #[view(getTemplate)]
    fn get_template(&self, name: &ManagedBuffer) -> ProjectTemplate<Self::Api> {
        self.templates(name).get()
    }

    #[view(getDeploymentFee)]
    fn get_deployment_fee(&self) -> BigUint {
        self.deployment_fee().get()
    }

    // Events
    #[event("projectDeployed")]
    fn project_deployed_event(
        &self,
        #[indexed] deployer: &ManagedAddress<Self::Api>,
        template_type: &ManagedBuffer,
    );

    #[event("templateRegistered")]
    fn template_registered_event(&self, #[indexed] template_name: &ManagedBuffer);

    // Storage
    #[storage_mapper("admin")]
    fn admin(&self) -> SingleValueMapper<ManagedAddress<Self::Api>>;

    #[storage_mapper("templates")]
    fn templates(&self, name: &ManagedBuffer) -> SingleValueMapper<ProjectTemplate<Self::Api>>;

    #[storage_mapper("deploymentFee")]
    fn deployment_fee(&self) -> SingleValueMapper<BigUint>;
}

#[derive(TypeAbi, TopEncode, TopDecode, Clone, Debug, PartialEq, Eq)]
pub struct ProjectTemplate<M: ManagedTypeApi> {
    pub name: ManagedBuffer<M>,
    pub code: ManagedBuffer<M>,
    pub metadata: ManagedBuffer<M>,
    pub active: bool,
}