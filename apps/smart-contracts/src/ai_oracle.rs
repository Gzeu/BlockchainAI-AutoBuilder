#![no_std]

use multiversx_sc::imports::*;

/// AI Oracle contract for blockchain-AI integration
#[multiversx_sc::contract]
pub trait AiOracleContract {
    #[init]
    fn init(&self, admin: ManagedAddress<Self::Api>) {
        self.admin().set(&admin);
        self.request_counter().set(1u64);
    }

    /// Submit AI generation request
    #[payable("EGLD")]
    #[endpoint(submitAiRequest)]
    fn submit_ai_request(
        &self,
        prompt: ManagedBuffer,
        generation_type: ManagedBuffer,
        callback_contract: ManagedAddress<Self::Api>,
        callback_function: ManagedBuffer,
    ) -> u64 {
        let payment = self.call_value().egld_value();
        let oracle_fee = self.oracle_fee().get();
        
        require!(payment >= oracle_fee, "Insufficient oracle fee");
        
        let request_id = self.request_counter().get();
        let requester = self.blockchain().get_caller();
        
        // Store request
        self.ai_requests(request_id).set(&AiRequest {
            id: request_id,
            requester: requester.clone(),
            prompt: prompt.clone(),
            generation_type: generation_type.clone(),
            callback_contract,
            callback_function,
            status: ManagedBuffer::from(b"PENDING"),
            created_at: self.blockchain().get_block_timestamp(),
            response: ManagedBuffer::new(),
        });
        
        self.request_counter().set(request_id + 1);
        
        // Emit event for off-chain oracle
        self.ai_request_submitted_event(request_id, &requester, &prompt, &generation_type);
        
        request_id
    }

    /// Oracle callback with AI response
    #[only_owner]
    #[endpoint(fulfillAiRequest)]
    fn fulfill_ai_request(&self, request_id: u64, response: ManagedBuffer) {
        let mut request = self.ai_requests(request_id).get();
        
        require!(
            request.status == ManagedBuffer::from(b"PENDING"),
            "Request already fulfilled"
        );
        
        request.status = ManagedBuffer::from(b"FULFILLED");
        request.response = response.clone();
        
        self.ai_requests(request_id).set(&request);
        
        // Call back to requesting contract
        self.call_contract_callback(&request, &response);
        
        self.ai_request_fulfilled_event(request_id, &response);
    }

    /// Set oracle fee
    #[only_owner]
    #[endpoint(setOracleFee)]
    fn set_oracle_fee(&self, fee: BigUint) {
        self.oracle_fee().set(&fee);
    }

    /// Internal callback function
    fn call_contract_callback(&self, request: &AiRequest<Self::Api>, response: &ManagedBuffer) {
        // In a real implementation, this would call the callback contract
        // For now, just emit an event
        self.callback_executed_event(request.id, &request.callback_contract);
    }

    // View functions
    #[view(getAiRequest)]
    fn get_ai_request(&self, request_id: u64) -> AiRequest<Self::Api> {
        self.ai_requests(request_id).get()
    }

    #[view(getOracleFee)]
    fn get_oracle_fee(&self) -> BigUint {
        self.oracle_fee().get()
    }

    #[view(getRequestCounter)]
    fn get_request_counter(&self) -> u64 {
        self.request_counter().get()
    }

    // Events
    #[event("aiRequestSubmitted")]
    fn ai_request_submitted_event(
        &self,
        #[indexed] request_id: u64,
        #[indexed] requester: &ManagedAddress<Self::Api>,
        prompt: &ManagedBuffer,
        generation_type: &ManagedBuffer,
    );

    #[event("aiRequestFulfilled")]
    fn ai_request_fulfilled_event(
        &self,
        #[indexed] request_id: u64,
        response: &ManagedBuffer,
    );

    #[event("callbackExecuted")]
    fn callback_executed_event(
        &self,
        #[indexed] request_id: u64,
        callback_contract: &ManagedAddress<Self::Api>,
    );

    // Storage
    #[storage_mapper("admin")]
    fn admin(&self) -> SingleValueMapper<ManagedAddress<Self::Api>>;

    #[storage_mapper("aiRequests")]
    fn ai_requests(&self, request_id: u64) -> SingleValueMapper<AiRequest<Self::Api>>;

    #[storage_mapper("requestCounter")]
    fn request_counter(&self) -> SingleValueMapper<u64>;

    #[storage_mapper("oracleFee")]
    fn oracle_fee(&self) -> SingleValueMapper<BigUint>;
}

#[derive(TypeAbi, TopEncode, TopDecode, Clone, Debug, PartialEq, Eq)]
pub struct AiRequest<M: ManagedTypeApi> {
    pub id: u64,
    pub requester: ManagedAddress<M>,
    pub prompt: ManagedBuffer<M>,
    pub generation_type: ManagedBuffer<M>,
    pub callback_contract: ManagedAddress<M>,
    pub callback_function: ManagedBuffer<M>,
    pub status: ManagedBuffer<M>,
    pub created_at: u64,
    pub response: ManagedBuffer<M>,
}