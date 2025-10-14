#![no_std]

use multiversx_sc::imports::*;

/// Main AutoBuilder smart contract
/// Manages project creation, AI automation, and blockchain integration
#[multiversx_sc::contract]
pub trait AutoBuilderContract {
    #[init]
    fn init(&self, admin: ManagedAddress<Self::Api>) {
        self.admin().set(&admin);
        self.project_counter().set(1u64);
    }

    /// Create a new project with AI assistance
    #[endpoint(createProject)]
    fn create_project(
        &self,
        name: ManagedBuffer,
        description: ManagedBuffer,
        project_type: ManagedBuffer,
        config: ManagedBuffer, // JSON config
    ) -> u64 {
        let caller = self.blockchain().get_caller();
        let project_id = self.project_counter().get();
        
        // Store project data
        self.projects(project_id).set(&Project {
            id: project_id,
            owner: caller.clone(),
            name: name.clone(),
            description,
            project_type,
            config,
            status: ManagedBuffer::from(b"DRAFT"),
            created_at: self.blockchain().get_block_timestamp(),
            updated_at: self.blockchain().get_block_timestamp(),
        });
        
        // Add to user's projects
        self.user_projects(&caller).insert(project_id);
        
        // Increment counter
        self.project_counter().set(project_id + 1);
        
        // Emit event
        self.project_created_event(&caller, project_id, &name);
        
        project_id
    }

    /// Update project status
    #[endpoint(updateProjectStatus)]
    fn update_project_status(&self, project_id: u64, new_status: ManagedBuffer) {
        let caller = self.blockchain().get_caller();
        let mut project = self.projects(project_id).get();
        
        require!(project.owner == caller, "Only project owner can update status");
        
        project.status = new_status.clone();
        project.updated_at = self.blockchain().get_block_timestamp();
        
        self.projects(project_id).set(&project);
        
        self.project_status_updated_event(project_id, &new_status);
    }

    /// Request AI code generation (placeholder)
    #[endpoint(requestAiGeneration)]
    fn request_ai_generation(
        &self,
        project_id: u64,
        prompt: ManagedBuffer,
        generation_type: ManagedBuffer,
    ) {
        let caller = self.blockchain().get_caller();
        let project = self.projects(project_id).get();
        
        require!(project.owner == caller, "Only project owner can request AI generation");
        
        // In a real implementation, this would trigger an oracle request
        // For now, emit an event for off-chain processing
        self.ai_generation_requested_event(project_id, &prompt, &generation_type);
    }

    /// Admin function to set AI oracle address
    #[only_owner]
    #[endpoint(setAiOracle)]
    fn set_ai_oracle(&self, oracle_address: ManagedAddress<Self::Api>) {
        self.ai_oracle_address().set(&oracle_address);
    }

    // View functions
    #[view(getProject)]
    fn get_project(&self, project_id: u64) -> Project<Self::Api> {
        self.projects(project_id).get()
    }

    #[view(getUserProjects)]
    fn get_user_projects(&self, user: &ManagedAddress<Self::Api>) -> ManagedVec<u64> {
        self.user_projects(user).iter().collect()
    }

    #[view(getProjectCounter)]
    fn get_project_counter(&self) -> u64 {
        self.project_counter().get()
    }

    // Events
    #[event("projectCreated")]
    fn project_created_event(
        &self,
        #[indexed] owner: &ManagedAddress<Self::Api>,
        #[indexed] project_id: u64,
        name: &ManagedBuffer,
    );

    #[event("projectStatusUpdated")]
    fn project_status_updated_event(
        &self,
        #[indexed] project_id: u64,
        status: &ManagedBuffer,
    );

    #[event("aiGenerationRequested")]
    fn ai_generation_requested_event(
        &self,
        #[indexed] project_id: u64,
        prompt: &ManagedBuffer,
        generation_type: &ManagedBuffer,
    );

    // Storage
    #[storage_mapper("admin")]
    fn admin(&self) -> SingleValueMapper<ManagedAddress<Self::Api>>;

    #[storage_mapper("projects")]
    fn projects(&self, project_id: u64) -> SingleValueMapper<Project<Self::Api>>;

    #[storage_mapper("userProjects")]
    fn user_projects(&self, user: &ManagedAddress<Self::Api>) -> UnorderedSetMapper<u64>;

    #[storage_mapper("projectCounter")]
    fn project_counter(&self) -> SingleValueMapper<u64>;

    #[storage_mapper("aiOracleAddress")]
    fn ai_oracle_address(&self) -> SingleValueMapper<ManagedAddress<Self::Api>>;
}

// Project structure
#[derive(TypeAbi, TopEncode, TopDecode, Clone, Debug, PartialEq, Eq)]
pub struct Project<M: ManagedTypeApi> {
    pub id: u64,
    pub owner: ManagedAddress<M>,
    pub name: ManagedBuffer<M>,
    pub description: ManagedBuffer<M>,
    pub project_type: ManagedBuffer<M>,
    pub config: ManagedBuffer<M>,
    pub status: ManagedBuffer<M>,
    pub created_at: u64,
    pub updated_at: u64,
}